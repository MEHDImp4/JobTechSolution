# Vues pour les candidatures
from django.conf import settings
from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.files.storage import FileSystemStorage
from django.db import IntegrityError
from django.db.models import Avg
from django.http import JsonResponse
from django.shortcuts import redirect
from django.utils import timezone
from django.views import View
from django.views.generic import TemplateView
from formtools.wizard.views import SessionWizardView

from apps.accounts.mixins import CandidatMixin
from apps.offres.models import Offre

from .forms import Step1Form, Step2Form, Step3Form
from .models import Candidature


class CandidatureCreateView(CandidatMixin, View):
    """
    AJAX POST endpoint for direct single-step CV upload.
    Validates file, creates Candidature, triggers IA task.
    """

    def post(self, request, *args, **kwargs):
        offre_id = request.POST.get('offre_id')
        cv_file = request.FILES.get('cv_file')

        if not offre_id or not cv_file:
            return JsonResponse({'success': False, 'error': 'Données manquantes.'}, status=400)

        try:
            offre = Offre.objects.get(pk=offre_id, statut='publiee')
        except Offre.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Offre introuvable.'}, status=404)

        # Check for duplicate application
        if Candidature.objects.filter(offre=offre, candidat=request.user).exists():
            return JsonResponse(
                {'success': False, 'error': 'Vous avez déjà postulé à cette offre.'},
                status=400,
            )

        # Validate file via model validators
        from django.core.exceptions import ValidationError

        from .validators import validate_cv_file

        try:
            validate_cv_file(cv_file)
        except ValidationError as e:
            return JsonResponse({'success': False, 'error': e.message}, status=400)

        cand = Candidature(
            offre=offre,
            candidat=request.user,
            cv_file_original_name=cv_file.name,
        )
        cand.cv_file = cv_file
        try:
            cand.save()
        except IntegrityError:
            return JsonResponse(
                {'success': False, 'error': 'Vous avez déjà postulé à cette offre.'},
                status=400,
            )

        from apps.ia.tasks import analyze_cv

        analyze_cv.delay(cand.id)

        return JsonResponse(
            {
                'success': True,
                'candidature_id': cand.id,
                'ia_status': 'pending',
            }
        )


class IaStatusView(LoginRequiredMixin, View):
    """
    GET /candidatures/<id>/ia-status/
    Returns current IA analysis status and score for a candidature.
    Only the owning candidate may access.
    """

    def get(self, request, pk, *args, **kwargs):
        try:
            cand = Candidature.objects.get(pk=pk, candidat=request.user)
        except Candidature.DoesNotExist:
            return JsonResponse({'error': 'Candidature introuvable.'}, status=404)

        return JsonResponse(
            {
                'ia_status': cand.ia_status,
                'score_ia': cand.score_ia,
                'statut': cand.statut,
            }
        )


# ---------------------------------------------------------------------------
# Wizard
# ---------------------------------------------------------------------------

WIZARD_FORMS = [
    ('offre', Step1Form),
    ('profil', Step2Form),
    ('cv', Step3Form),
]

WIZARD_TEMPLATES = {
    'offre': 'candidatures/wizard/step1.html',
    'profil': 'candidatures/wizard/step2.html',
    'cv': 'candidatures/wizard/step3.html',
}


class CandidatureWizardView(CandidatMixin, SessionWizardView):
    """
    3-step wizard:
      Step 1 — Choose job offer
      Step 2 — Profile details (phone, LinkedIn, experience, education)
      Step 3 — CV upload + cover letter + RGPD consent
    """

    form_list = WIZARD_FORMS
    file_storage = FileSystemStorage(location=str(settings.MEDIA_ROOT / 'tmp'))

    def get_form_kwargs(self, step=None):
        kwargs = super().get_form_kwargs(step)
        kwargs['user'] = self.request.user
        return kwargs

    def get_template_names(self):
        return [WIZARD_TEMPLATES[self.steps.current]]

    def get_context_data(self, form, **kwargs):
        ctx = super().get_context_data(form=form, **kwargs)
        ctx['step_labels'] = [
            "Choix de l'offre",
            'Votre profil',
            'CV & Motivation',
        ]
        return ctx

    def done(self, form_list, **kwargs):
        data = {}
        for form in form_list:
            data.update(form.cleaned_data)

        offre = data['offre']
        cv_file = data['cv_file']

        candidature = Candidature(
            offre=offre,
            candidat=self.request.user,
            lettre_motivation=data.get('lettre_motivation', ''),
            cv_file_original_name=cv_file.name,
        )
        candidature.cv_file = cv_file
        candidature.save()

        from apps.ia.tasks import analyze_cv

        analyze_cv.delay(candidature.id)

        messages.success(self.request, 'Candidature soumise avec succes !')
        return redirect('candidat:dashboard')


# ---------------------------------------------------------------------------
# Candidate Dashboard
# ---------------------------------------------------------------------------


class CandidatDashboardView(CandidatMixin, TemplateView):
    """
    Personal dashboard for the logged-in candidate.
    Shows candidature stats, per-application stepper, and upcoming interviews.
    """

    template_name = 'candidat/dashboard.html'

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        candidatures = Candidature.objects.filter(candidat=self.request.user).select_related(
            'offre'
        )
        stats = {
            'total': candidatures.count(),
            'en_cours': candidatures.exclude(statut__in=['retenu', 'refuse']).count(),
            'retenu': candidatures.filter(statut='retenu').count(),
            'score_moyen': candidatures.aggregate(Avg('score_ia'))['score_ia__avg'],
        }

        # Upcoming interviews (entretiens app not yet implemented — safe fallback)
        try:
            from apps.entretiens.models import Entretien

            entretiens = Entretien.objects.filter(
                candidat=self.request.user, date_heure__gte=timezone.now()
            ).order_by('date_heure')[:5]
        except Exception:
            entretiens = []

        ctx['candidatures'] = candidatures
        ctx['stats'] = stats
        ctx['entretiens'] = entretiens
        return ctx
