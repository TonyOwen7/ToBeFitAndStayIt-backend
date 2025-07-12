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
                        # "wants_newsletter": user.wants_newsletter,
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

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import LoginSerializer
import logging

logger = logging.getLogger(__name__)

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
        reset_link = f"http://localhost:4200/auth/reset-password/{uid}/{token}/"

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


from .serializers import UserProfileSerializer
from .serializers import UserProfileSerializer

class UserProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserProfileSerializer(
            request.user, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
from rest_framework_simplejwt.views import TokenRefreshView
from .serializers import CustomTokenRefreshSerializer

class CustomTokenRefreshView(TokenRefreshView):
    serializer_class = CustomTokenRefreshSerializer



from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from django.contrib.auth.tokens import default_token_generator

class DeleteAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        current_password = request.data.get("current_password")
        uidb64 = request.data.get("uid")
        token = request.data.get("token")

        if not current_password or not uidb64 or not token:
            return Response({"message": "Missing parameters"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (User.DoesNotExist, ValueError, TypeError):
            return Response({"message": "Invalid user identifier"}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({"message": "Token is invalid or expired"}, status=status.HTTP_400_BAD_REQUEST)

        if not check_password(current_password, user.password):
            return Response({"message": "Incorrect password"}, status=status.HTTP_400_BAD_REQUEST)

        user.delete()
        return Response({"message": "Account deleted successfully"}, status=status.HTTP_200_OK)


# views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from django.utils import timezone
from datetime import datetime, timedelta, date
from collections import defaultdict
from .models import CustomUser, DailyNutrition, DailySleep, DailyHydration, DailyWellness
from .serializers import (
    CustomUserSerializer, DailyNutritionSerializer, DailySleepSerializer,
    DailyHydrationSerializer, DailyWellnessSerializer, DashboardSerializer
)

class CustomUserViewSet(viewsets.ModelViewSet):
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return CustomUser.objects.filter(id=self.request.user.id)

class DailyNutritionViewSet(viewsets.ModelViewSet):
    serializer_class = DailyNutritionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return DailyNutrition.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class DailySleepViewSet(viewsets.ModelViewSet):
    serializer_class = DailySleepSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return DailySleep.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class DailyHydrationViewSet(viewsets.ModelViewSet):
    serializer_class = DailyHydrationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return DailyHydration.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class DailyWellnessViewSet(viewsets.ModelViewSet):
    serializer_class = DailyWellnessSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return DailyWellness.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# class DashboardViewSet(viewsets.ViewSet):
#     permission_classes = [IsAuthenticated]
    
#     def get_or_create_daily_data(self, user, target_date):
#         """Get or create daily data, copying from previous day if not exists"""
#         nutrition = DailyNutrition.objects.filter(user=user, date=target_date).first()
#         sleep = DailySleep.objects.filter(user=user, date=target_date).first()
#         hydration = DailyHydration.objects.filter(user=user, date=target_date).first()
        
#         # If data doesn't exist for target date, copy from previous day
#         if not nutrition:
#             prev_nutrition = DailyNutrition.objects.filter(
#                 user=user, date__lt=target_date
#             ).order_by('-date').first()
#             if prev_nutrition:
#                 nutrition = DailyNutrition.objects.create(
#                     user=user,
#                     date=target_date,
#                     kcal=prev_nutrition.kcal,
#                     protein=prev_nutrition.protein,
#                     carbs=prev_nutrition.carbs,
#                     fats=prev_nutrition.fats
#                 )
        
#         if not sleep:
#             prev_sleep = DailySleep.objects.filter(
#                 user=user, date__lt=target_date
#             ).order_by('-date').first()
#             if prev_sleep:
#                 sleep = DailySleep.objects.create(
#                     user=user,
#                     date=target_date,
#                     time_slept=prev_sleep.time_slept
#                 )
        
#         if not hydration:
#             prev_hydration = DailyHydration.objects.filter(
#                 user=user, date__lt=target_date
#             ).order_by('-date').first()
#             if prev_hydration:
#                 hydration = DailyHydration.objects.create(
#                     user=user,
#                     date=target_date,
#                     water_intake=prev_hydration.water_intake
#                 )
        
#         return nutrition, sleep, hydration
    
#     def get_status(self, actual, recommended, tolerance=0.1):
#         """Get status based on actual vs recommended values"""
#         if actual is None or recommended is None:
#             return "no_data"
        
#         if actual >= recommended * (1 - tolerance):
#             return "good"
#         else:
#             return "needs_improvement"
    
#     def get_yesterday_comparison(self, user, target_date):
#         """Compare yesterday's intake with recommended values"""
#         yesterday = target_date - timedelta(days=1)
        
#         nutrition = DailyNutrition.objects.filter(user=user, date=yesterday).first()
#         sleep = DailySleep.objects.filter(user=user, date=yesterday).first()
#         hydration = DailyHydration.objects.filter(user=user, date=yesterday).first()
        
#         recommended_kcal = user.calculate_daily_calories()
#         recommended_protein = user.calculate_protein_needs()
#         recommended_water = user.calculate_water_needs()
#         recommended_sleep = 8.0
        
#         comparison = {
#             'date': yesterday,
#             'nutrition': {
#                 'status': self.get_status(
#                     nutrition.kcal if nutrition else None, 
#                     recommended_kcal
#                 ),
#                 'actual': nutrition.kcal if nutrition else None,
#                 'recommended': recommended_kcal,
#                 'improvement_needed': []
#             },
#             'sleep': {
#                 'status': self.get_status(
#                     sleep.time_slept if sleep else None, 
#                     recommended_sleep
#                 ),
#                 'actual': sleep.time_slept if sleep else None,
#                 'recommended': recommended_sleep,
#                 'improvement_needed': []
#             },
#             'hydration': {
#                 'status': self.get_status(
#                     hydration.water_intake if hydration else None, 
#                     recommended_water
#                 ),
#                 'actual': hydration.water_intake if hydration else None,
#                 'recommended': recommended_water,
#                 'improvement_needed': []
#             }
#         }
        
#         # Add improvement suggestions
#         if comparison['nutrition']['status'] == 'needs_improvement':
#             if nutrition and recommended_kcal:
#                 deficit = recommended_kcal - nutrition.kcal
#                 comparison['nutrition']['improvement_needed'].append(
#                     f"Increase calorie intake by {deficit} kcal"
#                 )
        
#         if comparison['sleep']['status'] == 'needs_improvement':
#             if sleep:
#                 deficit = recommended_sleep - sleep.time_slept
#                 comparison['sleep']['improvement_needed'].append(
#                     f"Increase sleep by {deficit:.1f} hours"
#                 )
        
#         if comparison['hydration']['status'] == 'needs_improvement':
#             if hydration and recommended_water:
#                 deficit = recommended_water - hydration.water_intake
#                 comparison['hydration']['improvement_needed'].append(
#                     f"Increase water intake by {deficit:.1f} liters"
#                 )
        
#         return comparison
    
#     @action(detail=False, methods=['get'])
#     def daily(self, request):
#         """Get dashboard data for a specific date"""
#         date_str = request.query_params.get('date', str(date.today()))
#         try:
#             target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
#         except ValueError:
#             return Response(
#                 {'error': 'Invalid date format. Use YYYY-MM-DD'}, 
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         user = request.user
#         nutrition, sleep, hydration = self.get_or_create_daily_data(user, target_date)
        
#         # Get recommended values
#         recommended_kcal = user.calculate_daily_calories()
#         recommended_protein = user.calculate_protein_needs()
#         recommended_water = user.calculate_water_needs()
#         recommended_sleep = 8.0
        
#         # Get yesterday comparison
#         yesterday_comparison = self.get_yesterday_comparison(user, target_date)
        
#         data = {
#             'date': target_date,
#             'nutrition': DailyNutritionSerializer(nutrition).data if nutrition else None,
#             'sleep': DailySleepSerializer(sleep).data if sleep else None,
#             'hydration': DailyHydrationSerializer(hydration).data if hydration else None,
#             'recommended_kcal': recommended_kcal,
#             'recommended_protein': recommended_protein,
#             'recommended_water': recommended_water,
#             'recommended_sleep': recommended_sleep,
#             'nutrition_status': self.get_status(
#                 nutrition.kcal if nutrition else None, 
#                 recommended_kcal
#             ),
#             'sleep_status': self.get_status(
#                 sleep.time_slept if sleep else None, 
#                 recommended_sleep
#             ),
#             'hydration_status': self.get_status(
#                 hydration.water_intake if hydration else None, 
#                 recommended_water
#             ),
#             'yesterday_comparison': yesterday_comparison
#         }
        
#         serializer = DashboardSerializer(data)
#         return Response(serializer.data)
    
#     @action(detail=False, methods=['get'])
#     def period(self, request):
#         """Get dashboard data for a period (days, months, years)"""
#         start_date_str = request.query_params.get('start_date')
#         end_date_str = request.query_params.get('end_date')
#         period_type = request.query_params.get('period_type', 'days')  # days, months, years
        
#         if not start_date_str or not end_date_str:
#             return Response(
#                 {'error': 'start_date and end_date are required'}, 
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         try:
#             start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
#             end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
#         except ValueError:
#             return Response(
#                 {'error': 'Invalid date format. Use YYYY-MM-DD'}, 
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         user = request.user
        
#         # Get all data in the period
#         nutrition_data = DailyNutrition.objects.filter(
#             user=user, date__range=[start_date, end_date]
#         ).order_by('date')
        
#         sleep_data = DailySleep.objects.filter(
#             user=user, date__range=[start_date, end_date]
#         ).order_by('date')
        
#         hydration_data = DailyHydration.objects.filter(
#             user=user, date__range=[start_date, end_date]
#         ).order_by('date')
        
#         # Group data by period type
#         if period_type == 'days':
#             # Return daily data
#             data = []
#             current_date = start_date
#             while current_date <= end_date:
#                 nutrition = nutrition_data.filter(date=current_date).first()
#                 sleep = sleep_data.filter(date=current_date).first()
#                 hydration = hydration_data.filter(date=current_date).first()
                
#                 data.append({
#                     'date': current_date,
#                     'nutrition': DailyNutritionSerializer(nutrition).data if nutrition else None,
#                     'sleep': DailySleepSerializer(sleep).data if sleep else None,
#                     'hydration': DailyHydrationSerializer(hydration).data if hydration else None,
#                 })
#                 current_date += timedelta(days=1)
        
#         elif period_type == 'months':
#             # Group by month and calculate averages
#             monthly_data = defaultdict(lambda: {
#                 'nutrition': [], 'sleep': [], 'hydration': [], 'dates': []
#             })
            
#             for item in nutrition_data:
#                 key = f"{item.date.year}-{item.date.month:02d}"
#                 monthly_data[key]['nutrition'].append(item)
#                 monthly_data[key]['dates'].append(item.date)
            
#             for item in sleep_data:
#                 key = f"{item.date.year}-{item.date.month:02d}"
#                 monthly_data[key]['sleep'].append(item)
            
#             for item in hydration_data:
#                 key = f"{item.date.year}-{item.date.month:02d}"
#                 monthly_data[key]['hydration'].append(item)
            
#             data = []
#             for month_key, month_data in monthly_data.items():
#                 year, month = map(int, month_key.split('-'))
                
#                 avg_nutrition = None
#                 if month_data['nutrition']:
#                     avg_kcal = sum(n.kcal for n in month_data['nutrition']) / len(month_data['nutrition'])
#                     avg_protein = sum(n.protein for n in month_data['nutrition']) / len(month_data['nutrition'])
#                     avg_carbs = sum(n.carbs for n in month_data['nutrition']) / len(month_data['nutrition'])
#                     avg_fats = sum(n.fats for n in month_data['nutrition']) / len(month_data['nutrition'])
#                     avg_nutrition = {
#                         'kcal': round(avg_kcal),
#                         'protein': round(avg_protein, 1),
#                         'carbs': round(avg_carbs, 1),
#                         'fats': round(avg_fats, 1)
#                     }
                
#                 avg_sleep = None
#                 if month_data['sleep']:
#                     avg_sleep = sum(s.time_slept for s in month_data['sleep']) / len(month_data['sleep'])
#                     avg_sleep = round(avg_sleep, 1)
                
#                 avg_hydration = None
#                 if month_data['hydration']:
#                     avg_hydration = sum(h.water_intake for h in month_data['hydration']) / len(month_data['hydration'])
#                     avg_hydration = round(avg_hydration, 1)
                
#                 data.append({
#                     'period': f"{year}-{month:02d}",
#                     'year': year,
#                     'month': month,
#                     'nutrition': avg_nutrition,
#                     'sleep': avg_sleep,
#                     'hydration': avg_hydration,
#                 })
        
#         return Response({
#             'period_type': period_type,
#             'start_date': start_date,
#             'end_date': end_date,
#             'data': data
#         })
    

class DashboardViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    
    def get_or_create_daily_data(self, user, target_date):
        """Get or create daily wellness data, copying from previous day if not exists"""
        wellness = DailyWellness.objects.filter(user=user, date=target_date).first()
        
        # If data doesn't exist for target date, copy from previous day
        if not wellness:
            prev_wellness = DailyWellness.objects.filter(
                user=user, date__lt=target_date
            ).order_by('-date').first()
            
            if prev_wellness:
                wellness = DailyWellness.objects.create(
                    user=user,
                    date=target_date,
                    kcal=prev_wellness.kcal,
                    protein=prev_wellness.protein,
                    carbs=prev_wellness.carbs,
                    fats=prev_wellness.fats,
                    sugar=prev_wellness.sugar,
                    time_slept=prev_wellness.time_slept,
                    water_intake=prev_wellness.water_intake
                )
        
        return wellness
    
    def get_status(self, actual, recommended, tolerance=0.1):
        """Get status based on actual vs recommended values"""
        if actual is None or recommended is None:
            return "no_data"
        
        if actual >= recommended * (1 - tolerance):
            return "good"
        else:
            return "needs_improvement"
    
    def get_yesterday_comparison(self, user, target_date):
        """Compare yesterday's intake with recommended values"""
        yesterday = target_date - timedelta(days=1)
        
        wellness = DailyWellness.objects.filter(user=user, date=yesterday).first()
        
        recommended_kcal = user.calculate_daily_calories()
        recommended_protein = user.calculate_protein_needs()
        recommended_water = user.calculate_water_needs()
        recommended_sleep = 8.0
        
        comparison = {
            'date': yesterday,
            'nutrition': {
                'status': self.get_status(
                    wellness.kcal if wellness else None, 
                    recommended_kcal
                ),
                'actual': wellness.kcal if wellness else None,
                'recommended': recommended_kcal,
                'improvement_needed': []
            },
            'sleep': {
                'status': self.get_status(
                    wellness.time_slept if wellness else None, 
                    recommended_sleep
                ),
                'actual': wellness.time_slept if wellness else None,
                'recommended': recommended_sleep,
                'improvement_needed': []
            },
            'hydration': {
                'status': self.get_status(
                    wellness.water_intake if wellness else None, 
                    recommended_water
                ),
                'actual': wellness.water_intake if wellness else None,
                'recommended': recommended_water,
                'improvement_needed': []
            }
        }
        
        # Add improvement suggestions
        if comparison['nutrition']['status'] == 'needs_improvement':
            if wellness and recommended_kcal:
                deficit = recommended_kcal - wellness.kcal
                comparison['nutrition']['improvement_needed'].append(
                    f"Increase calorie intake by {deficit} kcal"
                )
        
        if comparison['sleep']['status'] == 'needs_improvement':
            if wellness:
                deficit = recommended_sleep - wellness.time_slept
                comparison['sleep']['improvement_needed'].append(
                    f"Increase sleep by {deficit:.1f} hours"
                )
        
        if comparison['hydration']['status'] == 'needs_improvement':
            if wellness and recommended_water:
                deficit = recommended_water - wellness.water_intake
                comparison['hydration']['improvement_needed'].append(
                    f"Increase water intake by {deficit:.1f} liters"
                )
        
        return comparison
    
    @action(detail=False, methods=['get'])
    def daily(self, request):
        """Get dashboard data for a specific date"""
        date_str = request.query_params.get('date', str(date.today()))
        try:
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'error': 'Invalid date format. Use YYYY-MM-DD'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = request.user
        wellness = self.get_or_create_daily_data(user, target_date)
        
        # Get recommended values
        recommended_kcal = user.calculate_daily_calories()
        recommended_protein = user.calculate_protein_needs()
        recommended_water = user.calculate_water_needs()
        recommended_sleep = 8.0
        
        # Get yesterday comparison
        yesterday_comparison = self.get_yesterday_comparison(user, target_date)
        
        data = {
            'date': target_date,
            'wellness': DailyWellnessSerializer(wellness).data if wellness else None,
            'recommended_kcal': recommended_kcal,
            'recommended_protein': recommended_protein,
            'recommended_water': recommended_water,
            'recommended_sleep': recommended_sleep,
            'nutrition_status': self.get_status(
                wellness.kcal if wellness else None, 
                recommended_kcal
            ),
            'sleep_status': self.get_status(
                wellness.time_slept if wellness else None, 
                recommended_sleep
            ),
            'hydration_status': self.get_status(
                wellness.water_intake if wellness else None, 
                recommended_water
            ),
            'yesterday_comparison': yesterday_comparison
        }
        
        return Response(data)
    
    @action(detail=False, methods=['get'])
    def period(self, request):
        """Get dashboard data for a period (days, months, years)"""
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')
        period_type = request.query_params.get('period_type', 'days')  # days, months, years
        
        if not start_date_str or not end_date_str:
            return Response(
                {'error': 'start_date and end_date are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'error': 'Invalid date format. Use YYYY-MM-DD'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = request.user
        
        # Get all wellness data in the period
        wellness_data = DailyWellness.objects.filter(
            user=user, date__range=[start_date, end_date]
        ).order_by('date')
        
        # Group data by period type
        if period_type == 'days':
            # Return daily data
            data = []
            current_date = start_date
            while current_date <= end_date:
                wellness = wellness_data.filter(date=current_date).first()
                
                data.append({
                    'date': current_date,
                    'wellness': DailyWellnessSerializer(wellness).data if wellness else None,
                })
                current_date += timedelta(days=1)
        
        elif period_type == 'months':
            # Group by month and calculate averages
            monthly_data = defaultdict(lambda: {
                'wellness': [], 'dates': []
            })
            
            for item in wellness_data:
                key = f"{item.date.year}-{item.date.month:02d}"
                monthly_data[key]['wellness'].append(item)
                monthly_data[key]['dates'].append(item.date)
            
            data = []
            for month_key, month_data in monthly_data.items():
                year, month = map(int, month_key.split('-'))
                
                avg_wellness = None
                if month_data['wellness']:
                    wellness_items = month_data['wellness']
                    count = len(wellness_items)
                    
                    avg_wellness = {
                        'kcal': round(sum(w.kcal for w in wellness_items) / count),
                        'protein': round(sum(w.protein for w in wellness_items) / count, 1),
                        'carbs': round(sum(w.carbs for w in wellness_items) / count, 1),
                        'fats': round(sum(w.fats for w in wellness_items) / count, 1),
                        'sugar': round(sum(w.sugar for w in wellness_items) / count, 1),
                        'time_slept': round(sum(w.time_slept for w in wellness_items) / count, 1),
                        'water_intake': round(sum(w.water_intake for w in wellness_items) / count, 1)
                    }
                
                data.append({
                    'period': f"{year}-{month:02d}",
                    'year': year,
                    'month': month,
                    'wellness': avg_wellness,
                })
        
        elif period_type == 'years':
            # Group by year and calculate averages
            yearly_data = defaultdict(lambda: {
                'wellness': [], 'dates': []
            })
            
            for item in wellness_data:
                key = str(item.date.year)
                yearly_data[key]['wellness'].append(item)
                yearly_data[key]['dates'].append(item.date)
            
            data = []
            for year_key, year_data in yearly_data.items():
                year = int(year_key)
                
                avg_wellness = None
                if year_data['wellness']:
                    wellness_items = year_data['wellness']
                    count = len(wellness_items)
                    
                    avg_wellness = {
                        'kcal': round(sum(w.kcal for w in wellness_items) / count),
                        'protein': round(sum(w.protein for w in wellness_items) / count, 1),
                        'carbs': round(sum(w.carbs for w in wellness_items) / count, 1),
                        'fats': round(sum(w.fats for w in wellness_items) / count, 1),
                        'sugar': round(sum(w.sugar for w in wellness_items) / count, 1),
                        'time_slept': round(sum(w.time_slept for w in wellness_items) / count, 1),
                        'water_intake': round(sum(w.water_intake for w in wellness_items) / count, 1)
                    }
                
                data.append({
                    'period': str(year),
                    'year': year,
                    'wellness': avg_wellness,
                })
        
        return Response({
            'period_type': period_type,
            'start_date': start_date,
            'end_date': end_date,
            'data': data
        })

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import DataRetentionLog

User = get_user_model()

class DataRetentionStatusView(APIView):
    """Get user's data retention status"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        if user.is_data_anonymized:
            return Response({
                'status': 'anonymized',
                'message': 'Your account data has been anonymized for privacy protection.'
            })
        
        days_inactive = user.days_since_last_activity()
        
        # Determine status
        if days_inactive < 150:  # Less than 5 months
            status_info = {
                'status': 'active',
                'days_inactive': days_inactive,
                'message': 'Your account is active.',
                'next_warning_in_days': 150 - days_inactive
            }
        elif days_inactive < 180:  # 5-6 months
            status_info = {
                'status': 'warning_period',
                'days_inactive': days_inactive,
                'message': 'You will receive a retention warning soon.',
                'warning_sent': user.retention_notification_sent is not None,
                'final_notice_in_days': 180 - days_inactive
            }
        elif days_inactive < 210:  # 6-7 months
            status_info = {
                'status': 'grace_period',
                'days_inactive': days_inactive,
                'message': 'Your account is in the final grace period.',
                'anonymization_scheduled': user.data_anonymization_scheduled,
                'days_until_anonymization': (user.data_anonymization_scheduled - timezone.now()).days if user.data_anonymization_scheduled else None
            }
        else:  # Over 7 months
            status_info = {
                'status': 'scheduled_for_anonymization',
                'days_inactive': days_inactive,
                'message': 'Your account is scheduled for data anonymization.',
                'anonymization_scheduled': user.data_anonymization_scheduled
            }
        
        return Response(status_info)

class ExtendRetentionView(APIView):
    """Allow user to extend their retention period"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        
        if user.is_data_anonymized:
            return Response(
                {'error': 'Cannot extend retention for anonymized accounts'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Reset retention fields
        user.last_activity = timezone.now()
        user.retention_notification_sent = None
        user.data_anonymization_scheduled = None
        user.retention_warnings_count = 0
        user.save()
        
        # Log the extension
        DataRetentionLog.objects.create(
            user=user,
            action='retention_extended',
            details='User manually extended retention period',
            days_inactive=0
        )
        
        return Response({
            'message': 'Retention period extended successfully',
            'new_last_activity': user.last_activity
        })
