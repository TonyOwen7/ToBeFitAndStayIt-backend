from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    age = models.PositiveIntegerField(null=True, blank=True)
    gender = models.CharField(max_length=10, blank=True)
    weight = models.FloatField(null=True, blank=True)
    height = models.FloatField(null=True, blank=True)
    activity_level = models.CharField(max_length=30, blank=True)
    health_goal = models.CharField(max_length=30, blank=True)
    wants_newsletter = models.BooleanField(default=False)

    def __str__(self):
        return self.email or self.username
