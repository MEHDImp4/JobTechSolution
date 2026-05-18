from django.shortcuts import redirect
from datetime import timedelta
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.accounts.models import User
from apps.candidatures.models import Candidature

from .models import Entretien
from .serializers import EntretienSerializer, EvaluationSerializer

STAFF_ROLES = {User.ROLE_ADMIN, User.ROLE_RH, User.ROLE_RECRUTEUR, User.ROLE_MANAGER}


class EntretienViewSet(viewsets.ModelViewSet):
    queryset = Entretien.objects.select_related('candidature__offre', 'candidature__candidat', 'evaluateur').all()
    serializer_class = EntretienSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        # Limite l'affichage des entretiens à ceux concernant le candidat connecté.
        user = self.request.user
        queryset = super().get_queryset()
        if user.role in STAFF_ROLES:
            return queryset
        return queryset.filter(candidature__candidat=user)

    def create(self, request, *args, **kwargs):
        # Planifie un nouvel entretien (réservé au personnel autorisé).
        if request.user.role not in {User.ROLE_ADMIN, User.ROLE_RH, User.ROLE_RECRUTEUR}:
            return Response({'message': 'Acces refuse.'}, status=status.HTTP_403_FORBIDDEN)

        candidature_id = request.data.get('candidature') or request.data.get('candidature_id')
        if not candidature_id:
            return Response({'message': 'La candidature est obligatoire.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            candidature = Candidature.objects.get(pk=candidature_id)
        except Candidature.DoesNotExist:
            return Response({'message': 'Candidature introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        evaluateur = request.user
        recruteur_id = request.data.get('recruteur_id')
        if recruteur_id:
            try:
                evaluateur = User.objects.get(pk=recruteur_id)
            except User.DoesNotExist:
                return Response({'message': 'Recruteur introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        date_heure = request.data.get('date_heure')
        if not date_heure:
            return Response({'message': 'La date de l entretien est obligatoire.'}, status=status.HTTP_400_BAD_REQUEST)

        # Vérifier les conflits d'horaire
        from datetime import datetime
        duree = int(request.data.get('duree_minutes', 60))
        date_debut = datetime.fromisoformat(date_heure.replace('Z', '+00:00'))
        date_fin = date_debut + timedelta(minutes=duree)
        
        # Vérifier si l'évaluateur est libre
        conflict_evaluateur = Entretien.objects.filter(
            evaluateur=evaluateur,
            statut__in=['planifie', 'en_cours'],
        ).exclude(
            date_heure__gte=date_fin
        ).exclude(
            date_heure__lt=date_debut
        ).exists()
        if conflict_evaluateur:
            return Response({'message': 'L\'évaluateur n\'est pas disponible à cette heure.'}, status=status.HTTP_409_CONFLICT)
        
        # Vérifier si le candidat est libre
        conflict_candidat = Entretien.objects.filter(
            candidature__candidat=candidature.candidat,
            statut__in=['planifie', 'en_cours'],
        ).exclude(
            date_heure__gte=date_fin
        ).exclude(
            date_heure__lt=date_debut
        ).exists()
        if conflict_candidat:
            return Response({'message': 'Le candidat n\'est pas disponible à cette heure.'}, status=status.HTTP_409_CONFLICT)

        entretien = Entretien.objects.create(
            candidature=candidature,
            evaluateur=evaluateur,
            date_heure=date_heure,
                        duree_minutes=duree,
            statut=request.data.get('statut', 'planifie'),
            notes=request.data.get('notes', ''),
            commentaires=request.data.get('commentaires', ''),
            recommandation=request.data.get('recommandation', ''),
        )

        serializer = self.get_serializer(entretien)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        # Met à jour les informations d'un entretien existant.
        if request.user.role not in STAFF_ROLES:
            return Response({'message': 'Acces refuse.'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    @action(detail=True, methods=['patch'], url_path='statut')
    def update_statut(self, request, pk=None):
        # Met a jour rapidement le statut d'un entretien.
        if request.user.role not in STAFF_ROLES:
            return Response({'message': 'Acces refuse.'}, status=status.HTTP_403_FORBIDDEN)

        entretien = self.get_object()
        statut = request.data.get('statut')
        statuts_valides = {'planifie', 'termine', 'annule'}
        if statut not in statuts_valides:
            return Response({'message': 'Statut invalide.'}, status=status.HTTP_400_BAD_REQUEST)

        entretien.statut = statut
        entretien.save(update_fields=['statut'])
        return Response(self.get_serializer(entretien).data)

    @action(detail=True, methods=['patch'], url_path='notes')
    def update_notes(self, request, pk=None):
        # Met a jour rapidement les notes d'un entretien.
        if request.user.role not in STAFF_ROLES:
            return Response({'message': 'Acces refuse.'}, status=status.HTTP_403_FORBIDDEN)

        entretien = self.get_object()
        entretien.notes = request.data.get('notes', '')
        entretien.save(update_fields=['notes'])
        return Response(self.get_serializer(entretien).data)


class EvaluationViewSet(viewsets.ModelViewSet):
    queryset = Entretien.objects.filter(statut='termine').select_related('candidature__offre', 'candidature__candidat')
    serializer_class = EvaluationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def create(self, request, *args, **kwargs):
        if request.user.role not in STAFF_ROLES:
            return Response({'message': 'Acces refuse.'}, status=status.HTTP_403_FORBIDDEN)
            
        entretien_id = request.data.get('entretien_id')
        try:
            entretien = Entretien.objects.get(id=entretien_id)
        except Entretien.DoesNotExist:
            return Response({'message': 'Entretien non trouve.'}, status=status.HTTP_404_NOT_FOUND)

        # Mapping rates (1-5) to scores (0-100)
        entretien.score_competences = request.data.get('competences_rate', 0) * 20
        entretien.score_communication = request.data.get('communication_rate', 0) * 20
        entretien.score_motivation = request.data.get('motivation_rate', 0) * 20
        entretien.score_adaptabilite = request.data.get('adaptabilite_rate', 0) * 20
        entretien.score_culture_fit = request.data.get('culture_fit_rate', 0) * 20
        
        # Calculate global score
        scores = [
            entretien.score_competences, 
            entretien.score_communication, 
            entretien.score_motivation,
            entretien.score_adaptabilite,
            entretien.score_culture_fit
        ]
        entretien.score_global = sum(scores) // len(scores)
        
        entretien.commentaires = request.data.get('commentaires', '')
        entretien.points_forts = request.data.get('points_forts', '')
        entretien.points_amelioration = request.data.get('points_amelioration', '')
        entretien.recommandation = request.data.get('recommandation', '')
        entretien.statut = 'termine'
        entretien.save()
        
        serializer = self.get_serializer(entretien)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def pdf(self, request, pk=None):
        # Redirige vers l'export PDF existant
        return redirect(f'/api/statistiques/export/pdf/?id={pk}')

    @action(detail=False, methods=['get'], url_path=r'entretien/(?P<entretien_id>\d+)')
    def by_entretien(self, request, entretien_id=None):
        try:
            entretien = self.get_queryset().get(id=entretien_id)
            serializer = self.get_serializer(entretien)
            return Response(serializer.data)
        except Entretien.DoesNotExist:
            return Response({'detail': 'Evaluation non trouvee.'}, status=404)
