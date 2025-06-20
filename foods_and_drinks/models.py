from django.db import models

class Food(models.Model):
    name = models.CharField(max_length=100)
    calories_per_mass = models.FloatField(help_text="Calories per given mass")
    mass = models.FloatField(help_text="Mass in grams for which calories apply")
    water_percentage = models.FloatField(help_text="Percentage of water content")

    def __str__(self):
        return self.name

class Drink(models.Model):
    name = models.CharField(max_length=100)
    calories_per_volume = models.FloatField(help_text="Calories per given volume")
    volume = models.FloatField(help_text="Volume in ml for which calories apply")

    def __str__(self):
        return self.name
