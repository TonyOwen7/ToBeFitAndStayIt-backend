from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer, LoginSerializer
from django.contrib.auth import get_user_model
import logging

logger = logging.getLogger(__name__)
User = get_user_model()

class RegisterView(APIView):
    def post(self, request):
        logger.info(f"Registration attempt with data: {request.data}")
        
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user = serializer.save()
                logger.info(f"User created successfully: {user.email}")
                
                # Auto-login after registration by creating tokens
                refresh = RefreshToken.for_user(user)
                
                response_data = {
                    "message": "Registration successful!",
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                    "user": {
                        "id": user.id,
                        "email": user.email,
                        "username": user.username,
                        "first_name": user.first_name,
                        "last_name": user.last_name,
                        "age": user.age,
                        "gender": user.gender,
                        "weight": user.weight,
                        "height": user.height,
                        "activity_level": user.activity_level,
                        "health_goal": user.health_goal,
                        "wants_newsletter": user.wants_newsletter,
                    }
                }
                
                return Response(response_data, status=status.HTTP_201_CREATED)
                
            except Exception as e:
                logger.error(f"Error creating user: {str(e)}")
                return Response(
                    {"error": "Failed to create user account"}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        logger.warning(f"Registration failed with errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        logger.info(f"Login attempt for email: {request.data.get('email')}")
        
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            
            response_data = {
                'message': 'Login successful',
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'age': user.age,
                    'gender': user.gender,
                    'weight': user.weight,
                    'height': user.height,
                    'activity_level': user.activity_level,
                    'health_goal': user.health_goal,
                    'wants_newsletter': user.wants_newsletter,
                }
            }
            
            logger.info(f"Login successful for user: {user.email}")
            return Response(response_data, status=status.HTTP_200_OK)
        
        logger.warning(f"Login failed with errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)

    
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
class LogoutView(APIView):
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()  # Blacklist the refresh token
            return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)
        except TokenError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)
        

from django.contrib.auth import get_user_model
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

User = get_user_model()
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags

class PasswordResetRequestView(APIView):
    def post(self, request):
        email = request.data.get('email')

        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'message': 'If your email is registered, you will receive a reset link shortly.'})

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_link = f"http://localhost:4200/reset-password/{uid}/{token}/"

        subject = "Reset your password"
        
        html_content = f"""
        <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:20px;padding:30px;
                    font-family:sans-serif;border:1px solid #ffd700;box-shadow:0 10px 30px rgba(0,0,0,0.1)">
          <h2 style="color:#ffa500;margin-bottom:10px">Hello {user.first_name or 'there'},</h2>
          <p style="font-size:16px;color:#333;margin-bottom:20px">
            You recently requested to reset your password for your account.
            Click the button below to proceed:
          </p>
          <a href="{reset_link}" style="display:inline-block;padding:14px 22px;margin:10px 0;
            background:linear-gradient(135deg, #8bc34a, #689f38);color:white;text-decoration:none;
            border-radius:50px;font-weight:bold;font-size:16px;">Reset Password</a>
          <p style="font-size:14px;color:#666;margin-top:20px">
            If you didn’t request this, you can safely ignore this email.
          </p>
          <p style="font-size:13px;color:#aaa;margin-top:30px;border-top:1px solid #eee;padding-top:10px">
            Thanks,<br>The ToBeFitAndStayIt Team
          </p>
        </div>
        """
        text_content = strip_tags(html_content)

        msg = EmailMultiAlternatives(subject, text_content, "moubouyitony@gmail.com", [email])
        msg.attach_alternative(html_content, "text/html")
        msg.send(fail_silently=False)

        return Response({'message': 'If your email is registered, you will receive a reset link shortly.'}, status=status.HTTP_200_OK)


from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.hashers import check_password
from django.utils.encoding import force_str
from rest_framework_simplejwt.tokens import RefreshToken
from .models import PasswordHistory
from django.contrib.auth.hashers import check_password, make_password

class PasswordResetConfirmView(APIView):
    def post(self, request):
        uidb64 = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('new_password')

        if not uidb64 or not token or not new_password:
            return Response({'message': 'Missing parameters'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (User.DoesNotExist, ValueError, TypeError, OverflowError):
            return Response({'message': 'Invalid reset link'}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({'message': 'Token is invalid or expired'}, status=status.HTTP_400_BAD_REQUEST)

        if check_password(new_password, user.password):
            return Response({'message': 'New password cannot be the same as the old password'}, status=status.HTTP_400_BAD_REQUEST)

        # ✅ Check against password history
        previous_passwords = PasswordHistory.objects.filter(user=user).values_list('password', flat=True)
        for old_hashed in previous_passwords:
            if check_password(new_password, old_hashed):
                return Response({'message': 'You cannot reuse a previously used password'}, status=status.HTTP_400_BAD_REQUEST)

        # Save password + history
        user.set_password(new_password)
        user.save()
        PasswordHistory.objects.create(user=user, password=user.password)

        refresh = RefreshToken.for_user(user)
        return Response({
            'message': 'Password reset successful',
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'email': user.email,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
            }
        }, status=status.HTTP_200_OK)
