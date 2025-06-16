from django.db import models

class TipCategory(models.Model):
    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=10, blank=True)

    def __str__(self):
        return self.name

    def tip_count(self):
        return self.tips.count()

    def tip_percentage(self):
        total = Tip.objects.count()
        return (self.tip_count() / total * 100) if total else 0


class Tip(models.Model):
    category = models.ForeignKey(TipCategory, on_delete=models.CASCADE, related_name='tips')
    content = models.TextField()

    def __str__(self):
        return self.content[:50]


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
