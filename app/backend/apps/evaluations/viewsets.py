# ViewSet pour les evaluations
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Evaluation
from .serializers import EvaluationCreateSerializer, EvaluationSerializer


class EvaluationViewSet(viewsets.ModelViewSet):
    queryset = Evaluation.objects.all()
    serializer_class = EvaluationSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return EvaluationCreateSerializer
        return EvaluationSerializer

    def get_queryset(self):
        qs = super().get_queryset()

        if hasattr(self.request.user, 'role'):
            if self.request.user.role in ['rh', 'admin', 'recruteur']:
                return qs.filter(entretien__recruteur=self.request.user)
            elif self.request.user.role == 'candidat':
                return qs.filter(entretien__candidat=self.request.user)

        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        eval = serializer.save()
        return Response(EvaluationSerializer(eval).data, status=status.HTTP_201_CREATED)

    # Soumettre l'evaluation
    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        evaluation = self.get_object()
        evaluation.statut = 'soumis'
        evaluation.save(update_fields=['statut'])
        return Response({'statut': 'soumis'})

    # Generer le PDF
    @action(detail=True, methods=['get'])
    def pdf(self, request, pk=None):
        evaluation = self.get_object()
        return Response({'pdf_url': f'/api/evaluations/{evaluation.id}/pdf/'})