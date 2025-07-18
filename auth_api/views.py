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
from .models import CustomUser, DailyWellness
from .serializers import (
    CustomUserSerializer, DailyWellnessSerializer, DashboardSerializer
)

class CustomUserViewSet(viewsets.ModelViewSet):
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return CustomUser.objects.filter(id=self.request.user.id)
# views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Avg, Sum, Count, Min, Max
from django.utils import timezone
from datetime import datetime, timedelta
from calendar import monthrange
import calendar

class DailyWellnessViewSet(viewsets.ModelViewSet):
    serializer_class = DailyWellnessSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        date_param = self.request.query_params.get('date')
        queryset = DailyWellness.objects.filter(user=user)
        
        if date_param:
            queryset = queryset.filter(date=date_param)
        
        return queryset.order_by('-date')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """
        Get wellness data for different time periods
        Parameters:
        - period: 'day', 'week', 'month', 'year'
        - date: specific date (YYYY-MM-DD) - required for 'day', optional for others
        """
        period = request.query_params.get('period', 'day')
        date_param = request.query_params.get('date')
        user = request.user
        
        # Get user's data range
        user_data = DailyWellness.objects.filter(user=user)
        if not user_data.exists():
            return Response({
                'period': period,
                'data': [],
                'message': 'No wellness data available'
            })
        
        # Get data range boundaries
        first_record = user_data.aggregate(Min('date'))['date__min']
        last_record = user_data.aggregate(Max('date'))['date__max']
        
        if period == 'day':
            return self._get_day_data(user, date_param, first_record, last_record)
        elif period == 'week':
            return self._get_week_data(user, date_param, first_record, last_record)
        elif period == 'month':
            return self._get_month_data(user, date_param, first_record, last_record)
        elif period == 'year':
            return self._get_year_data(user, date_param, first_record, last_record)
        else:
            return Response({'error': 'Invalid period'}, status=status.HTTP_400_BAD_REQUEST)
    
    def _get_day_data(self, user, date_param, first_record, last_record):
        """Get data for a specific day"""
        if not date_param:
            return Response({'error': 'Date parameter required for day view'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        try:
            target_date = datetime.strptime(date_param, '%Y-%m-%d').date()
        except ValueError:
            return Response({'error': 'Invalid date format. Use YYYY-MM-DD'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Check if date is within user's data range
        if target_date < first_record or target_date > last_record:
            return Response({
                'period': 'day',
                'date': date_param,
                'data': None,
                'message': f'No data available for {date_param}'
            })
        
        try:
            wellness_data = DailyWellness.objects.get(user=user, date=target_date)
            serializer = DailyWellnessSerializer(wellness_data)
            return Response({
                'period': 'day',
                'date': date_param,
                'data': serializer.data
            })
        except DailyWellness.DoesNotExist:
            return Response({
                'period': 'day',
                'date': date_param,
                'data': None,
                'message': f'No data recorded for {date_param}'
            })
    
    def _get_week_data(self, user, date_param, first_record, last_record):
        """Get data for each day of a week"""
        if date_param:
            try:
                target_date = datetime.strptime(date_param, '%Y-%m-%d').date()
            except ValueError:
                return Response({'error': 'Invalid date format. Use YYYY-MM-DD'}, 
                              status=status.HTTP_400_BAD_REQUEST)
        else:
            # Use first day of first record's week
            target_date = first_record
        
        # Get the Monday of the week containing target_date
        days_since_monday = target_date.weekday()
        week_start = target_date - timedelta(days=days_since_monday)
        week_end = week_start + timedelta(days=6)
        
        # Adjust boundaries to user's data range
        actual_start = max(week_start, first_record)
        actual_end = min(week_end, last_record)
        
        # Get data for each day in the week
        daily_data = []
        current_date = actual_start
        
        while current_date <= actual_end:
            try:
                wellness_data = DailyWellness.objects.get(user=user, date=current_date)
                serializer = DailyWellnessSerializer(wellness_data)
                daily_data.append({
                    'date': current_date.strftime('%Y-%m-%d'),
                    'day_of_week': current_date.strftime('%A'),
                    'data': serializer.data
                })
            except DailyWellness.DoesNotExist:
                daily_data.append({
                    'date': current_date.strftime('%Y-%m-%d'),
                    'day_of_week': current_date.strftime('%A'),
                    'data': None
                })
            current_date += timedelta(days=1)
        
        return Response({
            'period': 'week',
            'week_start': actual_start.strftime('%Y-%m-%d'),
            'week_end': actual_end.strftime('%Y-%m-%d'),
            'data': daily_data
        })
    
    def _get_month_data(self, user, date_param, first_record, last_record):
        """Get aggregated data for a month"""
        if date_param:
            try:
                target_date = datetime.strptime(date_param, '%Y-%m-%d').date()
                year, month = target_date.year, target_date.month
            except ValueError:
                return Response({'error': 'Invalid date format. Use YYYY-MM-DD'}, 
                              status=status.HTTP_400_BAD_REQUEST)
        else:
            # Use first record's month
            year, month = first_record.year, first_record.month
        
        # Get month boundaries
        month_start = datetime(year, month, 1).date()
        last_day = monthrange(year, month)[1]
        month_end = datetime(year, month, last_day).date()
        
        # Adjust to user's data range
        actual_start = max(month_start, first_record)
        actual_end = min(month_end, last_record)
        
        # Get aggregated data for the month
        month_data = DailyWellness.objects.filter(
            user=user,
            date__range=[actual_start, actual_end]
        ).aggregate(
            avg_kcal=Avg('kcal'),
            avg_protein=Avg('protein'),
            avg_carbs=Avg('carbs'),
            avg_fats=Avg('fats'),
            avg_sugar=Avg('sugar'),
            avg_time_slept=Avg('time_slept'),
            avg_water_intake=Avg('water_intake'),
            total_days=Count('date')
        )
        
        return Response({
            'period': 'month',
            'month': f"{year}-{month:02d}",
            'month_name': calendar.month_name[month],
            'period_start': actual_start.strftime('%Y-%m-%d'),
            'period_end': actual_end.strftime('%Y-%m-%d'),
            'data': {
                'avg_kcal': round(month_data['avg_kcal'] or 0, 1),
                'avg_protein': round(month_data['avg_protein'] or 0, 1),
                'avg_carbs': round(month_data['avg_carbs'] or 0, 1),
                'avg_fats': round(month_data['avg_fats'] or 0, 1),
                'avg_sugar': round(month_data['avg_sugar'] or 0, 1),
                'avg_time_slept': round(month_data['avg_time_slept'] or 0, 1),
                'avg_water_intake': round(month_data['avg_water_intake'] or 0, 1),
                'days_recorded': month_data['total_days']
            }
        })
    
    def _get_year_data(self, user, date_param, first_record, last_record):
        """Get average data for each month of a year"""
        if date_param:
            try:
                target_date = datetime.strptime(date_param, '%Y-%m-%d').date()
                year = target_date.year
            except ValueError:
                return Response({'error': 'Invalid date format. Use YYYY-MM-DD'}, 
                              status=status.HTTP_400_BAD_REQUEST)
        else:
            # Use first record's year
            year = first_record.year
        
        # Get year boundaries
        year_start = datetime(year, 1, 1).date()
        year_end = datetime(year, 12, 31).date()
        
        # Adjust to user's data range
        actual_start = max(year_start, first_record)
        actual_end = min(year_end, last_record)
        
        # Get data for each month in the year
        monthly_data = []
        
        for month in range(1, 13):
            month_start = datetime(year, month, 1).date()
            last_day = monthrange(year, month)[1]
            month_end = datetime(year, month, last_day).date()
            
            # Skip months outside user's data range
            if month_end < actual_start or month_start > actual_end:
                continue
            
            # Adjust month boundaries to user's data range
            period_start = max(month_start, actual_start)
            period_end = min(month_end, actual_end)
            
            month_stats = DailyWellness.objects.filter(
                user=user,
                date__range=[period_start, period_end]
            ).aggregate(
                avg_kcal=Avg('kcal'),
                avg_protein=Avg('protein'),
                avg_carbs=Avg('carbs'),
                avg_fats=Avg('fats'),
                avg_sugar=Avg('sugar'),
                avg_time_slept=Avg('time_slept'),
                avg_water_intake=Avg('water_intake'),
                total_days=Count('date')
            )
            
            if month_stats['total_days'] > 0:  # Only include months with data
                monthly_data.append({
                    'month': month,
                    'month_name': calendar.month_name[month],
                    'year_month': f"{year}-{month:02d}",
                    'period_start': period_start.strftime('%Y-%m-%d'),
                    'period_end': period_end.strftime('%Y-%m-%d'),
                    'data': {
                        'avg_kcal': round(month_stats['avg_kcal'] or 0, 1),
                        'avg_protein': round(month_stats['avg_protein'] or 0, 1),
                        'avg_carbs': round(month_stats['avg_carbs'] or 0, 1),
                        'avg_fats': round(month_stats['avg_fats'] or 0, 1),
                        'avg_sugar': round(month_stats['avg_sugar'] or 0, 1),
                        'avg_time_slept': round(month_stats['avg_time_slept'] or 0, 1),
                        'avg_water_intake': round(month_stats['avg_water_intake'] or 0, 1),
                        'days_recorded': month_stats['total_days']
                    }
                })
        
        return Response({
            'period': 'year',
            'year': year,
            'period_start': actual_start.strftime('%Y-%m-%d'),
            'period_end': actual_end.strftime('%Y-%m-%d'),
            'data': monthly_data
        })

# Optional: Enhanced Dashboard ViewSet for more complex analytics
class DashboardViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get overall wellness summary statistics"""
        user = request.user
        
        # Get overall statistics
        overall_stats = DailyWellness.objects.filter(user=user).aggregate(
            total_days=Count('date'),
            avg_kcal=Avg('kcal'),
            avg_protein=Avg('protein'),
            avg_carbs=Avg('carbs'),
            avg_fats=Avg('fats'),
            avg_sugar=Avg('sugar'),
            avg_time_slept=Avg('time_slept'),
            avg_water_intake=Avg('water_intake'),
            first_record=Min('date'),
            last_record=Max('date')
        )
        
        if overall_stats['total_days'] == 0:
            return Response({'message': 'No wellness data available'})
        
        return Response({
            'summary': {
                'total_days_recorded': overall_stats['total_days'],
                'date_range': {
                    'start': overall_stats['first_record'].strftime('%Y-%m-%d'),
                    'end': overall_stats['last_record'].strftime('%Y-%m-%d')
                },
                'averages': {
                    'kcal': round(overall_stats['avg_kcal'] or 0, 1),
                    'protein': round(overall_stats['avg_protein'] or 0, 1),
                    'carbs': round(overall_stats['avg_carbs'] or 0, 1),
                    'fats': round(overall_stats['avg_fats'] or 0, 1),
                    'sugar': round(overall_stats['avg_sugar'] or 0, 1),
                    'time_slept': round(overall_stats['avg_time_slept'] or 0, 1),
                    'water_intake': round(overall_stats['avg_water_intake'] or 0, 1)
                }
            }
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
