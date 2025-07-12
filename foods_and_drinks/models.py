# models.py
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Food(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='foods',
        null=True,
        blank=True,
        help_text="Null means available to all users"
    )
    name = models.CharField(max_length=100)
    water_percentage = models.FloatField(default=0.0, help_text="Percentage of water content in the food")

    # Macronutrients per gram
    calories_per_gram = models.FloatField(default=0.0, help_text="Calories per gram")
    protein_per_gram = models.FloatField(default=0.0, help_text="Protein content per gram")
    carbs_per_gram = models.FloatField(default=0.0, help_text="Carbohydrate content per gram")
    fats_per_gram = models.FloatField(default=0.0, help_text="Fat content per gram")
    sugar_per_gram = models.FloatField(default=0.0, help_text="Sugar content per gram")  # ✅ Added sugar field

    mass = models.FloatField(default=100.0, help_text="Reference mass in grams for display purposes")

    def __str__(self):
        return f"{self.name} ({self.user.email if self.user else 'Global'})"

    # Computed properties
    @property
    def calories_per_mass(self):
        return self.calories_per_gram * self.mass

    @property
    def protein_per_mass(self):
        return self.protein_per_gram * self.mass

    @property
    def carbs_per_mass(self):
        return self.carbs_per_gram * self.mass

    @property
    def fats_per_mass(self):
        return self.fats_per_gram * self.mass

    @property
    def sugar_per_mass(self):
        return self.sugar_per_gram * self.mass  # ✅ Computed sugar


class Drink(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='drinks',
        null=True,
        blank=True,
        help_text="Null means available to all users"
    )
    name = models.CharField(max_length=100)

    # Nutrients per ml
    calories_per_ml = models.FloatField(default=0.0, help_text="Calories per milliliter")
    sugar_per_ml = models.FloatField(default=0.0, help_text="Sugar content per milliliter")
    protein_per_ml = models.FloatField(default=0.0, help_text="Protein per milliliter")
    carbs_per_ml = models.FloatField(default=0.0, help_text="Carbohydrates per milliliter")
    fats_per_ml = models.FloatField(default=0.0, help_text="Fats per milliliter")

    volume = models.FloatField(default=250.0, help_text="Reference volume in ml for display purposes")

    def __str__(self):
        return f"{self.name} ({self.user.email if self.user else 'Global'})"

    # Computed totals
    @property
    def calories_per_volume(self):
        return self.calories_per_ml * self.volume

    @property
    def sugar_per_volume(self):
        return self.sugar_per_ml * self.volume

    @property
    def protein_per_volume(self):
        return self.protein_per_ml * self.volume

    @property
    def carbs_per_volume(self):
        return self.carbs_per_ml * self.volume

    @property
    def fats_per_volume(self):
        return self.fats_per_ml * self.volume
