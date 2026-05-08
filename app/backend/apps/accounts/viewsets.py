# ViewSet pour les utilisateurs - remplacer l'API Ninja
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response

from .models import AuditLog, User
from .serializers import (
    PasswordChangeSerializer,
    ProfileUpdateSerializer,
    UserCreateSerializer,
    UserSerializer,
)


# ViewSet pour l'authentification (auth/)
class AuthViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    def list(self, request):
        """GET /auth/ - retourne l'utilisateur connecte"""
        if not request.user.is_authenticated:
            return Response({'authenticated': False})
        return Response({
            'authenticated': True,
            'user': UserSerializer(request.user).data
        })

    @action(detail=False, methods=['get'])
    def me(self, request):
        """GET /auth/me - retourne l'utilisateur connecte"""
        if not request.user.is_authenticated:
            return Response({'authenticated': False})
        return Response({
            'authenticated': True,
            'user': UserSerializer(request.user).data
        })

    def create(self, request):
        """POST /auth/ - login"""
        from django.contrib.auth import authenticate, login
        email = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '')
        user = authenticate(request, username=email, password=password)
        if user is not None:
            login(request, user)
            return Response(UserSerializer(user).data)
        return Response(
            {'message': 'Email ou mot de passe invalide.'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    @action(detail=False, methods=['post'])
    def login(self, request):
        """POST /auth/login - login"""
        from django.contrib.auth import authenticate, login
        email = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '')
        user = authenticate(request, username=email, password=password)
        if user is not None:
            login(request, user)
            return Response(UserSerializer(user).data)
        return Response(
            {'message': 'Email ou mot de passe invalide.'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    def destroy(self, request):
        """DELETE /auth/ - logout"""
        from django.contrib.auth import logout
        logout(request)
        return Response({'message': 'Deconnexion reussie'})


# ViewSet pour les utilisateurs - lecture/ecriture
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        if self.action in ['update', 'partial_update']:
            return ProfileUpdateSerializer
        return UserSerializer

    def get_permissions(self):
        if self.action in ['create', 'login', 'me']:
            return [AllowAny()]
        if self.action in ['destroy', 'update', 'partial_update', 'toggle_active', 'change_role']:
            return [IsAdminUser()]
        return [IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)

    # Obtenir le profil de l'utilisateur connecte
    @action(detail=False, methods=['get'])
    def me(self, request):
        if not request.user.is_authenticated:
            return Response({'authenticated': False})
        return Response({
            'authenticated': True,
            'user': UserSerializer(request.user).data
        })

    # Simple endpoint de login
    @action(detail=False, methods=['post'])
    def login(self, request):
        from django.contrib.auth import authenticate, login
        email = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '')
        user = authenticate(request, username=email, password=password)
        if user is not None:
            login(request, user)
            return Response({'message': 'Connecte avec succes'})
        return Response({'message': 'Email ou mot de passe invalide.'}, status=401)

    # Logout
    @action(detail=False, methods=['post'])
    def logout(self, request):
        from django.contrib.auth import logout
        logout(request)
        return Response({'message': 'Deconnexion reussie'})

    # Modifier son profil
    @action(detail=False, methods=['put', 'patch'])
    def update_profile(self, request):
        serializer = ProfileUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user).data)

    # Changer de mot de passe
    @action(detail=False, methods=['post'])
    def change_password(self, request):
        serializer = PasswordChangeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if not request.user.check_password(serializer.validated_data['old_password']):
            return Response({'old_password': 'Mot de passe actuel incorrect.'}, status=400)

        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response({'message': 'Mot de passe modifie avec succes'})

    # Activer/desactiver un utilisateur (admin only)
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        return Response({'is_active': user.is_active})

    # Changer le role (admin only)
    @action(detail=True, methods=['post'])
    def change_role(self, request, pk=None):
        user = self.get_object()
        new_role = request.data.get('role')
        if new_role not in ['admin', 'rh', 'recruteur', 'candidat']:
            return Response({'role': 'Role invalide.'}, status=400)
        user.role = new_role
        user.save()
        return Response({'role': user.role})


# ViewSet pour les logs d'audit - lecture seule
class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]


# Fonction simple pour lister les logs
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def audit_logs_list(request):
    logs = AuditLog.objects.all()[:100]
    data = [{
        'id': log.id,
        'user_email': log.user.email if log.user else 'Anonymous',
        'action': log.action,
        'model_name': log.model_name,
        'timestamp': log.timestamp,
        'ip_address': log.ip_address,
    } for log in logs]
    return Response(data)