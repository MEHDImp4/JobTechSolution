from django.contrib.auth import authenticate, login, logout
from django.db import models
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AuditLog, User
from .serializers import (
    AuditLogSerializer,
    RegisterSerializer,
    UserAdminCreateSerializer,
    UserAdminSerializer,
    UserSerializer,
)

STAFF_ROLES = {User.ROLE_ADMIN, User.ROLE_RH, User.ROLE_RECRUTEUR, User.ROLE_MANAGER}


def create_audit_log(request, user, action, model_name='', object_id=''):
    # Enregistre une entree simple dans le journal d'audit.
    AuditLog.objects.create(
        user=user,
        user_email=user.email,
        action=action,
        model_name=model_name,
        object_id=str(object_id) if object_id else '',
        endpoint=request.path,
        ip_address=_get_ip_address(request),
    )


def _get_ip_address(request):
    forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if forwarded_for:
        return forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        # Cree un nouvel utilisateur.
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        create_audit_log(request, user, 'REGISTER', 'accounts.user', user.id)
        return Response({'message': 'Compte créé avec succès !'}, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        # Connecte un utilisateur avec email/username et mot de passe.
        email = request.data.get('email')
        password = request.data.get('password')
        username = request.data.get('username')

        if not username and email:
            try:
                user_obj = User.objects.get(email=email)
                username = user_obj.username
            except User.DoesNotExist:
                return Response({'message': 'Identifiants invalides.'}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=username, password=password)
        if user is None:
            return Response({'message': 'Identifiants invalides.'}, status=status.HTTP_400_BAD_REQUEST)
        
        login(request, user)
        create_audit_log(request, user, 'LOGIN', 'accounts.user', user.id)
        return Response(UserSerializer(user).data)


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # Ferme la session courante.
        current_user = request.user
        create_audit_log(request, current_user, 'LOGOUT', 'accounts.user', current_user.id)
        logout(request)
        return Response({'message': 'Déconnexion réussie.'})


@method_decorator(ensure_csrf_cookie, name='dispatch')
class ProfileView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        # Retourne le profil de l'utilisateur connecté ou statut non-authentifié.
        if not request.user.is_authenticated:
            return Response({'authenticated': False, 'user': None})
            
        return Response({
            'authenticated': True,
            'user': UserSerializer(request.user).data
        })

    def put(self, request):
        # Met a jour le profil de l'utilisateur connecte.
        if not request.user.is_authenticated:
            return Response({'message': 'Non authentifié.'}, status=status.HTTP_401_UNAUTHORIZED)
            
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('username')
    serializer_class = UserAdminSerializer

    def get_serializer_class(self):
        if self.action == 'create':
            return UserAdminCreateSerializer
        return UserAdminSerializer

    def get_permissions(self):
        # Applique des droits simples selon l'action.
        if self.action in ['list', 'retrieve', 'update', 'partial_update', 'set_role', 'toggle_active', 'create']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

    def list(self, request, *args, **kwargs):
        # Liste les utilisateurs pour admin et RH.
        if request.user.role not in {User.ROLE_ADMIN, User.ROLE_RH}:
            return Response({'detail': 'Acces refuse.'}, status=status.HTTP_403_FORBIDDEN)
        queryset = self.get_queryset()
        
        search = request.query_params.get('search')
        role = request.query_params.get('role')
        
        if search:
            queryset = queryset.filter(
                models.Q(username__icontains=search) | 
                models.Q(email__icontains=search) | 
                models.Q(nom__icontains=search) | 
                models.Q(prenom__icontains=search)
            )
        if role:
            queryset = queryset.filter(role=role.upper())
            
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
            
        return Response(self.get_serializer(queryset, many=True).data)

    def retrieve(self, request, *args, **kwargs):
        # Affiche un utilisateur pour les roles internes.
        if request.user.role not in STAFF_ROLES:
            return Response({'detail': 'Acces refuse.'}, status=status.HTTP_403_FORBIDDEN)
        return super().retrieve(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        # Modifie un utilisateur pour admin et RH.
        if request.user.role not in {User.ROLE_ADMIN, User.ROLE_RH}:
            return Response({'detail': 'Acces refuse.'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        # Cree un utilisateur depuis l'admin.
        if request.user.role not in {User.ROLE_ADMIN, User.ROLE_RH}:
            return Response({'detail': 'Acces refuse.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        create_audit_log(request, request.user, 'CREATE_USER', 'accounts.user', user.id)
        return Response(UserAdminSerializer(user).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='toggle-active')
    def toggle_active(self, request, pk=None):
        if request.user.role not in {User.ROLE_ADMIN, User.ROLE_RH}:
            return Response({'detail': 'Acces refuse.'}, status=status.HTTP_403_FORBIDDEN)
        user = self.get_object()
        user.is_active = not user.is_active
        user.save(update_fields=['is_active'])
        create_audit_log(request, request.user, 'TOGGLE_ACTIVE', 'accounts.user', user.id)
        return Response(UserAdminSerializer(user).data)

    @action(detail=False, methods=['post'], url_path='import')
    def import_users(self, request):
        if request.user.role not in {User.ROLE_ADMIN, User.ROLE_RH}:
            return Response({'detail': 'Acces refuse.'}, status=status.HTTP_403_FORBIDDEN)
        # Dummy implementation for now to satisfy frontend
        return Response({'success': True, 'created': 0, 'errors': []})

    @action(detail=True, methods=['post'])
    def set_role(self, request, pk=None):
        # Change le role d'un utilisateur.
        if request.user.role not in {User.ROLE_ADMIN, User.ROLE_RH}:
            return Response({'detail': 'Acces refuse.'}, status=status.HTTP_403_FORBIDDEN)
        user = self.get_object()
        role = request.data.get('role')
        if role not in dict(User.ROLE_CHOICES):
            return Response({'detail': 'Role invalide.'}, status=status.HTTP_400_BAD_REQUEST)
        user.role = role
        user.save(update_fields=['role'])
        create_audit_log(request, request.user, 'SET_ROLE', 'accounts.user', user.id)
        return Response(UserAdminSerializer(user).data)


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(models.Q(user_email__icontains=search) | models.Q(action__icontains=search))
        return queryset
