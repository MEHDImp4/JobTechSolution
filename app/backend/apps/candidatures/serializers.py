# Serialiseurs pour les candidatures
from rest_framework import serializers
from .models import Candidature


class CandidatureSerializer(serializers.ModelSerializer):
    offre_id = serializers.IntegerField(source='offre.id', read_only=True)
    offre_titre = serializers.CharField(source='offre.titre', read_only=True)
    candidat_nom = serializers.SerializerMethodField()
    candidat_email = serializers.EmailField(source='candidat.email', read_only=True)
    date_candidature = serializers.DateTimeField(source='date_postulation', read_only=True)
    date_maj = serializers.DateTimeField(read_only=True, allow_null=True)

    class Meta:
        model = Candidature
        fields = [
            'id',
            'offre',
            'offre_id',
            'offre_titre',
            'candidat',
            'candidat_nom',
            'candidat_email',
            'cv_file',
            'cv_file_original_name',
            'lettre_motivation',
            'experience_annees',
            'linkedin_url',
            'statut',
            'score_ia',
            'ia_status',
            'date_candidature',
            'date_maj',
        ]
        read_only_fields = [
            'id',
            'offre_id',
            'offre_titre',
            'candidat',
            'candidat_nom',
            'candidat_email',
            'cv_file_original_name',
            'score_ia',
            'ia_status',
            'date_candidature',
            'date_maj',
        ]

    def get_candidat_nom(self, obj):
        return f'{obj.candidat.prenom} {obj.candidat.nom}' if obj.candidat else None


class CandidatureCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Candidature
        fields = ['offre', 'cv_file', 'lettre_motivation']


class CandidatureUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Candidature
        fields = ['statut']


class CandidatureListSerializer(serializers.ModelSerializer):
    offre_id = serializers.IntegerField(source='offre.id', read_only=True)
    offre_titre = serializers.SerializerMethodField()
    candidat_nom = serializers.SerializerMethodField()
    candidat_email = serializers.EmailField(source='candidat.email', read_only=True)
    date_candidature = serializers.DateTimeField(source='date_postulation', read_only=True)
    date_maj = serializers.DateTimeField(read_only=True, allow_null=True)

    class Meta:
        model = Candidature
        fields = [
            'id',
            'offre_id',
            'offre_titre',
            'candidat_nom',
            'candidat_email',
            'cv_file',
            'cv_file_original_name',
            'lettre_motivation',
            'experience_annees',
            'linkedin_url',
            'statut',
            'score_ia',
            'ia_status',
            'date_candidature',
            'date_maj',
        ]

    def get_offre_titre(self, obj):
        return obj.offre.titre if obj.offre else None

    def get_candidat_nom(self, obj):
        return f"{obj.candidat.prenom} {obj.candidat.nom}" if obj.candidat else None
