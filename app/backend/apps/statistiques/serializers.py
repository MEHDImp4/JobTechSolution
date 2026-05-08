# Serialiseurs pour les statistiques
from rest_framework import serializers
from .models import KPISnapshot


class KPISerializer(serializers.ModelSerializer):
    class Meta:
        model = KPISnapshot
        fields = ['id', 'periode', 'offres_count', 'candidatures_count', 'entretiens_count', 'embauches_count', 'taux_conversion', 'delai_moyen', 'score_ia_moyen', 'created_at']
        read_only_fields = ['id', 'created_at']


class DashboardStatsSerializer(serializers.Serializer):
    total_offres = serializers.IntegerField()
    total_candidatures = serializers.IntegerField()
    total_entretiens = serializers.IntegerField()
    taux_conversion = serializers.FloatField()
    delai_moyen_jours = serializers.FloatField()
    score_ia_moyen = serializers.FloatField()