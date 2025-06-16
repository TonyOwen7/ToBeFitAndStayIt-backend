from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('auth_api.urls')),
    path('api/app-interest/', include('app_interest.urls')),
]
