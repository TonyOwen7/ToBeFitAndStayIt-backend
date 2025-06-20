# serializers.py
from rest_framework import serializers
from django.contrib.auth import password_validation
from auth_api.models import CustomUser

class UserProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    bmi = serializers.SerializerMethodField()
    bmr = serializers.SerializerMethodField()
    tdee = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'age', 'gender', 'weight', 'height', 'activity_level', 'health_goal',
            'wants_newsletter', 'date_joined', 'bmi', 'bmr', 'tdee'
        ]

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()

    def get_bmi(self, obj):
        if obj.height and obj.weight:
            return round(obj.weight / ((obj.height / 100) ** 2), 2)
        return None

    def get_bmr(self, obj):
        if obj.weight and obj.height and obj.age and obj.gender:
            if obj.gender.lower() == "male":
                return round(10 * obj.weight + 6.25 * obj.height - 5 * obj.age + 5, 2)
            elif obj.gender.lower() == "female":
                return round(10 * obj.weight + 6.25 * obj.height - 5 * obj.age - 161, 2)
        return None

    def get_tdee(self, obj):
        bmr = self.get_bmr(obj)
        if not bmr:
            return None
        factor = {
            "sedentary": 1.2,
            "light": 1.375,
            "moderate": 1.55,
            "active": 1.725,
            "very active": 1.9
        }.get(obj.activity_level.lower(), 1.2)
        return round(bmr * factor, 2)

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['email', 'first_name', 'last_name', 'age', 'gender', 'weight', 'height', 'activity_level', 'health_goal', 'wants_newsletter']

class PasswordChangeSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError("New passwords do not match.")
        password_validation.validate_password(data['new_password'])
        return data

    def save(self, user):
        if not user.check_password(self.validated_data['current_password']):
            raise serializers.ValidationError({'current_password': 'Incorrect password.'})
        user.set_password(self.validated_data['new_password'])
        user.save()
