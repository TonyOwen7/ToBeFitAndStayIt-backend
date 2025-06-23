from django.urls import path
from .views import (
    FoodListAPIView, FoodCreateAPIView, FoodDetailAPIView, FoodDeleteAPIView,
    DrinkListAPIView, DrinkCreateAPIView, DrinkDetailAPIView, DrinkDeleteAPIView
)

urlpatterns = [
    # Food URLs
    path('foods/', FoodListAPIView.as_view(), name='food-list'),
    path('foods/create/', FoodCreateAPIView.as_view(), name='food-create'),
    path('foods/<int:pk>/', FoodDetailAPIView.as_view(), name='food-detail'),
    path('foods/<int:pk>/delete/', FoodDeleteAPIView.as_view(), name='food-delete'),  # optional

    # Drink URLs
    path('drinks/', DrinkListAPIView.as_view(), name='drink-list'),
    path('drinks/create/', DrinkCreateAPIView.as_view(), name='drink-create'),
    path('drinks/<int:pk>/', DrinkDetailAPIView.as_view(), name='drink-detail'),
    path('drinks/<int:pk>/delete/', DrinkDeleteAPIView.as_view(), name='drink-delete'),  # optional
]
