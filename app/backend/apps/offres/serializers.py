from rest_framework import serializers

from .models import Offre


class OffreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Offre
        fields = [
            'id',
            'titre',
            'description',
            'competences_requises',
            'experience_demandee',
            'type_contrat',
            'salaire_estime',
            'statut',
            'date_creation',
        ]
        read_only_fields = ['id', 'date_creation']
