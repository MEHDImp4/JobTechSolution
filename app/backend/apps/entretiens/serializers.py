# Serialiseurs pour les entretiens
from rest_framework import serializers
from .models import Entretien, ObjectifEntretien


class EntretienSerializer(serializers.ModelSerializer):
    class Meta:
        model = Entretien
        fields = ['id', 'candidat', 'recruteur', 'candidature', 'date_heure', 'duree', 'statut', 'notes', 'room_url', 'video_room_id', 'objectifs', 'created_at']
        read_only_fields = ['id', 'room_url', 'video_room_id', 'created_at']


class EntretienCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Entretien
        fields = ['candidat', 'recruteur', 'candidature', 'date_heure', 'duree', 'objectifs']


class ObjectifSerializer(serializers.ModelSerializer):
    class Meta:
        model = ObjectifEntretien
        fields = ['id', 'titre', 'description', 'est_atteint']