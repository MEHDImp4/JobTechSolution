# Serializers for the entretiens API
from rest_framework import serializers

from apps.accounts.models import User
from apps.candidatures.models import Candidature

from .models import Entretien, ObjectifEntretien


def _full_name(user):
    if not user:
        return ''
    full_name = getattr(user, 'get_full_name', '')
    return full_name() if callable(full_name) else full_name


class ObjectifSerializer(serializers.ModelSerializer):
    class Meta:
        model = ObjectifEntretien
        fields = ['id', 'titre', 'est_atteint']


class EntretienSerializer(serializers.ModelSerializer):
    candidat_nom = serializers.SerializerMethodField()
    candidat_email = serializers.EmailField(source='candidat.email', read_only=True)
    recruteur_name = serializers.SerializerMethodField()
    offre_titre = serializers.SerializerMethodField()
    score_ia = serializers.FloatField(source='candidature.score_ia', read_only=True)
    cv_url = serializers.SerializerMethodField()
    candidature_id = serializers.IntegerField(source='candidature.id', read_only=True)
    objectifs = ObjectifSerializer(many=True, read_only=True)

    class Meta:
        model = Entretien
        fields = [
            'id',
            'candidat',
            'recruteur',
            'candidature',
            'candidat_nom',
            'candidat_email',
            'recruteur_name',
            'offre_titre',
            'date_heure',
            'duree_minutes',
            'type_entretien',
            'lieu',
            'lien_visio',
            'statut',
            'notes',
            'score_ia',
            'cv_url',
            'candidature_id',
            'objectifs',
        ]
        read_only_fields = [
            'id',
            'candidat',
            'recruteur',
            'candidature',
            'candidat_nom',
            'candidat_email',
            'recruteur_name',
            'offre_titre',
            'score_ia',
            'cv_url',
            'candidature_id',
            'objectifs',
        ]

    def get_candidat_nom(self, obj):
        return _full_name(obj.candidat)

    def get_recruteur_name(self, obj):
        return _full_name(obj.recruteur)

    def get_offre_titre(self, obj):
        candidature = getattr(obj, 'candidature', None)
        offre = getattr(candidature, 'offre', None)
        return getattr(offre, 'titre', '')

    def get_cv_url(self, obj):
        candidature = getattr(obj, 'candidature', None)
        cv_file = getattr(candidature, 'cv_file', None)
        if not cv_file:
            return ''
        try:
            return cv_file.url
        except ValueError:
            return ''


class EntretienCreateSerializer(serializers.ModelSerializer):
    candidature_id = serializers.PrimaryKeyRelatedField(
        source='candidature',
        queryset=Candidature.objects.select_related('candidat', 'offre'),
        write_only=True,
    )
    recruteur_id = serializers.PrimaryKeyRelatedField(
        source='recruteur',
        queryset=User.objects.filter(role__in=['admin', 'rh', 'recruteur']),
        write_only=True,
    )

    class Meta:
        model = Entretien
        fields = [
            'candidature_id',
            'recruteur_id',
            'date_heure',
            'duree_minutes',
            'type_entretien',
            'lieu',
            'lien_visio',
        ]

    def create(self, validated_data):
        candidature = validated_data['candidature']
        return Entretien.objects.create(
            candidat=candidature.candidat,
            created_by=self.context['request'].user,
            **validated_data,
        )
