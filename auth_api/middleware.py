
from django.utils import timezone
from django.contrib.auth import get_user_model

User = get_user_model()

class UserActivityMiddleware:
    """Middleware to track user activity"""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        response = self.get_response(request)
        
        # Update last activity for authenticated users
        if request.user.is_authenticated and not request.user.is_data_anonymized:
            # Only update if last activity was more than 1 hour ago to reduce DB writes
            one_hour_ago = timezone.now() - timezone.timedelta(hours=1)
            if request.user.last_activity < one_hour_ago:
                request.user.update_last_activity()
        
        return response

