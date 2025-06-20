from rest_framework import generics
from .models import Food, Drink
from .serializers import FoodSerializer, DrinkSerializer

class FoodListAPIView(generics.ListAPIView):
    queryset = Food.objects.all()
    serializer_class = FoodSerializer

class DrinkListAPIView(generics.ListAPIView):
    queryset = Drink.objects.all()
    serializer_class = DrinkSerializer

