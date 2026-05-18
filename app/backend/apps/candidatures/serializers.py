from rest_framework import serializers

from .models import Candidature


class CandidatureSerializer(serializers.ModelSerializer):
    offre_titre = serializers.CharField(source='offre.titre', read_only=True)
    candidat_username = serializers.CharField(source='candidat.username', read_only=True)

    class Meta:
        model = Candidature
        fields = [
            'id',
            'offre',
            'offre_titre',
            'candidat',
            'candidat_username',
            'cv_file',
            'telephone',
            'experience_annees',
            'lettre_motivation',
            'linkedin_url',
            'statut',
            'matching_score',
            'cv_text',
            'ai_summary',
            'ai_extracted_data',
            'date_soumission',
        ]
        read_only_fields = [
            'id',
            'candidat',
            'offre_titre',
            'candidat_username',
            'matching_score',
            'cv_text',
            'ai_summary',
            'ai_extracted_data',
            'date_soumission',
        ]
