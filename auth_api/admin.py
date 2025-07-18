from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    # Fields to display in the admin list view
    list_display = ('email', 'username', 'first_name', 'last_name', 'age', 'gender', 'is_active', 'date_joined')
    list_filter = ('gender', 'activity_level', 'climate','health_goal', 'is_active', 'date_joined')
    search_fields = ('email', 'username', 'first_name', 'last_name')
    ordering = ('-date_joined',)
    
    # Fields to show in the admin form
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email')}),
        ('Health & Fitness', {'fields': ('age', 'gender', 'weight', 'height', 'activity_level', 'health_goal')}),
        # ('Preferences', {'fields': ('wants_newsletter',)}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    # Fields to show when adding a new user
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2'),
        }),
        ('Personal info', {'fields': ('first_name', 'last_name')}),
        ('Health & Fitness', {'fields': ('age', 'gender', 'weight', 'height', 'activity_level', 'health_goal')}),
    )

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, DailyWellness

@admin.register(DailyWellness)
class DailyWellnessAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'date',
        'gender', 'body_weight', 'age', 'climate', 'activity_level',
        'kcal', 'protein', 'carbs', 'fats', 'sugar',
        'time_slept', 'water_intake'
    ]
    list_filter = [
        'date', 
        'gender', 
        'climate', 
        'activity_level', 
        'user__gender', 
        'user__activity_level'
    ]
    search_fields = ['user__email', 'user__first_name', 'user__last_name']
    date_hierarchy = 'date'
