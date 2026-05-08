"""
Admin registration for the candidatures app.
"""

from django.contrib import admin

from .models import Candidature


@admin.register(Candidature)
class CandidatureAdmin(admin.ModelAdmin):
    list_display = [
        'candidat',
        'offre',
        'statut',
        'ia_status',
        'score_ia',
        'date_postulation',
    ]
    list_filter = ['statut', 'ia_status', 'offre']
    search_fields = ['candidat__email', 'offre__titre']
    readonly_fields = [
        'date_postulation',
        'cv_file_original_name',
        'ia_status',
        'score_ia',
    ]
    ordering = ['-date_postulation']
