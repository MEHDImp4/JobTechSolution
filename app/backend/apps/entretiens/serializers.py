from rest_framework import serializers

from .models import Entretien


class EntretienSerializer(serializers.ModelSerializer):
    candidat_username = serializers.CharField(source='candidature.candidat.username', read_only=True)
    offre_titre = serializers.CharField(source='candidature.offre.titre', read_only=True)
    evaluateur_username = serializers.CharField(source='evaluateur.username', read_only=True)

    class Meta:
        model = Entretien
        fields = [
            'id',
            'candidature',
            'candidat_username',
            'offre_titre',
            'evaluateur',
            'evaluateur_username',
            'date_heure',
            'statut',
            'notes',
            'commentaires',
            'recommandation',
            'score_communication',
            'score_competences',
            'score_motivation',
            'score_global',
        ]
        read_only_fields = ['id', 'candidat_username', 'offre_titre', 'evaluateur', 'evaluateur_username']
