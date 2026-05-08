# Serialiseurs pour les offres d'emploi
from rest_framework import serializers
from .models import Competence, Offre


# Serialiseur pour les competences
class CompetenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Competence
        fields = ['id', 'nom', 'categorie']


# Serialiseur pour une offre complete
class OffreSerializer(serializers.ModelSerializer):
    competences = serializers.PrimaryKeyRelatedField(
        queryset=Competence.objects.all(),
        many=True,
        required=False
    )
    candidatures_count = serializers.SerializerMethodField()

    class Meta:
        model = Offre
        fields = [
            'id', 'titre', 'description', 'experience_requise', 'competences',
            'type_contrat', 'salaire_min', 'salaire_max', 'statut',
            'date_publication', 'date_cloture', 'created_at', 'candidatures_count'
        ]
        read_only_fields = ['id', 'date_publication', 'created_at', 'candidatures_count']

    def get_candidatures_count(self, obj):
        return obj.get_candidatures_count()


# Serialiseur pour creer une offre
class OffreCreateSerializer(serializers.ModelSerializer):
    competences = serializers.PrimaryKeyRelatedField(
        queryset=Competence.objects.all(),
        many=True,
        required=False
    )

    class Meta:
        model = Offre
        fields = [
            'titre', 'description', 'experience_requise', 'competences',
            'type_contrat', 'salaire_min', 'salaire_max',
            'date_cloture', 'statut'
        ]

    def create(self, validated_data):
        validated_data['statut'] = validated_data.get('statut', 'brouillon')
        return super().create(validated_data)


# Serialiseur simple pour la liste
class OffreListSerializer(serializers.ModelSerializer):
    competences = serializers.SerializerMethodField()

    class Meta:
        model = Offre
        fields = ['id', 'titre', 'type_contrat', 'statut', 'created_at']

    def get_competences(self, obj):
        return [c.nom for c in obj.competences.all()]