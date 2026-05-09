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
    recrutements_reussis = serializers.IntegerField()
    top_candidats = serializers.ListField(child=serializers.DictField())
