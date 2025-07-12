from rest_framework import serializers
from .models import Food, Drink

class FoodSerializer(serializers.ModelSerializer):
    # Computed properties
    calories_per_mass = serializers.ReadOnlyField()
    protein_per_mass = serializers.ReadOnlyField()
    carbs_per_mass = serializers.ReadOnlyField()
    fats_per_mass = serializers.ReadOnlyField()
    sugar_per_mass = serializers.ReadOnlyField()  # ✅ Added sugar per mass

    # Ownership flags
    is_global = serializers.SerializerMethodField()
    is_editable = serializers.SerializerMethodField()

    class Meta:
        model = Food
        fields = [
            'id',
            'name',
            'water_percentage',
            'calories_per_gram',
            'protein_per_gram',
            'carbs_per_gram',
            'fats_per_gram',
            'sugar_per_gram',          # ✅ New sugar input field
            'mass',

            # Computed metrics
            'calories_per_mass',
            'protein_per_mass',
            'carbs_per_mass',
            'fats_per_mass',
            'sugar_per_mass',          # ✅ Computed sugar output

            # Flags
            'is_global',
            'is_editable'
        ]

    def get_is_global(self, obj):
        return obj.user is None

    def get_is_editable(self, obj):
        request = self.context.get('request')
        if request and request.user:
            return obj.user == request.user
        return False

class DrinkSerializer(serializers.ModelSerializer):
    # Computed volume-based nutrients
    calories_per_volume = serializers.ReadOnlyField()
    sugar_per_volume = serializers.ReadOnlyField()
    protein_per_volume = serializers.ReadOnlyField()
    carbs_per_volume = serializers.ReadOnlyField()
    fats_per_volume = serializers.ReadOnlyField()

    # Meta flags
    is_global = serializers.SerializerMethodField()
    is_editable = serializers.SerializerMethodField()

    class Meta:
        model = Drink
        fields = [
            'id',
            'name',
            'volume',

            # Nutrients per ml
            'calories_per_ml',
            'sugar_per_ml',
            'protein_per_ml',
            'carbs_per_ml',
            'fats_per_ml',

            # Computed per-volume totals
            'calories_per_volume',
            'sugar_per_volume',
            'protein_per_volume',
            'carbs_per_volume',
            'fats_per_volume',

            # Flags
            'is_global',
            'is_editable'
        ]

    def get_is_global(self, obj):
        return obj.user is None

    def get_is_editable(self, obj):
        request = self.context.get('request')
        if request and request.user:
            return obj.user == request.user
        return False
