from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import Food, Drink
import logging

# Set up logging to help debug
logger = logging.getLogger(__name__)

User = get_user_model()

@receiver(post_save, sender=User)
def create_default_foods_and_drinks(sender, instance, created, **kwargs):
    """
    Create default foods and drinks for newly registered users
    """
    logger.info(f"Signal triggered for user: {instance.email if hasattr(instance, 'email') else instance.username}, created: {created}")
    
    # TEMPORARY: Check if user already has foods/drinks before creating
    if created or (not Food.objects.filter(user=instance).exists() and not Drink.objects.filter(user=instance).exists()):
        try:
            # Default foods with nutritional data
            default_foods = [
                {
                    'name': 'Steak',
                    'water_percentage': 55,
                    'calories_per_gram': 2.5,
                    'protein_per_gram': 0.26,
                    'carbs_per_gram': 0,
                    'fats_per_gram': 0.20,
                    'sugar_per_gram': 0.0,
                    'mass': 100
                },
                {
                    'name': 'Brown Rice',
                    'water_percentage': 12,
                    'calories_per_gram': 1.11,
                    'protein_per_gram': 0.026,
                    'carbs_per_gram': 0.23,
                    'fats_per_gram': 0.009,
                    'sugar_per_gram': 0.01,
                    'mass': 100
                },
                {
                    'name': 'Broccoli',
                    'water_percentage': 89,
                    'calories_per_gram': 0.34,
                    'protein_per_gram': 0.028,
                    'carbs_per_gram': 0.07,
                    'fats_per_gram': 0.004,
                    'sugar_per_gram': 0.015,
                    'mass': 100
                },
                {
                    'name': 'Apple',
                    'water_percentage': 85,
                    'calories_per_gram': 0.52,
                    'protein_per_gram': 0.003,
                    'carbs_per_gram': 0.14,
                    'fats_per_gram': 0.002,
                    'sugar_per_gram': 0.10,
                    'mass': 100
                },
                {
                    'name': 'Salmon',
                    'water_percentage': 62,
                    'calories_per_gram': 2.08,
                    'protein_per_gram': 0.20,
                    'carbs_per_gram': 0,
                    'fats_per_gram': 0.13,
                    'sugar_per_gram': 0.0,
                    'mass': 100
                },
                {
                    'name': 'Whole Wheat Bread',
                    'water_percentage': 38,
                    'calories_per_gram': 2.66,
                    'protein_per_gram': 0.13,
                    'carbs_per_gram': 0.44,
                    'fats_per_gram': 0.035,
                    'sugar_per_gram': 0.05,
                    'mass': 100
                },
                {
                    'name': 'Greek Yogurt',
                    'water_percentage': 85,
                    'calories_per_gram': 0.59,
                    'protein_per_gram': 0.10,
                    'carbs_per_gram': 0.036,
                    'fats_per_gram': 0.005,
                    'sugar_per_gram': 0.035,
                    'mass': 100
                },
                {
                    'name': 'Almonds',
                    'water_percentage': 4,
                    'calories_per_gram': 5.76,
                    'protein_per_gram': 0.21,
                    'carbs_per_gram': 0.22,
                    'fats_per_gram': 0.49,
                    'sugar_per_gram': 0.04,
                    'mass': 100
                },
            ]


            # Default drinks with nutritional data
            default_drinks = [
                {
                    'name': 'Water',
                    'calories_per_ml': 0,
                    'sugar_per_ml': 0,
                    'protein_per_ml': 0,
                    'carbs_per_ml': 0,
                    'fats_per_ml': 0,
                    'volume': 250
                },
                {
                    'name': 'Milk',
                    'calories_per_ml': 0.64,
                    'sugar_per_ml': 0.05,
                    'protein_per_ml': 0.033,
                    'carbs_per_ml': 0.048,
                    'fats_per_ml': 0.035,
                    'volume': 250
                },
                {
                    'name': 'Orange Juice',
                    'calories_per_ml': 0.45,
                    'sugar_per_ml': 0.08,
                    'protein_per_ml': 0.007,
                    'carbs_per_ml': 0.11,
                    'fats_per_ml': 0.001,
                    'volume': 250
                },
                {
                    'name': 'Protein Shake',
                    'calories_per_ml': 0.48,
                    'sugar_per_ml': 0.02,
                    'protein_per_ml': 0.08,
                    'carbs_per_ml': 0.05,
                    'fats_per_ml': 0.01,
                    'volume': 250
                },
                {
                    'name': 'Green Tea',
                    'calories_per_ml': 0.008,
                    'sugar_per_ml': 0,
                    'protein_per_ml': 0,
                    'carbs_per_ml': 0,
                    'fats_per_ml': 0,
                    'volume': 250
                },
                {
                    'name': 'Black Coffee',
                    'calories_per_ml': 0.02,
                    'sugar_per_ml': 0,
                    'protein_per_ml': 0,
                    'carbs_per_ml': 0,
                    'fats_per_ml': 0,
                    'volume': 250
                },
                {
                    'name': 'Sports Drink',
                    'calories_per_ml': 0.20,
                    'sugar_per_ml': 0.05,
                    'protein_per_ml': 0,
                    'carbs_per_ml': 0.06,
                    'fats_per_ml': 0,
                    'volume': 250
                },
                {
                    'name': 'Coconut Water',
                    'calories_per_ml': 0.184,
                    'sugar_per_ml': 0.03,
                    'protein_per_ml': 0.002,
                    'carbs_per_ml': 0.045,
                    'fats_per_ml': 0.001,
                    'volume': 250
                }
            ]


            # Create Food objects for the new user
            food_objects = []
            for food_data in default_foods:
                food_objects.append(Food(user=instance, **food_data))
            
            if food_objects:
                Food.objects.bulk_create(food_objects)
                logger.info(f"Created {len(food_objects)} food items for user {instance}")

            # Create Drink objects for the new user
            drink_objects = []
            for drink_data in default_drinks:
                drink_objects.append(Drink(user=instance, **drink_data))
            
            if drink_objects:
                Drink.objects.bulk_create(drink_objects)
                logger.info(f"Created {len(drink_objects)} drink items for user {instance}")

            print(f"💧 Default foods and drinks created for user: {getattr(instance, 'email', getattr(instance, 'username', str(instance)))}")
            
        except Exception as e:
            logger.error(f"Error creating default items for user {instance}: {str(e)}")
            print(f"❌ Error creating default items: {str(e)}")
    else:
        if created:
            logger.info(f"User {instance} was created but already has food/drink items. Skipping default item creation.")
        else:
            logger.info(f"User {instance} was updated, not created. Skipping default item creation.")