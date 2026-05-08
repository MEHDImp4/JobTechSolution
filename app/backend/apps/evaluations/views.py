# Vues pour les evaluations
import logging

from django.http import HttpResponseForbidden
from django.shortcuts import get_object_or_404, redirect
from django.urls import reverse
from django.utils import timezone
from django.views.generic import DetailView
from django.views.generic.edit import CreateView

from apps.accounts.mixins import RecruteurMixin
from apps.entretiens.models import Entretien

from .forms import EvaluationForm
from .models import Evaluation

logger = logging.getLogger(__name__)


class EvaluationCreateView(RecruteurMixin, CreateView):
    """
    Create an evaluation for a completed interview.

    - GET/POST: retrieve entretien from URL, verify statut='termine'
    - save_draft: save with statut='brouillon'
    - submit: save with statut='soumise', update candidature, trigger async tasks
    """

    model = Evaluation
    form_class = EvaluationForm
    template_name = 'evaluations/form.html'

    def dispatch(self, request, *args, **kwargs):
        self.entretien = get_object_or_404(
            Entretien.objects.select_related('candidat', 'candidature__offre'),
            pk=kwargs['entretien_pk'],
        )
        # Guard: only terminated interviews can be evaluated
        if self.entretien.statut != 'termine':
            return HttpResponseForbidden(
                "L'entretien doit être terminé avant de soumettre une évaluation."
            )
        # Guard: prevent duplicate evaluations
        if hasattr(self.entretien, 'evaluation'):
            return redirect(
                reverse('evaluations:detail', kwargs={'pk': self.entretien.evaluation.pk})
            )
        return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx['entretien'] = self.entretien
        return ctx

    def form_valid(self, form):
        evaluation = form.save(commit=False)
        evaluation.entretien = self.entretien
        evaluation.recruteur = self.request.user

        is_submit = 'submit' in self.request.POST

        if is_submit:
            evaluation.statut = 'soumise'
            evaluation.soumise_at = timezone.now()
            evaluation.save()

            # Update candidature status based on recommendation
            candidature = self.entretien.candidature
            if candidature:
                if evaluation.recommandation == 'retenu':
                    candidature.statut = 'retenu'
                else:
                    candidature.statut = 'refuse'
                candidature.save(update_fields=['statut'])

                # Trigger async decision email
                try:
                    from apps.notifications.tasks import send_decision_email

                    send_decision_email.delay(candidature.id, evaluation.recommandation)
                except Exception:
                    logger.exception(
                        'Failed to queue send_decision_email for candidature %s',
                        candidature.id,
                    )

            # Trigger async AI analysis
            try:
                from apps.ia.tasks import analyze_evaluation_ia

                analyze_evaluation_ia.delay(evaluation.id)
            except Exception:
                logger.exception(
                    'Failed to queue analyze_evaluation_ia for evaluation %s',
                    evaluation.id,
                )

            # Trigger async PDF generation
            try:
                from apps.rapports.tasks import generate_evaluation_pdf

                generate_evaluation_pdf.delay(evaluation.id)
            except Exception:
                logger.exception(
                    'Failed to queue generate_evaluation_pdf for evaluation %s',
                    evaluation.id,
                )

        else:
            # Save as draft
            evaluation.statut = 'brouillon'
            evaluation.save()

        return redirect(reverse('evaluations:detail', kwargs={'pk': evaluation.pk}))

    def form_invalid(self, form):
        return self.render_to_response(self.get_context_data(form=form))


class EvaluationDetailView(RecruteurMixin, DetailView):
    """Display a completed or draft evaluation."""

    model = Evaluation
    template_name = 'evaluations/detail.html'
    context_object_name = 'evaluation'
