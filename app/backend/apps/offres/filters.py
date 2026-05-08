"""
django-filter FilterSet for Offre search — Phase 2 Plan 1.
"""

import django_filters
from django.db.models import Q

from .models import Offre


class OffreFilter(django_filters.FilterSet):
    """Filter set for searching and filtering published job offers."""

    q = django_filters.CharFilter(
        method='filter_search',
        label='Recherche',
    )
    type_contrat = django_filters.MultipleChoiceFilter(
        choices=Offre.TYPE_CONTRAT,
        label='Type de contrat',
    )
    competences = django_filters.CharFilter(
        method='filter_competences',
        label='Compétence',
    )
    salaire_min = django_filters.NumberFilter(
        field_name='salaire_min',
        lookup_expr='gte',
        label='Salaire minimum',
    )
    salaire_max = django_filters.NumberFilter(
        field_name='salaire_max',
        lookup_expr='lte',
        label='Salaire maximum',
    )
    date_apres = django_filters.DateFilter(
        field_name='date_publication',
        lookup_expr='gte',
        label='Publiée après le',
    )
    ordering = django_filters.OrderingFilter(
        fields=(
            ('created_at', 'date'),
            ('salaire_min', 'salaire_min'),
            ('salaire_max', 'salaire_max'),
        ),
        field_labels={
            'date': 'Plus récent',
            'salaire_min': 'Salaire croissant',
            '-salaire_min': 'Salaire décroissant',
        },
        label='Trier par',
    )

    class Meta:
        model = Offre
        fields = ['type_contrat']

    def filter_search(self, qs, name, value):
        return qs.filter(
            Q(titre__icontains=value)
            | Q(description__icontains=value)
            | Q(competences__icontains=value)
        )

    def filter_competences(self, qs, name, value):
        return qs.filter(competences__icontains=value)
