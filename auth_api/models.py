from django.contrib.auth.models import AbstractUser
from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from datetime import timedelta

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    age = models.PositiveIntegerField(null=True, blank=True)
    
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    ]
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True)
    
    weight = models.FloatField(null=True, blank=True, help_text="Weight in kg")
    height = models.FloatField(null=True, blank=True, help_text="Height in cm")
    
    ACTIVITY_LEVEL_CHOICES = [
        ('sedentary', 'Sedentary (little/no exercise)'),
        ('light', 'Light (1-3 days/week)'),
        ('moderate', 'Moderate (3-5 days/week)'),
        ('active', 'Active (6-7 days/week)'),
        ('very-active', 'Very Active (2x/day, intense)'),
    ]

    activity_level = models.CharField(max_length=15, choices=ACTIVITY_LEVEL_CHOICES, blank=True)
    
    CLIMATE_CHOICES = [
    ('normal', 'Normal'),
    ('hot', 'Hot/Humid'),
    ('cold', 'Cold'),
    ]

    climate = models.CharField(max_length=10, choices=CLIMATE_CHOICES, blank=True)

    HEALTH_GOAL_CHOICES = [
        ('weight-loss', 'Lose Weight'),
        ('maintain-weight', 'Maintain Weight'),
        ('weight-gain', 'Gain Weight'),
        ('general-health', 'General-health'),
   ]
    health_goal = models.CharField(max_length=20, choices=HEALTH_GOAL_CHOICES, blank=True)
        
    # Use email as the username field
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    last_activity = models.DateTimeField(default=timezone.now)
    retention_notification_sent = models.DateTimeField(null=True, blank=True)
    data_anonymization_scheduled = models.DateTimeField(null=True, blank=True)
    is_data_anonymized = models.BooleanField(default=False)
    retention_warnings_count = models.PositiveIntegerField(default=0)
    
    
    def __str__(self):
        return f"{self.email} - {self.first_name} {self.last_name}"
    
    
    def update_last_activity(self):
        """Update last activity timestamp"""
        self.last_activity = timezone.now()
        self.save(update_fields=['last_activity'])
    
    def is_inactive(self, months=6):
        """Check if user has been inactive for specified months"""
        inactive_threshold = timezone.now() - timedelta(days=30 * months)
        return self.last_activity < inactive_threshold
    
    def days_since_last_activity(self):
        """Get days since last activity"""
        return (timezone.now() - self.last_activity).days
    
    def should_send_retention_warning(self):
        """Check if retention warning should be sent"""
        if self.is_data_anonymized:
            return False
        
        # Send first warning at 5 months of inactivity
        five_months_ago = timezone.now() - timedelta(days=150)
        
        # Don't send if already sent in last 30 days
        if self.retention_notification_sent:
            thirty_days_ago = timezone.now() - timedelta(days=30)
            if self.retention_notification_sent > thirty_days_ago:
                return False
        
        return self.last_activity < five_months_ago
    
    def should_schedule_anonymization(self):
        """Check if data should be scheduled for anonymization"""
        if self.is_data_anonymized or self.data_anonymization_scheduled:
            return False
        
        # Schedule after 6 months + 30 days grace period
        seven_months_ago = timezone.now() - timedelta(days=210)
        return self.last_activity < seven_months_ago


class DataRetentionLog(models.Model):
    """Log retention actions for audit purposes"""
    ACTION_CHOICES = [
        ('warning_sent', 'Retention Warning Sent'),
        ('final_notice_sent', 'Final Notice Sent'),
        ('data_anonymized', 'Data Anonymized'),
        ('account_reactivated', 'Account Reactivated'),
        ('retention_extended', 'Retention Period Extended'),
    ]
    
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='retention_logs')
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)
    details = models.TextField(blank=True)
    days_inactive = models.PositiveIntegerField()
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.user.email} - {self.action} - {self.timestamp}"


User = get_user_model()
# auth_api/models.py (preferred place)
class PasswordHistory(models.Model):
    user = models.ForeignKey(
        get_user_model(),
        on_delete=models.CASCADE,
        related_name='password_history_entries'  # <== unique name
    )
    password = models.CharField(max_length=128)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']


class DailyWellness(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    date = models.DateField()

    # Nutrition
    kcal = models.PositiveIntegerField()
    protein = models.FloatField(help_text="grams")
    carbs = models.FloatField(help_text="grams")
    fats = models.FloatField(help_text="grams")
    sugar = models.FloatField(default=0.0, help_text="grams")

    # Sleep
    time_slept = models.FloatField(help_text="Hours slept")

    # Hydration
    water_intake = models.FloatField(help_text="Liters")

    # 👤 Profile Snapshot
    gender = models.CharField(max_length=10, choices=[('male', 'Male'), ('female', 'Female')], blank=True, null=True)
    body_weight = models.FloatField(null=True, blank=True)
    age = models.PositiveIntegerField(null=True, blank=True)
    climate = models.CharField(max_length=20, choices=[('normal', 'Normal'), ('hot', 'Hot/Humid'), ('cold', 'Cold')], blank=True, null=True)
    activity_level = models.CharField(max_length=20, choices=[
        ('sedentary', 'Sedentary'), 
        ('light', 'Light'), 
        ('moderate', 'Moderate'), 
        ('active', 'Active'), 
        ('very-active', 'Very Active')
    ], blank=True, null=True)

    class Meta:
        unique_together = ['user', 'date']

    def __str__(self):
        return f"Wellness for {self.user.email} on {self.date}"
