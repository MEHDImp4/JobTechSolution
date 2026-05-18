from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.accounts.models import User

from .ai import build_simple_ai_result, extract_text_from_cv
from .models import Candidature
from .serializers import CandidatureSerializer

STAFF_ROLES = {User.ROLE_ADMIN, User.ROLE_RH, User.ROLE_RECRUTEUR, User.ROLE_MANAGER}


class CandidatureViewSet(viewsets.ModelViewSet):
    queryset = Candidature.objects.select_related('offre', 'candidat').all()
    serializer_class = CandidatureSerializer
    permission_classes = [permissions.IsAuthenticated]

    def apply_simple_ai(self, application):
        # Met a jour le texte extrait du CV et le score simple.
        cv_text = extract_text_from_cv(application.cv_file)
        ai_result = build_simple_ai_result(application.offre, cv_text=cv_text, message=application.lettre_motivation)
        application.cv_text = cv_text
        application.matching_score = ai_result['score']
        application.ai_summary = ai_result['summary']
        application.ai_extracted_data = ai_result['extracted_data']
        application.save(update_fields=['cv_text', 'matching_score', 'ai_summary', 'ai_extracted_data'])

    def get_queryset(self):
        # Un candidat ne voit que ses candidatures.
        user = self.request.user
        queryset = super().get_queryset()
        if user.role in STAFF_ROLES:
            return queryset
        return queryset.filter(candidat=user)

    def create(self, request, *args, **kwargs):
        # Cree une candidature puis lance l'analyse simple du CV.
        if request.user.role != User.ROLE_CANDIDAT:
            return Response({'message': 'Seul un candidat peut postuler.'}, status=status.HTTP_403_FORBIDDEN)
            
        offre_id = request.data.get('offre')
        if Candidature.objects.filter(offre_id=offre_id, candidat=request.user).exists():
            return Response({'message': 'Vous avez déjà postulé à cette offre.'}, status=status.HTTP_400_BAD_REQUEST)
            
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        application = serializer.save(candidat=request.user)
        self.apply_simple_ai(application)
        return Response(self.get_serializer(application).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='my-applications')
    def my_applications(self, request):
        queryset = self.get_queryset().filter(candidat=request.user)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path=r'offre/(?P<offre_id>\d+)')
    def by_offre(self, request, offre_id=None):
        queryset = self.get_queryset().filter(offre_id=offre_id)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def status(self, request, pk=None):
        application = self.get_object()
        return Response({'statut': application.statut})

    @action(detail=True, methods=['post'], url_path='statut')
    def update_statut(self, request, pk=None):
        if request.user.role not in STAFF_ROLES:
            return Response({'detail': 'Acces refuse.'}, status=status.HTTP_403_FORBIDDEN)
        application = self.get_object()
        statut = request.data.get('statut')
        if statut:
            application.statut = statut
            application.save(update_fields=['statut'])
        return Response({'statut': application.statut})

    @action(detail=False, methods=['post'], url_path='bulk-statut')
    def bulk_statut(self, request):
        if request.user.role not in STAFF_ROLES:
            return Response({'detail': 'Acces refuse.'}, status=status.HTTP_403_FORBIDDEN)
        ids = request.data.get('ids', [])
        statut = request.data.get('statut')
        if ids and statut:
            Candidature.objects.filter(id__in=ids).update(statut=statut)
        return Response(ids)

    def update(self, request, *args, **kwargs):
        # Permet au staff de tout modifier et au candidat de modifier son message.
        application = self.get_object()
        if request.user.role not in STAFF_ROLES and application.candidat != request.user:
            return Response({'detail': 'Acces refuse.'}, status=status.HTTP_403_FORBIDDEN)
        if request.user.role == User.ROLE_CANDIDAT:
            payload = {'lettre_motivation': request.data.get('lettre_motivation', application.lettre_motivation)}
            serializer = self.get_serializer(application, data=payload, partial=True)
        else:
            serializer = self.get_serializer(application, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        if 'cv_file' in request.data or 'lettre_motivation' in request.data or 'offre' in request.data:
            self.apply_simple_ai(application)
        return Response(serializer.data)
