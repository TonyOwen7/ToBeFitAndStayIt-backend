from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model, authenticate

User = get_user_model()

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reset_password(request):
    user = request.user
    current_password = request.data.get('current_password')
    new_password = request.data.get('new_password')

    if not user.check_password(current_password):
        return Response({'message': 'Current password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save()
    return Response({'message': 'Password updated successfully'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def delete_account(request):
    user = request.user
    current_password = request.data.get('current_password')

    if not user.check_password(current_password):
        return Response({'message': 'Incorrect password'}, status=status.HTTP_400_BAD_REQUEST)

    user.delete()
    return Response({'message': 'Account deleted successfully'}, status=status.HTTP_200_OK)
