# app_interest/urls.py
from django.urls import path
from .views import interest_dashboard, submit_interest

urlpatterns = [
    path('dashboard/', interest_dashboard, name='interest_dashboard'),
    path('', submit_interest, name='submit_interest'),
]
