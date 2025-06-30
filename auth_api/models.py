from django.contrib.auth.models import AbstractUser
from django.db import models
from django.contrib.auth import get_user_model

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
    
    def __str__(self):
        return f"{self.email} - {self.first_name} {self.last_name}"


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

class DailyNutrition(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    date = models.DateField()
    kcal = models.PositiveIntegerField()
    protein = models.FloatField()  # grams
    carbs = models.FloatField()    # grams
    fats = models.FloatField()     # grams

    class Meta:
        unique_together = ['user', 'date']

class DailySleep(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    date = models.DateField()
    time_slept = models.FloatField(help_text="Hours slept")

    class Meta:
        unique_together = ['user', 'date']

class DailyHydration(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    date = models.DateField()
    water_intake = models.FloatField(help_text="Liters")

    class Meta:
        unique_together = ['user', 'date']
