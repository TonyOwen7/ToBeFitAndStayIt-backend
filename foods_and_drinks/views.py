from rest_framework import generics
from .models import Food, Drink
from .serializers import FoodSerializer, DrinkSerializer


# FOOD VIEWS
class FoodListAPIView(generics.ListAPIView):
    queryset = Food.objects.all()
    serializer_class = FoodSerializer

class FoodCreateAPIView(generics.CreateAPIView):
    queryset = Food.objects.all()
    serializer_class = FoodSerializer

class FoodDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Food.objects.all()
    serializer_class = FoodSerializer

# Optional: Separate Delete View
class FoodDeleteAPIView(generics.DestroyAPIView):
    queryset = Food.objects.all()
    serializer_class = FoodSerializer


# DRINK VIEWS
class DrinkListAPIView(generics.ListAPIView):
    queryset = Drink.objects.all()
    serializer_class = DrinkSerializer

class DrinkCreateAPIView(generics.CreateAPIView):
    queryset = Drink.objects.all()
    serializer_class = DrinkSerializer

class DrinkDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Drink.objects.all()
    serializer_class = DrinkSerializer

# Optional: Separate Delete View
class DrinkDeleteAPIView(generics.DestroyAPIView):
    queryset = Drink.objects.all()
    serializer_class = DrinkSerializer
