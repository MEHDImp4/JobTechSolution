# Serialiseurs pour les candidatures
from rest_framework import serializers
from .models import Candidature


class CandidatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Candidature
        fields = ['id', 'offre', 'candidat', 'cv_file', 'lettre_motivation', 'statut', 'score_ia', 'date_soumission', 'date_modification']
        read_only_fields = ['id', 'score_ia', 'date_soumission', 'date_modification']


class CandidatureCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Candidature
        fields = ['offre', 'cv_file', 'lettre_motivation']


class CandidatureUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Candidature
        fields = ['statut']


class CandidatureListSerializer(serializers.ModelSerializer):
    offre_titre = serializers.SerializerMethodField()
    candidat_nom = serializers.SerializerMethodField()

    class Meta:
        model = Candidature
        fields = ['id', 'offre_titre', 'candidat_nom', 'statut', 'date_soumission']

    def get_offre_titre(self, obj):
        return obj.offre.titre if obj.offre else None

    def get_candidat_nom(self, obj):
        return f"{obj.candidat.prenom} {obj.candidat.nom}" if obj.candidat else None