# Serialiseurs pour les evaluations
from rest_framework import serializers
from .models import Evaluation


class EvaluationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evaluation
        fields = ['id', 'entretien', 'competences_rate', 'communication_rate', 'motivation_rate', 'adaptabilite_rate', 'culture_fit_rate', 'commentaires', 'points_forts', 'points_amelioration', 'recommandation', 'statut', 'soumise_at', 'pdf_file']
        read_only_fields = ['id', 'soumise_at', 'pdf_file']


class EvaluationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evaluation
        fields = ['entretien', 'competences_rate', 'communication_rate', 'motivation_rate', 'adaptabilite_rate', 'culture_fit_rate', 'commentaires', 'points_forts', 'points_amelioration', 'recommandation', 'statut']