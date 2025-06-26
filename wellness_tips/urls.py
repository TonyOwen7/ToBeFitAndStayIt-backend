from django.urls import path
from .views import AnswerFromWebView

urlpatterns = [
    path('ask/', AnswerFromWebView.as_view(), name='ask-question'),
]
