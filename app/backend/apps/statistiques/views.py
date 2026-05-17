import csv
import logging
from datetime import timedelta

from django.http import HttpResponse
from django.utils import timezone
from django.views.generic import TemplateView, View

from apps.accounts.mixins import RHOrAdminMixin

from .chart_generator import DashboardChartGenerator
from .kpi_calculator import RHKPICalculator

logger = logging.getLogger(__name__)


class DashboardRHView(RHOrAdminMixin, TemplateView):
    """
    HR analytics dashboard.
    """

    template_name = 'statistiques/dashboard_rh.html'

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)

        periode = self.request.GET.get('periode', '30d')
        PERIODES = {'7d': 7, '30d': 30, '90d': 90, '365d': 365}

        if periode in PERIODES:
            date_debut = timezone.now().date() - timedelta(days=PERIODES[periode])
            date_fin = None
        else:
            date_debut = self.request.GET.get('date_debut')
            date_fin = self.request.GET.get('date_fin')

        calc = RHKPICalculator(date_debut, date_fin)
        kpis = calc.get_all()

        gen = DashboardChartGenerator()
        from apps.evaluations.models import Evaluation

        qs = calc.qs  # Use the filtered queryset from calculator

        ctx.update(kpis)
        ctx['periode'] = periode

        try:
            ctx['chart_scores'] = gen.score_distribution(qs)
            ctx['chart_timeline'] = gen.candidatures_timeline(qs, PERIODES.get(periode, 30))
            ctx['chart_reco'] = gen.recommendations_pie(Evaluation.objects.filter(statut='soumise'))
        except Exception:
            logger.exception('Failed to generate charts')
            ctx['chart_scores'] = ''
            ctx['chart_timeline'] = ''
            ctx['chart_reco'] = ''

        return ctx


class ExportCSVView(RHOrAdminMixin, View):
    def get(self, request):
        response = HttpResponse(content_type='text/csv; charset=utf-8-sig')
        response['Content-Disposition'] = 'attachment; filename="candidatures_export.csv"'
        response.write('\ufeff')  # BOM for Excel

        writer = csv.writer(response)
        writer.writerow(
            [
                'ID',
                'Candidat',
                'Email',
                'Offre',
                'Score IA',
                'Statut',
                'Date',
                'Recruteur',
            ]
        )

        from apps.candidatures.models import Candidature

        # Optimization: select_related
        qs = (
            Candidature.objects.select_related('candidat', 'offre')
            .prefetch_related('entretiens__recruteur')
            .all()
        )

        for c in qs:
            recruteur_obj = c.entretiens.first()
            recruteur_name = (
                recruteur_obj.recruteur.get_full_name
                if recruteur_obj and recruteur_obj.recruteur
                else ''
            )

            writer.writerow(
                [
                    c.id,
                    c.candidat.get_full_name,
                    c.candidat.email,
                    c.offre.titre,
                    c.score_ia,
                    c.get_statut_display(),
                    c.date_postulation.strftime('%d/%m/%Y'),
                    recruteur_name,
                ]
            )

        return response
