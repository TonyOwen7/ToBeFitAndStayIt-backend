from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import JsonResponse
from auth_api.models import CustomUser
from .serializers import (
    UserProfileSerializer,
    UserUpdateSerializer,
    PasswordChangeSerializer,
)

class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

from auth_api.models import PasswordHistory
from django.contrib.auth.hashers import check_password

class UpdateUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request):
        is_password_change = all(field in request.data for field in ['current_password', 'new_password', 'confirm_password'])

        if is_password_change:
            serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
            serializer.is_valid(raise_exception=True)

            current = serializer.validated_data['current_password']
            new = serializer.validated_data['new_password']
            confirm = serializer.validated_data['confirm_password']

            if not request.user.check_password(current):
                return Response({'current_password': ['Incorrect current password.']}, status=status.HTTP_400_BAD_REQUEST)

            if new != confirm:
                return Response({'confirm_password': ['Passwords do not match.']}, status=status.HTTP_400_BAD_REQUEST)

            if check_password(new, request.user.password):
                return Response({'new_password': ['New password cannot be the same as the old password.']},
                                status=status.HTTP_400_BAD_REQUEST)

            # Optional: Check against password history
            previous = PasswordHistory.objects.filter(user=request.user).values_list('password', flat=True)
            for old in previous:
                if check_password(new, old):
                    return Response({'new_password': ['You cannot reuse a previously used password.']},
                                    status=status.HTTP_400_BAD_REQUEST)

            request.user.set_password(new)
            request.user.save()
            PasswordHistory.objects.create(user=request.user, password=request.user.password)

            return Response(UserProfileSerializer(request.user).data)

        # ✅ Regular profile update
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserProfileSerializer(request.user).data)

class DeleteAccountView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request):
        request.user.delete()
        return Response({"detail": "Account deleted."}, status=204)


class ExportUserDataView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = UserProfileSerializer(request.user).data
        return JsonResponse(profile, safe=False)
