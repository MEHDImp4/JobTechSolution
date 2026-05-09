# ViewSet pour les offres - remplacer API Ninja
from django.db import models
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from jobtech.pagination import StandardResultsSetPagination

from .models import Competence, Offre
from .serializers import (
    CompetenceSerializer,
    OffreCreateSerializer,
    OffreListSerializer,
    OffreSerializer,
)


class OffreViewSet(viewsets.ModelViewSet):
    queryset = Offre.objects.all()
    serializer_class = OffreSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_serializer_class(self):
        if self.action == 'list':
            return OffreListSerializer
        if self.action in ['create', 'update', 'partial_update']:
            return OffreCreateSerializer
        return OffreSerializer

    def get_queryset(self):
        qs = super().get_queryset()

        # Les candidats ne voient que les offres publiees
        if not self.is_rh():
            qs = qs.filter(statut='publiee')

        # Filtres
        q = self.request.query_params.get('q')
        if q:
            qs = qs.filter(
                models.Q(titre__icontains=q) |
                models.Q(description__icontains=q)
            )

        type_contrat = self.request.query_params.get('type_contrat')
        if type_contrat:
            qs = qs.filter(type_contrat=type_contrat)

        statut = self.request.query_params.get('statut')
        if statut:
            qs = qs.filter(statut=statut)

        return qs.order_by('-created_at')

    def is_rh(self):
        return (
            self.request.user.is_authenticated and
            hasattr(self.request.user, 'role') and
            self.request.user.role in ['rh', 'admin']
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        offre = serializer.save(created_by=request.user)
        return Response(OffreSerializer(offre).data, status=status.HTTP_201_CREATED)

    # Autocompletion pour les competences
    @action(detail=False, methods=['get'])
    def autocomplete(self, request):
        q = request.query_params.get('q', '')
        competences = Competence.objects.filter(nom__icontains=q)[:10]
        data = [{'id': c.id, 'nom': c.nom, 'categorie': c.categorie} for c in competences]
        return Response(data)


class CompetenceViewSet(viewsets.ModelViewSet):
    queryset = Competence.objects.all()
    serializer_class = CompetenceSerializer
    permission_classes = [AllowAny]
