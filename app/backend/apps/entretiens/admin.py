"""
Admin configuration for the entretiens app.
"""

from django.contrib import admin

from .models import Entretien


@admin.register(Entretien)
class EntretienAdmin(admin.ModelAdmin):
    list_display = [
        'candidat',
        'recruteur',
        'type_entretien',
        'date_heure',
        'duree_minutes',
        'statut',
    ]
    list_filter = ['statut', 'type_entretien']
    search_fields = ['candidat__email', 'recruteur__email', 'lieu']
    date_hierarchy = 'date_heure'
    raw_id_fields = ['candidat', 'recruteur', 'candidature', 'created_by']
