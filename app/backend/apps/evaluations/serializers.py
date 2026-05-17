# Serialiseurs pour les evaluations
from rest_framework import serializers

from apps.entretiens.models import Entretien

from .models import Evaluation


class EvaluationSerializer(serializers.ModelSerializer):
    candidat_nom = serializers.CharField(source='entretien.candidat.get_full_name', read_only=True)
    offre_titre = serializers.CharField(source='entretien.candidature.offre.titre', read_only=True)
    date_creation = serializers.DateTimeField(source='soumise_at', read_only=True)
    date_maj = serializers.DateTimeField(source='soumise_at', read_only=True)
    moyenne_score = serializers.FloatField(read_only=True)
    score_global = serializers.FloatField(source='moyenne_score', read_only=True)

    class Meta:
        model = Evaluation
        fields = [
            'id',
            'entretien',
            'candidat_nom',
            'offre_titre',
            'date_creation',
            'date_maj',
            'moyenne_score',
            'score_global',
            'competences_rate',
            'communication_rate',
            'motivation_rate',
            'adaptabilite_rate',
            'culture_fit_rate',
            'commentaires',
            'points_forts',
            'points_amelioration',
            'recommandation',
            'statut',
            'soumise_at',
            'pdf_file',
        ]
        read_only_fields = ['id', 'soumise_at', 'pdf_file']


class EvaluationCreateSerializer(serializers.ModelSerializer):
    entretien_id = serializers.PrimaryKeyRelatedField(
        source='entretien',
        queryset=Entretien.objects.all(),
        write_only=True,
    )

    class Meta:
        model = Evaluation
        fields = [
            'entretien_id',
            'competences_rate',
            'communication_rate',
            'motivation_rate',
            'adaptabilite_rate',
            'culture_fit_rate',
            'commentaires',
            'points_forts',
            'points_amelioration',
            'recommandation',
            'statut',
        ]
