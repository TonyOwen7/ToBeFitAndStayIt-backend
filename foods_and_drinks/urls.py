from django.urls import path
from . import views

urlpatterns = [
    # Food URLs
    path('foods/', views.FoodListAPIView.as_view(), name='food-list'),
    path('foods/create/', views.FoodCreateAPIView.as_view(), name='food-create'),
    path('foods/<int:pk>/', views.FoodDetailAPIView.as_view(), name='food-detail'),
    path('foods/<int:pk>/delete/', views.FoodDeleteAPIView.as_view(), name='food-delete'),
    
    # Drink URLs
    path('drinks/', views.DrinkListAPIView.as_view(), name='drink-list'),
    path('drinks/create/', views.DrinkCreateAPIView.as_view(), name='drink-create'),
    path('drinks/<int:pk>/', views.DrinkDetailAPIView.as_view(), name='drink-detail'),
    path('drinks/<int:pk>/delete/', views.DrinkDeleteAPIView.as_view(), name='drink-delete'),
    
    # Optional: Combined endpoints
    path('user-foods/', views.UserFoodsAPIView.as_view(), name='user-foods'),
    path('user-drinks/', views.UserDrinksAPIView.as_view(), name='user-drinks'),
]