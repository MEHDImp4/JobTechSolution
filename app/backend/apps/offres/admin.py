"""
Admin registration for offres app — Phase 2 Plan 1.
"""

from django.contrib import admin

from .models import Competence, Offre


@admin.register(Competence)
class CompetenceAdmin(admin.ModelAdmin):
    list_display = ['nom', 'categorie', 'count_usage']
    list_filter = ['categorie']
    search_fields = ['nom']


@admin.register(Offre)
class OffreAdmin(admin.ModelAdmin):
    list_display = ['titre', 'type_contrat', 'statut', 'created_by', 'created_at']
    list_filter = ['statut', 'type_contrat']
    search_fields = ['titre', 'description']
    readonly_fields = ['created_at', 'updated_at', 'date_publication']
    date_hierarchy = 'created_at'
