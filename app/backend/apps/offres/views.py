from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.accounts.models import User

from .models import Offre
from .serializers import OffreSerializer

ALLOWED_JOB_ROLES = {User.ROLE_ADMIN, User.ROLE_RH, User.ROLE_RECRUTEUR}


class OffreViewSet(viewsets.ModelViewSet):
    queryset = Offre.objects.select_related('cree_par').all()
    serializer_class = OffreSerializer

    def get_permissions(self):
        # Les offres sont accessibles publiquement en lecture.
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        # Les candidats n'ont accès qu'aux offres actuellement ouvertes.
        queryset = super().get_queryset()
        user = self.request.user
        
        statut = self.request.query_params.get('statut')
        if statut == 'publiee':
            statut = 'ouverte'
            
        type_contrat = self.request.query_params.get('type_contrat')
        search_query = self.request.query_params.get('q')

        if not user.is_authenticated or user.role == User.ROLE_CANDIDAT:
            queryset = queryset.filter(statut='ouverte')
        elif statut:
            queryset = queryset.filter(statut=statut)
            
        if type_contrat:
            queryset = queryset.filter(type_contrat=type_contrat)
            
        if search_query:
            queryset = queryset.filter(titre__icontains=search_query) | queryset.filter(description__icontains=search_query)
            
        return queryset

    def create(self, request, *args, **kwargs):
        # Crée et publie une nouvelle offre d'emploi.
        if request.user.role not in ALLOWED_JOB_ROLES:
            return Response({'message': 'Acces refuse.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(cree_par=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        # Met à jour les informations d'une offre d'emploi existante.
        if request.user.role not in ALLOWED_JOB_ROLES:
            return Response({'message': 'Acces refuse.'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        # Supprime définitivement une offre d'emploi.
        if request.user.role not in ALLOWED_JOB_ROLES:
            return Response({'message': 'Acces refuse.'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['post'], url_path='toggle-status')
    def toggle_status(self, request, pk=None):
        # Bascule rapidement le statut d'une offre pour l'interface RH.
        if request.user.role not in ALLOWED_JOB_ROLES:
            return Response({'message': 'Acces refuse.'}, status=status.HTTP_403_FORBIDDEN)

        offre = self.get_object()
        if offre.statut == 'ouverte':
            offre.statut = 'cloturee'
        else:
            offre.statut = 'ouverte'
        offre.save(update_fields=['statut'])
        return Response(self.get_serializer(offre).data)
