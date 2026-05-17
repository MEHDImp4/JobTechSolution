from django.contrib import admin

from .models import Offre


@admin.register(Offre)
class OffreAdmin(admin.ModelAdmin):
    list_display = ['titre', 'type_contrat', 'statut', 'experience_demandee', 'date_creation']
    list_filter = ['statut', 'type_contrat']
    search_fields = ['titre', 'description', 'competences_requises']
    readonly_fields = ['date_creation']
