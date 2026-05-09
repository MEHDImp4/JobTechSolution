# ViewSet pour les candidatures
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from jobtech.pagination import StandardResultsSetPagination

from .models import Candidature
from .serializers import CandidatureCreateSerializer, CandidatureListSerializer, CandidatureSerializer


class CandidatureViewSet(viewsets.ModelViewSet):
    queryset = Candidature.objects.select_related('offre', 'candidat')
    serializer_class = CandidatureSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_serializer_class(self):
        if self.action == 'list':
            return CandidatureListSerializer
        if self.action == 'create':
            return CandidatureCreateSerializer
        return CandidatureSerializer

    def get_queryset(self):
        qs = super().get_queryset()

        # Les candidats ne voient que leurs propres candidatures
        if not self.is_rh():
            qs = qs.filter(candidat=self.request.user)

        offre_id = self.request.query_params.get('offre')
        if offre_id:
            qs = qs.filter(offre_id=offre_id)

        statut = self.request.query_params.get('statut')
        if statut:
            qs = qs.filter(statut=statut)

        return qs.order_by('-date_postulation')

    def is_rh(self):
        return (
            self.request.user.is_authenticated and
            hasattr(self.request.user, 'role') and
            self.request.user.role in ['rh', 'admin']
        )

    def create(self, request, *args, **kwargs):
        # Verifier si deja postule
        offre_id = request.data.get('offre')
        if Candidature.objects.filter(offre_id=offre_id, candidat=request.user).exists():
            return Response(
                {'message': 'Vous avez deja poste a cette offre.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(candidat=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path=r'offre/(?P<offre_id>\d+)')
    def offre(self, request, offre_id=None):
        queryset = self.get_queryset().filter(offre_id=offre_id)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = CandidatureListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = CandidatureListSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='my-applications')
    def my_applications(self, request):
        queryset = self.get_queryset().filter(candidat=request.user)
        serializer = CandidatureListSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='status')
    def status(self, request, pk=None):
        candidature = self.get_object()
        return Response(
            {
                'ia_status': candidature.ia_status,
                'score_ia': candidature.score_ia,
                'statut': candidature.statut,
            }
        )

    @action(detail=True, methods=['post'], url_path='statut')
    def statut(self, request, pk=None):
        candidature = self.get_object()
        if not self.is_rh():
            return Response({'message': 'Interdit'}, status=403)

        new_statut = request.data.get('statut')
        valid_statuts = {choice[0] for choice in Candidature.STATUTS}
        if new_statut not in valid_statuts:
            return Response({'message': 'Statut invalide'}, status=400)

        candidature.statut = new_statut
        candidature.save(update_fields=['statut'])
        return Response(
            {
                'ia_status': candidature.ia_status,
                'score_ia': candidature.score_ia,
                'statut': candidature.statut,
            }
        )

    # Mise a jour groupée du statut (RH only)
    @action(detail=False, methods=['post'])
    def bulk_statut(self, request):
        if not self.is_rh():
            return Response({'message': 'Interdit'}, status=403)

        ids = request.data.get('ids', [])
        new_statut = request.data.get('statut')

        updated = []
        for cid in ids:
            try:
                cand = Candidature.objects.get(id=cid)
                old_statut = cand.statut
                cand.statut = new_statut
                cand.save()
                updated.append(cand.id)
            except Candidature.DoesNotExist:
                pass

        return Response(updated)
