from django.core.management.base import BaseCommand
from foods_and_drinks.models import Food, Drink

class Command(BaseCommand):
    help = 'Seed foods and drinks using the extended Angular mock data'

    def handle(self, *args, **kwargs):
        Food.objects.bulk_create([
            Food(name='Apple', calories_per_mass=52, mass=100, water_percentage=86),
            Food(name='Watermelon', calories_per_mass=30, mass=100, water_percentage=92),
            Food(name='Orange', calories_per_mass=47, mass=100, water_percentage=87),
            Food(name='Cucumber', calories_per_mass=16, mass=100, water_percentage=95),
            Food(name='Tomato', calories_per_mass=18, mass=100, water_percentage=94),
            Food(name='Lettuce', calories_per_mass=15, mass=100, water_percentage=96),
            Food(name='Strawberries', calories_per_mass=32, mass=100, water_percentage=91),
            Food(name='Peach', calories_per_mass=39, mass=100, water_percentage=89),
        ])

        Drink.objects.bulk_create([
            Drink(name='Pure Water', calories_per_volume=0, volume=250),
            Drink(name='Green Tea', calories_per_volume=2, volume=250),
            Drink(name='Black Coffee', calories_per_volume=5, volume=250),
            Drink(name='Orange Juice', calories_per_volume=112, volume=250),
            Drink(name='Apple Juice', calories_per_volume=117, volume=250),
            Drink(name='Sports Drink', calories_per_volume=50, volume=250),
            Drink(name='Coconut Water', calories_per_volume=46, volume=250),
            Drink(name='Herbal Tea', calories_per_volume=0, volume=250),
        ])

        self.stdout.write(self.style.SUCCESS('Extended foods and drinks seeded!'))
