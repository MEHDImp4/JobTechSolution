from rest_framework import serializers

from .models import Offre


class OffreSerializer(serializers.ModelSerializer):
    # Champs renvoyes pour le frontend actuel.
    competences = serializers.SerializerMethodField()
    experience_requise = serializers.IntegerField(source='experience_demandee', required=False)
    salaire_min = serializers.SerializerMethodField()
    salaire_max = serializers.SerializerMethodField()
    date_publication = serializers.SerializerMethodField()
    date_cloture = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(source='date_creation', read_only=True)
    candidatures_count = serializers.SerializerMethodField()

    class Meta:
        model = Offre
        fields = [
            'id',
            'titre',
            'description',
            'competences',
            'competences_requises',
            'experience_requise',
            'experience_demandee',
            'type_contrat',
            'salaire_min',
            'salaire_max',
            'salaire_estime',
            'statut',
            'date_publication',
            'date_cloture',
            'created_at',
            'date_creation',
            'candidatures_count',
        ]
        read_only_fields = [
            'id',
            'date_creation',
            'created_at',
            'date_publication',
            'date_cloture',
            'candidatures_count',
            'salaire_min',
            'salaire_max',
            'competences',
        ]
        extra_kwargs = {
            'competences_requises': {'required': False, 'allow_blank': True},
            'experience_demandee': {'required': False},
            'salaire_estime': {'required': False, 'allow_null': True},
        }

    def validate(self, attrs):
        # Accepte les anciens et nouveaux noms de champs du frontend.
        initial_data = getattr(self, 'initial_data', {}) or {}

        competences = initial_data.get('competences')
        if competences is not None:
            if isinstance(competences, list):
                attrs['competences_requises'] = ', '.join(
                    competence.strip() for competence in competences if str(competence).strip()
                )
            else:
                attrs['competences_requises'] = str(competences)

        if 'experience_requise' in initial_data and 'experience_demandee' not in attrs:
            try:
                attrs['experience_demandee'] = int(initial_data.get('experience_requise') or 0)
            except (TypeError, ValueError):
                raise serializers.ValidationError({'experience_requise': 'Valeur invalide.'})

        salaire_min = initial_data.get('salaire_min')
        salaire_max = initial_data.get('salaire_max')
        salaire_estime = initial_data.get('salaire_estime')

        if salaire_estime not in (None, ''):
            attrs['salaire_estime'] = salaire_estime
        elif salaire_min not in (None, '') and salaire_max not in (None, ''):
            attrs['salaire_estime'] = (float(salaire_min) + float(salaire_max)) / 2
        elif salaire_min not in (None, ''):
            attrs['salaire_estime'] = salaire_min
        elif salaire_max not in (None, ''):
            attrs['salaire_estime'] = salaire_max

        statut = initial_data.get('statut')
        if statut == 'publiee':
            attrs['statut'] = 'ouverte'
        elif statut:
            attrs['statut'] = statut

        if not attrs.get('competences_requises'):
            attrs['competences_requises'] = ''

        return attrs

    def get_competences(self, obj):
        return [skill.strip() for skill in obj.competences_requises.split(',') if skill.strip()]

    def get_salaire_min(self, obj):
        return float(obj.salaire_estime) if obj.salaire_estime is not None else None

    def get_salaire_max(self, obj):
        return float(obj.salaire_estime) if obj.salaire_estime is not None else None

    def get_date_publication(self, obj):
        return obj.date_creation

    def get_date_cloture(self, obj):
        return None

    def get_candidatures_count(self, obj):
        if hasattr(obj, 'candidatures'):
            return obj.candidatures.count()
        return 0
