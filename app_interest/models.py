from django.db import models


class AppInterest(models.Model):
    INTEREST_CHOICES = [
        ('yes', 'Yes, I\'d like an app!'),
        ('maybe', 'Maybe, tell me more'),
        ('no', 'No, web version is fine'),
    ]
    choice = models.CharField(max_length=10, choices=INTEREST_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.get_choice_display()
