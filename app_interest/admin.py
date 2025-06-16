from django.contrib import admin
from .models import TipCategory, Tip, AppInterest

class TipInline(admin.TabularInline):
    model = Tip
    extra = 1

@admin.register(TipCategory)
class TipCategoryAdmin(admin.ModelAdmin):
    inlines = [TipInline]
    list_display = ['name', 'tip_count', 'tip_percentage']

@admin.register(AppInterest)
class AppInterestAdmin(admin.ModelAdmin):
    list_display = ['choice', 'timestamp']
    list_filter = ['choice', 'timestamp']
