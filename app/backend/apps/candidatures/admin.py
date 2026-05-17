from django.contrib import admin

from .models import Candidature


@admin.register(Candidature)
class CandidatureAdmin(admin.ModelAdmin):
    list_display = ['candidat', 'offre', 'statut', 'matching_score', 'date_soumission']
    list_filter = ['statut', 'offre']
    search_fields = ['candidat__username', 'offre__titre']
    readonly_fields = ['date_soumission']
