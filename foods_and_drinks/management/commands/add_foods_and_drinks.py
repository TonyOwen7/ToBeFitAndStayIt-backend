# seed_foods_and_drinks.py
from django.core.management.base import BaseCommand
from foods_and_drinks.models import Food, Drink

class Command(BaseCommand):
    help = 'Seed foods and drinks with water content and nutritional data'

    def handle(self, *args, **kwargs):
        Food.objects.bulk_create([
            Food(name='Chicken Breast', water_percentage=65, calories_per_gram=1.65, protein_per_gram=0.31, carbs_per_gram=0, fats_per_gram=0.036, mass=100),
            Food(name='Brown Rice', water_percentage=12, calories_per_gram=1.11, protein_per_gram=0.026, carbs_per_gram=0.23, fats_per_gram=0.009, mass=100),
            Food(name='Broccoli', water_percentage=89, calories_per_gram=0.34, protein_per_gram=0.028, carbs_per_gram=0.07, fats_per_gram=0.004, mass=100),
            Food(name='Apple', water_percentage=85, calories_per_gram=0.52, protein_per_gram=0.003, carbs_per_gram=0.14, fats_per_gram=0.002, mass=100),
            Food(name='Salmon', water_percentage=62, calories_per_gram=2.08, protein_per_gram=0.20, carbs_per_gram=0, fats_per_gram=0.13, mass=100),
            Food(name='Whole Wheat Bread', water_percentage=38, calories_per_gram=2.66, protein_per_gram=0.13, carbs_per_gram=0.44, fats_per_gram=0.035, mass=100),
            Food(name='Greek Yogurt', water_percentage=85, calories_per_gram=0.59, protein_per_gram=0.10, carbs_per_gram=0.036, fats_per_gram=0.005, mass=100),
            Food(name='Almonds', water_percentage=4, calories_per_gram=5.76, protein_per_gram=0.21, carbs_per_gram=0.22, fats_per_gram=0.49, mass=100),
        ])

        Drink.objects.bulk_create([
            Drink(name='Water', calories_per_ml=0, sugar_per_ml=0, volume=250),
            Drink(name='Milk', calories_per_ml=0.64, sugar_per_ml=0.05, volume=250),
            Drink(name='Orange Juice', calories_per_ml=0.45, sugar_per_ml=0.08, volume=250),
            Drink(name='Protein Shake', calories_per_ml=0.48, sugar_per_ml=0.02, volume=250),
            Drink(name='Green Tea', calories_per_ml=0.008, sugar_per_ml=0, volume=250),
            Drink(name='Black Coffee', calories_per_ml=0.02, sugar_per_ml=0, volume=250),
            Drink(name='Sports Drink', calories_per_ml=0.20, sugar_per_ml=0.05, volume=250),
            Drink(name='Coconut Water', calories_per_ml=0.184, sugar_per_ml=0.03, volume=250),
        ])

        self.stdout.write(self.style.SUCCESS('💧 Hydration and nutrition data successfully seeded!'))
