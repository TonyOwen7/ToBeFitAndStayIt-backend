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
        ('sedentary', 'Sedentary'),
        ('light', 'Light Activity'),
        ('moderate', 'Moderate Activity'),
        ('active', 'Very Active'),
        ('very-active', 'Extremely Active'),
    ]
    activity_level = models.CharField(max_length=15, choices=ACTIVITY_LEVEL_CHOICES, blank=True)
    
    HEALTH_GOAL_CHOICES = [
        ('weight-loss', 'Lose Weight'),
        ('maintain-weight', 'Maintain Weight'),
        ('weight-gain', 'Gain Weight'),
        ('general-health', 'General-health'),
   ]
    health_goal = models.CharField(max_length=20, choices=HEALTH_GOAL_CHOICES, blank=True)
    
    wants_newsletter = models.BooleanField(default=False)
    
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
