from rest_framework import serializers
from .models import CustomUser
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True)
    
    class Meta:
        model = CustomUser
        fields = [
            'username', 'email', 'password', 'confirm_password',
            'first_name', 'last_name',
            'age', 'gender', 'weight', 'height',
            'activity_level', 'climate' ,'health_goal',
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True},
            'username': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }
    
    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    def validate_username(self, value):
        if CustomUser.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value
    
    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match.")
        
        # Validate password strength
        validate_password(data['password'])
        
        return data
    
    def create(self, validated_data):
        # Remove confirm_password before creating user
        validated_data.pop('confirm_password')
        
        # Create user with create_user method to ensure password is hashed
        user = CustomUser.objects.create_user(**validated_data)
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")
        
        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError(
                {"non_field_errors": ["Invalid email or password."]}
            )
        
        if not user.check_password(password):
            raise serializers.ValidationError(
                {"non_field_errors": ["Invalid email or password."]}
            )
        
        if not user.is_active:
            raise serializers.ValidationError(
                {"non_field_errors": ["User account is disabled."]}
            )
        
        attrs['user'] = user
        return attrs

from rest_framework import serializers
from .models import CustomUser
from rest_framework import serializers
from .models import CustomUser

class UserProfileSerializer(serializers.ModelSerializer):
    firstName = serializers.CharField(source='first_name', required=False)
    lastName = serializers.CharField(source='last_name', required=False)

    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'firstName', 'lastName',
            'weight', 'gender', 'age', 'height',
            'activity_level', 'climate', 'health_goal'
        ]
        read_only_fields = ['id', 'username', 'email']

    def update(self, instance, validated_data):
        user_fields = validated_data.pop('first_name', None), validated_data.pop('last_name', None)
        if user_fields[0] is not None:
            instance.first_name = user_fields[0]
        if user_fields[1] is not None:
            instance.last_name = user_fields[1]

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
    
from rest_framework_simplejwt.serializers import TokenRefreshSerializer

class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        # Return both access and new refresh (if rotation)
        if self.context.get("request"):
            refresh_token = self.context["request"].data.get("refresh")
            if refresh_token:
                data["refresh"] = refresh_token
        return data


# serializers.py
from rest_framework import serializers
from .models import CustomUser, DailyNutrition, DailySleep, DailyHydration, DailyWellness

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'first_name', 'last_name', 'age', 'gender', 
                 'weight', 'height', 'activity_level', 'climate', 'health_goal']
        read_only_fields = ['id']

class DailyNutritionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyNutrition
        fields = ['id', 'user', 'date', 'kcal', 'protein', 'carbs', 'fats', 'sugar']
        read_only_fields = ['user']

class DailySleepSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailySleep
        fields = ['id', 'user', 'date', 'time_slept']
        read_only_fields = ['user']

class DailyHydrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyHydration
        fields = ['id', 'user', 'date', 'water_intake']
        read_only_fields = ['user']

class DailyWellnessSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyWellness
        fields = [
            'id', 'user', 'date',

            # Nutrition
            'kcal', 'protein', 'carbs', 'fats', 'sugar',

            # Sleep
            'time_slept',

            # Hydration
            'water_intake'
        ]
        read_only_fields = ['user']


# class DashboardSerializer(serializers.Serializer):
#     date = serializers.DateField()
#     nutrition = DailyNutritionSerializer(required=False)
#     sleep = DailySleepSerializer(required=False)
#     hydration = DailyHydrationSerializer(required=False)
    
#     # Recommended values
#     recommended_kcal = serializers.IntegerField(required=False)
#     recommended_protein = serializers.FloatField(required=False)
#     recommended_water = serializers.FloatField(required=False)
#     recommended_sugar = serializers.FloatField(required=False)

#     recommended_sleep = serializers.FloatField(default=8.0)
    
#     # Status indicators
#     nutrition_status = serializers.CharField(required=False)
#     sleep_status = serializers.CharField(required=False)
#     hydration_status = serializers.CharField(required=False)
    
#     # Yesterday comparison
#     yesterday_comparison = serializers.DictField(required=False)

class DashboardSerializer(serializers.Serializer):
    # Core tracking
    date = serializers.DateField()
    wellness = DailyWellnessSerializer(required=False)  # ✅ Unified daily model

    # Recommended goals (all macros)
    recommended_kcal = serializers.IntegerField(required=False)
    recommended_protein = serializers.FloatField(required=False)
    recommended_carbs = serializers.FloatField(required=False)
    recommended_fats = serializers.FloatField(required=False)
    recommended_sugar = serializers.FloatField(required=False)
    recommended_water = serializers.FloatField(required=False)
    recommended_sleep = serializers.FloatField(default=8.0)

    # Status evaluations
    nutrition_status = serializers.CharField(required=False)
    hydration_status = serializers.CharField(required=False)
    sleep_status = serializers.CharField(required=False)

    # Comparative analytics
    yesterday_comparison = serializers.DictField(
        child=serializers.FloatField(),
        required=False,
        default={}
    )
