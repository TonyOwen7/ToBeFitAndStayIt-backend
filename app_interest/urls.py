# app_interest/urls.py
from django.urls import path
from .views import interest_dashboard, submit_interest, update_interest_counts

urlpatterns = [
    path('dashboard/', interest_dashboard, name='interest_dashboard'),
    path('admin/interest/update/', update_interest_counts, name='update-interest-counts'),
    path('', submit_interest, name='submit_interest'),
]
