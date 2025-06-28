from rest_framework import serializers
from .models import Food, Drink

class FoodSerializer(serializers.ModelSerializer):
    # Computed properties
    calories_per_mass = serializers.ReadOnlyField()
    protein_per_mass = serializers.ReadOnlyField()
    carbs_per_mass = serializers.ReadOnlyField()
    fats_per_mass = serializers.ReadOnlyField()
    
    # Show if it's a global item or user's own
    is_global = serializers.SerializerMethodField()
    is_editable = serializers.SerializerMethodField()

    class Meta:
        model = Food
        fields = [
            'id', 'name', 'water_percentage', 'calories_per_gram',
            'protein_per_gram', 'carbs_per_gram', 'fats_per_gram', 'mass',
            'calories_per_mass', 'protein_per_mass', 'carbs_per_mass', 'fats_per_mass',
            'is_global', 'is_editable'
        ]
        # Exclude user field from serialization (handled automatically)
    
    def get_is_global(self, obj):
        return obj.user is None
    
    def get_is_editable(self, obj):
        # Users can only edit their own items, not global ones
        request = self.context.get('request')
        if request and request.user:
            return obj.user == request.user
        return False

class DrinkSerializer(serializers.ModelSerializer):
    # Computed properties
    calories_per_volume = serializers.ReadOnlyField()
    sugar_per_volume = serializers.ReadOnlyField()
    
    # Show if it's a global item or user's own
    is_global = serializers.SerializerMethodField()
    is_editable = serializers.SerializerMethodField()

    class Meta:
        model = Drink
        fields = [
            'id', 'name', 'calories_per_ml', 'sugar_per_ml', 'volume',
            'calories_per_volume', 'sugar_per_volume',
            'is_global', 'is_editable'
        ]
    
    def get_is_global(self, obj):
        return obj.user is None
    
    def get_is_editable(self, obj):
        # Users can only edit their own items, not global ones
        request = self.context.get('request')
        if request and request.user:
            return obj.user == request.user
        return False