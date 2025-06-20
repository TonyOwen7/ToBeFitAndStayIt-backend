from django.urls import path
from .views import ProfileView, UpdateUserView, DeleteAccountView, ExportUserDataView

urlpatterns = [
    path('profile/', ProfileView.as_view()),
    path('update/', UpdateUserView.as_view()),  # also handles change-password
    path('change-password/', UpdateUserView.as_view()),  # optional alias
    path('delete/', DeleteAccountView.as_view()),
    path('export/', ExportUserDataView.as_view()),
]
