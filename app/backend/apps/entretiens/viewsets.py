# ViewSet pour les entretiens
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Entretien
from .serializers import EntretienCreateSerializer, EntretienSerializer


class EntretienViewSet(viewsets.ModelViewSet):
    queryset = Entretien.objects.select_related(
        'candidat',
        'recruteur',
        'candidature',
        'candidature__offre',
    ).prefetch_related('objectifs')
    serializer_class = EntretienSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return EntretienCreateSerializer
        return EntretienSerializer

    def get_queryset(self):
        qs = super().get_queryset()

        if hasattr(self.request.user, 'role'):
            if self.request.user.role == 'rh' or self.request.user.is_staff:
                return qs
            elif self.request.user.role == 'recruteur':
                return qs.filter(recruteur=self.request.user)
            elif self.request.user.role == 'candidat':
                return qs.filter(candidat=self.request.user)

        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        entretien = serializer.save()
        return Response(EntretienSerializer(entretien).data, status=status.HTTP_201_CREATED)

    # Mettre a jour les notes
    @action(detail=True, methods=['patch', 'post'])
    def notes(self, request, pk=None):
        entretien = self.get_object()
        notes = request.data.get('notes', '')
        entretien.notes = notes
        entretien.save(update_fields=['notes'])
        return Response(EntretienSerializer(entretien).data)

    # Changer le statut
    @action(detail=True, methods=['patch', 'post'])
    def statut(self, request, pk=None):
        entretien = self.get_object()
        new_statut = request.data.get('statut')
        if new_statut in ['planifie', 'en_cours', 'termine', 'annule']:
            entretien.statut = new_statut
            entretien.save(update_fields=['statut'])
            return Response(EntretienSerializer(entretien).data)
        return Response({'statut': 'Statut invalide'}, status=400)

    # Obtenir l'acces a la salle Jitsi
    @action(detail=True, methods=['get'], url_path='room')
    def room(self, request, pk=None):
        entretien = self.get_object()

        # Securite : seul le candidat ou le recruteur peuvent acceder
        if (
            request.user != entretien.candidat
            and request.user != entretien.recruteur
            and not request.user.is_staff
        ):
            return Response({'message': 'Acces refuse'}, status=403)

        # Generer un nom de salle unique et sur
        from django.utils.text import slugify

        candidat_slug = slugify(entretien.candidat.nom)
        room_name = f"JobTech-Entretien-{entretien.id}-{candidat_slug}"

        return Response(
            {
                'room_name': room_name,
                'jitsi_domain': 'meet.jit.si',
                'external_url': f"https://meet.jit.si/{room_name}",
            }
        )
