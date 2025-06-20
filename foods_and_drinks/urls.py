from django.urls import path
from .views import FoodListAPIView, DrinkListAPIView

urlpatterns = [
    path('foods/', FoodListAPIView.as_view(), name='food-list'),
    path('drinks/', DrinkListAPIView.as_view(), name='drink-list'),
]

