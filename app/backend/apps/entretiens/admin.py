from django.contrib import admin

from .models import Entretien


@admin.register(Entretien)
class EntretienAdmin(admin.ModelAdmin):
    list_display = ['candidature', 'evaluateur', 'date_heure', 'statut']
    list_filter = ['statut']
    search_fields = ['candidature__offre__titre', 'candidature__candidat__username']
    date_hierarchy = 'date_heure'
    raw_id_fields = ['candidature', 'evaluateur']
