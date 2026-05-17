from rest_framework import permissions, status, viewsets
from rest_framework.response import Response

from apps.accounts.models import User

from .models import Offre
from .serializers import OffreSerializer

ALLOWED_JOB_ROLES = {User.ROLE_ADMIN, User.ROLE_RH, User.ROLE_RECRUTEUR}


class OffreViewSet(viewsets.ModelViewSet):
    queryset = Offre.objects.select_related('cree_par').all()
    serializer_class = OffreSerializer

    def get_permissions(self):
        # Les offres sont publiques en lecture.
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        # Un candidat ne voit que les offres ouvertes.
        queryset = super().get_queryset()
        user = self.request.user
        if not user.is_authenticated or user.role == User.ROLE_CANDIDAT:
            return queryset.filter(statut='ouverte')
        return queryset

    def create(self, request, *args, **kwargs):
        # Cree une offre.
        if request.user.role not in ALLOWED_JOB_ROLES:
            return Response({'detail': 'Acces refuse.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(cree_par=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        # Modifie une offre.
        if request.user.role not in ALLOWED_JOB_ROLES:
            return Response({'detail': 'Acces refuse.'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        # Supprime une offre.
        if request.user.role not in ALLOWED_JOB_ROLES:
            return Response({'detail': 'Acces refuse.'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)
