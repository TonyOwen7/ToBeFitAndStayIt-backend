from django.urls import path
from .views import RegisterView, LoginView, LogoutView, PasswordResetRequestView, PasswordResetConfirmView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('reset-password-request/', PasswordResetRequestView.as_view()),
    path('reset-password/', PasswordResetConfirmView.as_view()), 
]

