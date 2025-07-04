# urls.py
from django.urls import path
from .views import WellnessTipView

urlpatterns = [
    path('', WellnessTipView.as_view(), name='wellness-tip'),
]
