from django.contrib.auth import authenticate, login, logout
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import User
from .serializers import RegisterSerializer, UserAdminSerializer, UserSerializer

STAFF_ROLES = {User.ROLE_ADMIN, User.ROLE_RH, User.ROLE_RECRUTEUR, User.ROLE_MANAGER}


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        # Crée un nouvel utilisateur.
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        # Connecte un utilisateur avec un nom d'utilisateur et un mot de passe.
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, username=username, password=password)
        if user is None:
            return Response({'detail': 'Identifiants invalides.'}, status=status.HTTP_400_BAD_REQUEST)
        login(request, user)
        return Response({'detail': 'Connexion reussie.', 'user': UserSerializer(user).data})


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # Déconnecte l'utilisateur et ferme la session courante.
        logout(request)
        return Response({'detail': 'Deconnexion reussie.'})


class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Récupère et retourne le profil de l'utilisateur connecté.
        return Response(UserSerializer(request.user).data)

    def put(self, request):
        # Met à jour les informations du profil de l'utilisateur connecté.
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('username')
    serializer_class = UserAdminSerializer

    def get_permissions(self):
        # Applique les permissions appropriées en fonction de l'action demandée.
        if self.action in ['list', 'retrieve', 'update', 'partial_update', 'set_role']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

    def list(self, request, *args, **kwargs):
        # Récupère la liste des utilisateurs. Accès restreint aux administrateurs et responsables RH.
        if request.user.role not in {User.ROLE_ADMIN, User.ROLE_RH}:
            return Response({'detail': 'Acces refuse.'}, status=status.HTTP_403_FORBIDDEN)
        return super().list(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        # Affiche les détails d'un utilisateur spécifique. Réservé au personnel interne.
        if request.user.role not in STAFF_ROLES:
            return Response({'detail': 'Acces refuse.'}, status=status.HTTP_403_FORBIDDEN)
        return super().retrieve(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        # Met à jour les données d'un utilisateur. Accès restreint aux administrateurs et responsables RH.
        if request.user.role not in {User.ROLE_ADMIN, User.ROLE_RH}:
            return Response({'detail': 'Acces refuse.'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def set_role(self, request, pk=None):
        # Modifie le rôle attribué à un utilisateur.
        if request.user.role not in {User.ROLE_ADMIN, User.ROLE_RH}:
            return Response({'detail': 'Acces refuse.'}, status=status.HTTP_403_FORBIDDEN)
        user = self.get_object()
        role = request.data.get('role')
        if role not in dict(User.ROLE_CHOICES):
            return Response({'detail': 'Role invalide.'}, status=status.HTTP_400_BAD_REQUEST)
        user.role = role
        user.save(update_fields=['role'])
        return Response(UserAdminSerializer(user).data)
