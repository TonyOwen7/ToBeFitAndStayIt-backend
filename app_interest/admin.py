from django.contrib import admin
from .models import  AppInterest

@admin.register(AppInterest)
class AppInterestAdmin(admin.ModelAdmin):
    list_display = ['choice', 'timestamp']
    list_filter = ['choice', 'timestamp']
