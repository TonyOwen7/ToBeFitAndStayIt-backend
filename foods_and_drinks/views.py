from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from .models import Food, Drink
from .serializers import FoodSerializer, DrinkSerializer


class UserSpecificMixin:
    """Mixin to filter queryset by user and handle user assignment"""
    permission_classes = [permissions.AllowAny]  # For testing - change back to IsAuthenticated later
    
    def get_queryset(self):
        """Return items - if user not authenticated, return empty queryset for now"""
        print(f"🔍 DEBUG: User authenticated: {self.request.user.is_authenticated}")
        print(f"🔍 DEBUG: User: {self.request.user}")
        
        # TEMPORARY: For testing, return all items regardless of authentication
        # TODO: Remove this and uncomment the authentication check below
        if hasattr(self, 'model'):
            if self.model == Food:
                queryset = Food.objects.all()
                print(f"🍽️ Food queryset count (ALL): {queryset.count()}")
                return queryset
            elif self.model == Drink:
                queryset = Drink.objects.all()
                print(f"🥤 Drink queryset count (ALL): {queryset.count()}")
                return queryset
        
        # UNCOMMENT THIS BLOCK WHEN AUTHENTICATION IS WORKING:
        # if not self.request.user.is_authenticated:
        #     print("❌ User not authenticated, returning empty queryset")
        #     if hasattr(self, 'model'):
        #         return self.model.objects.none()
        #     return super().get_queryset().none()
        
        # If user is authenticated, return user's items + global items
        print(f"✅ User authenticated: {self.request.user.id}")
        
        if hasattr(self, 'model'):
            if self.model == Food:
                queryset = Food.objects.filter(Q(user=self.request.user) | Q(user=None))
                print(f"🍽️ Food queryset count: {queryset.count()}")
                return queryset
            elif self.model == Drink:
                queryset = Drink.objects.filter(Q(user=self.request.user) | Q(user=None))
                print(f"🥤 Drink queryset count: {queryset.count()}")
                return queryset
        
        return super().get_queryset()
    
    def perform_create(self, serializer):
        """Automatically assign the current user when creating new items"""
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            # For testing purposes - save as global item
            serializer.save(user=None)
            
# FOOD VIEWS
class FoodListAPIView(UserSpecificMixin, generics.ListAPIView):
    """List all foods available to the current user (their own + global)"""
    model = Food
    serializer_class = FoodSerializer

class FoodCreateAPIView(UserSpecificMixin, generics.CreateAPIView):
    """Create a new food item for the current user"""
    model = Food
    serializer_class = FoodSerializer

class FoodDetailAPIView(UserSpecificMixin, generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a food item (only user's own items)"""
    model = Food
    serializer_class = FoodSerializer
    
    def get_queryset(self):
        """Only allow access to user's own items for modification/deletion"""
        if not self.request.user.is_authenticated:
            return Food.objects.none()
        return Food.objects.filter(user=self.request.user)

class FoodDeleteAPIView(UserSpecificMixin, generics.DestroyAPIView):
    """Delete a food item (only user's own items)"""
    model = Food
    serializer_class = FoodSerializer
    
    def get_queryset(self):
        """Only allow deletion of user's own items"""
        if not self.request.user.is_authenticated:
            return Food.objects.none()
        return Food.objects.filter(user=self.request.user)

# DRINK VIEWS
class DrinkListAPIView(UserSpecificMixin, generics.ListAPIView):
    """List all drinks available to the current user (their own + global)"""
    model = Drink
    serializer_class = DrinkSerializer

class DrinkCreateAPIView(UserSpecificMixin, generics.CreateAPIView):
    """Create a new drink item for the current user"""
    model = Drink
    serializer_class = DrinkSerializer

class DrinkDetailAPIView(UserSpecificMixin, generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a drink item (only user's own items)"""
    model = Drink
    serializer_class = DrinkSerializer
    
    def get_queryset(self):
        """Only allow access to user's own items for modification/deletion"""
        if not self.request.user.is_authenticated:
            return Drink.objects.none()
        return Drink.objects.filter(user=self.request.user)

class DrinkDeleteAPIView(UserSpecificMixin, generics.DestroyAPIView):
    """Delete a drink item (only user's own items)"""
    model = Drink
    serializer_class = DrinkSerializer
    
    def get_queryset(self):
        """Only allow deletion of user's own items"""
        if not self.request.user.is_authenticated:
            return Drink.objects.none()
        return Drink.objects.filter(user=self.request.user)

# Optional: Combined views for better API organization
class UserFoodsAPIView(UserSpecificMixin, generics.ListCreateAPIView):
    """List user's foods and create new ones"""
    model = Food
    serializer_class = FoodSerializer

class UserDrinksAPIView(UserSpecificMixin, generics.ListCreateAPIView):
    """List user's drinks and create new ones"""
    model = Drink
    serializer_class = DrinkSerializer