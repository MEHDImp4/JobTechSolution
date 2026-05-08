# ViewSet pour les candidatures
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Candidature
from .serializers import CandidatureCreateSerializer, CandidatureListSerializer, CandidatureSerializer


class CandidatureViewSet(viewsets.ModelViewSet):
    queryset = Candidature.objects.all()
    serializer_class = CandidatureSerializer
    permission_classes = [IsAuthenticated]

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

        return qs.order_by('-date_soumission')

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