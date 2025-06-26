from django.urls import path
from . import views

urlpatterns = [
    path('reset-password/', views.reset_password, name='reset-password'),
    path('delete-account/', views.delete_account, name='delete-account'),
]
