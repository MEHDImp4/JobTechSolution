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
                        'duree_minutes',
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


class EvaluationSerializer(serializers.ModelSerializer):
    candidat_nom = serializers.CharField(source='candidature.candidat.full_name', read_only=True)
    offre_titre = serializers.CharField(source='candidature.offre.titre', read_only=True)
    date_creation = serializers.DateTimeField(source='date_heure', read_only=True)
    
    # Mapping 0-100 scores to 1-5 rates
    competences_rate = serializers.SerializerMethodField()
    communication_rate = serializers.SerializerMethodField()
    motivation_rate = serializers.SerializerMethodField()
    adaptabilite_rate = serializers.SerializerMethodField()
    culture_fit_rate = serializers.SerializerMethodField()
    
    pdf_file = serializers.SerializerMethodField()

    class Meta:
        model = Entretien
        fields = [
            'id',
            'candidat_nom',
            'offre_titre',
            'score_global',
            'date_creation',
            'competences_rate',
            'communication_rate',
            'motivation_rate',
            'adaptabilite_rate',
            'culture_fit_rate',
            'commentaires',
            'points_forts',
            'points_amelioration',
            'recommandation',
            'pdf_file',
        ]

    def get_competences_rate(self, obj):
        return max(1, obj.score_competences // 20)

    def get_communication_rate(self, obj):
        return max(1, obj.score_communication // 20)

    def get_motivation_rate(self, obj):
        return max(1, obj.score_motivation // 20)

    def get_adaptabilite_rate(self, obj):
        return max(1, obj.score_adaptabilite // 20)

    def get_culture_fit_rate(self, obj):
        return max(1, obj.score_culture_fit // 20)
        
    def get_pdf_file(self, obj):
        return f'/api/statistiques/export/pdf/?id={obj.id}'
