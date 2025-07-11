from django.urls import path, include
from .views import RegisterView, LoginView, LogoutView, PasswordResetRequestView, PasswordResetConfirmView, UserProfileAPIView, DeleteAccountView, DataRetentionLog, DataRetentionStatusView, ExtendRetentionView, CustomTokenRefreshView
from rest_framework.routers import DefaultRouter
router = DefaultRouter()
from . import views

# router.register(r'users', views.CustomUserViewSet, basename='users')
# router.register(r'nutrition', views.DailyNutritionViewSet, basename='nutrition')
# router.register(r'sleep', views.DailySleepViewSet, basename='sleep')
# router.register(r'hydration', views.DailyHydrationViewSet, basename='hydration')
# router.register(r'dashboard', views.DashboardViewSet, basename='dashboard')

router.register(r'users', views.CustomUserViewSet, basename='users')
router.register(r'wellness', views.DailyWellnessViewSet, basename='wellness')  # ✅ Unified daily tracking
router.register(r'dashboard', views.DashboardViewSet, basename='dashboard')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('reset-password-request/', PasswordResetRequestView.as_view()),
    path('reset-password/', PasswordResetConfirmView.as_view()), 
    path('user/profile/', UserProfileAPIView.as_view(), name='user-profile'),
    path('user/delete-account/', DeleteAccountView.as_view(), name='delete-account'),
    path('retention-status/', DataRetentionStatusView.as_view(), name='retention-status'),
    path('extend-retention/', ExtendRetentionView.as_view(), name='extend-retention'),

]

