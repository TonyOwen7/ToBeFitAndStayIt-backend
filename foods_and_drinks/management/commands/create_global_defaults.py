# foods_and_drinks/management/commands/create_global_defaults.py
from django.core.management.base import BaseCommand
from foods_and_drinks.models import Food, Drink

class Command(BaseCommand):
    help = 'Create global default foods and drinks available to all users'

    def handle(self, *args, **options):
        # Check if global items already exist
        if Food.objects.filter(user=None).exists() or Drink.objects.filter(user=None).exists():
            self.stdout.write(self.style.WARNING('Global default items already exist. Skipping creation.'))
            return

        # Default foods with nutritional data
        default_foods = [
            {
                'name': 'Chicken Breast',
                'water_percentage': 65,
                'calories_per_gram': 1.65,
                'protein_per_gram': 0.31,
                'carbs_per_gram': 0,
                'fats_per_gram': 0.036,
                'mass': 100
            },
            {
                'name': 'Brown Rice',
                'water_percentage': 12,
                'calories_per_gram': 1.11,
                'protein_per_gram': 0.026,
                'carbs_per_gram': 0.23,
                'fats_per_gram': 0.009,
                'mass': 100
            },
            {
                'name': 'Broccoli',
                'water_percentage': 89,
                'calories_per_gram': 0.34,
                'protein_per_gram': 0.028,
                'carbs_per_gram': 0.07,
                'fats_per_gram': 0.004,
                'mass': 100
            },
            {
                'name': 'Apple',
                'water_percentage': 85,
                'calories_per_gram': 0.52,
                'protein_per_gram': 0.003,
                'carbs_per_gram': 0.14,
                'fats_per_gram': 0.002,
                'mass': 100
            },
            {
                'name': 'Salmon',
                'water_percentage': 62,
                'calories_per_gram': 2.08,
                'protein_per_gram': 0.20,
                'carbs_per_gram': 0,
                'fats_per_gram': 0.13,
                'mass': 100
            },
            {
                'name': 'Whole Wheat Bread',
                'water_percentage': 38,
                'calories_per_gram': 2.66,
                'protein_per_gram': 0.13,
                'carbs_per_gram': 0.44,
                'fats_per_gram': 0.035,
                'mass': 100
            },
            {
                'name': 'Greek Yogurt',
                'water_percentage': 85,
                'calories_per_gram': 0.59,
                'protein_per_gram': 0.10,
                'carbs_per_gram': 0.036,
                'fats_per_gram': 0.005,
                'mass': 100
            },
            {
                'name': 'Almonds',
                'water_percentage': 4,
                'calories_per_gram': 5.76,
                'protein_per_gram': 0.21,
                'carbs_per_gram': 0.22,
                'fats_per_gram': 0.49,
                'mass': 100
            },
        ]

        # Default drinks with nutritional data
        default_drinks = [
            {
                'name': 'Water',
                'calories_per_ml': 0,
                'sugar_per_ml': 0,
                'volume': 250
            },
            {
                'name': 'Milk',
                'calories_per_ml': 0.64,
                'sugar_per_ml': 0.05,
                'volume': 250
            },
            {
                'name': 'Orange Juice',
                'calories_per_ml': 0.45,
                'sugar_per_ml': 0.08,
                'volume': 250
            },
            {
                'name': 'Protein Shake',
                'calories_per_ml': 0.48,
                'sugar_per_ml': 0.02,
                'volume': 250
            },
            {
                'name': 'Green Tea',
                'calories_per_ml': 0.008,
                'sugar_per_ml': 0,
                'volume': 250
            },
            {
                'name': 'Black Coffee',
                'calories_per_ml': 0.02,
                'sugar_per_ml': 0,
                'volume': 250
            },
            {
                'name': 'Sports Drink',
                'calories_per_ml': 0.20,
                'sugar_per_ml': 0.05,
                'volume': 250
            },
            {
                'name': 'Coconut Water',
                'calories_per_ml': 0.184,
                'sugar_per_ml': 0.03,
                'volume': 250
            },
        ]

        try:
            # Create Food objects (user=None makes them global)
            food_objects = []
            for food_data in default_foods:
                food_objects.append(Food(user=None, **food_data))
            
            if food_objects:
                Food.objects.bulk_create(food_objects)
                self.stdout.write(self.style.SUCCESS(f'Created {len(food_objects)} global food items'))

            # Create Drink objects (user=None makes them global)
            drink_objects = []
            for drink_data in default_drinks:
                drink_objects.append(Drink(user=None, **drink_data))
            
            if drink_objects:
                Drink.objects.bulk_create(drink_objects)
                self.stdout.write(self.style.SUCCESS(f'Created {len(drink_objects)} global drink items'))

            self.stdout.write(self.style.SUCCESS('Successfully created all global default items'))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error creating global default items: {str(e)}'))