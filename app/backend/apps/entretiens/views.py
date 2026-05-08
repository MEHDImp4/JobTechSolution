# Vues pour les entretiens
import json
import logging

from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.exceptions import PermissionDenied
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.views import View
from django.views.generic import DetailView, TemplateView

from apps.accounts.mixins import RecruteurMixin

from .models import Entretien

logger = logging.getLogger(__name__)


class CalendrierView(RecruteurMixin, TemplateView):
    """Display the FullCalendar interview scheduling interface."""

    template_name = 'entretiens/calendrier.html'

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        from django.contrib.auth import get_user_model

        User = get_user_model()
        # Provide candidate list for the creation modal
        ctx['candidats'] = User.objects.filter(role='candidat', is_active=True).order_by('nom')
        ctx['durees'] = Entretien.DUREES
        ctx['types'] = Entretien.TYPES
        return ctx


class EntretienAPIView(RecruteurMixin, View):
    """JSON API endpoint for FullCalendar event feed."""

    def get(self, request):
        start = request.GET.get('start', '')
        end = request.GET.get('end', '')
        qs = Entretien.objects.filter(recruteur=request.user).select_related('candidat')
        if start:
            qs = qs.filter(date_heure__gte=start)
        if end:
            qs = qs.filter(date_heure__lte=end)

        color_map = {
            'planifie': '#1F4E79',
            'en_cours': '#F59E0B',
            'termine': '#16A34A',
            'annule': '#DC2626',
        }

        events = [
            {
                'id': e.id,
                'title': f'{e.get_type_entretien_display()} — {e.candidat.get_full_name()}',
                'start': e.date_heure.isoformat(),
                'end': e.end_time.isoformat(),
                'color': color_map.get(e.statut, '#1F4E79'),
                'url': f'/entretiens/{e.id}/',
                'extendedProps': {
                    'statut': e.statut,
                    'lieu': e.lieu,
                },
            }
            for e in qs
        ]
        return JsonResponse(events, safe=False)


class EntretienCreateView(RecruteurMixin, View):
    """Create a new interview via AJAX POST."""

    def post(self, request):
        try:
            data = json.loads(request.body)
        except (json.JSONDecodeError, ValueError):
            return JsonResponse({'success': False, 'error': 'Données JSON invalides'}, status=400)

        candidat_id = data.get('candidat_id')
        if not candidat_id:
            return JsonResponse({'success': False, 'error': 'candidat_id requis'}, status=400)

        entretien = Entretien(
            candidat_id=candidat_id,
            recruteur=request.user,
            date_heure=data['date_heure'],
            duree_minutes=data.get('duree', 60),
            type_entretien=data.get('type', 'recrutement'),
            lieu=data.get('lieu', ''),
            lien_visio=data.get('lien_visio', ''),
            created_by=request.user,
        )

        if data.get('candidature_id'):
            entretien.candidature_id = data['candidature_id']

        if entretien.check_conflict():
            return JsonResponse({'success': False, 'error': 'Conflit de planning détecté'})

        entretien.save()

        # Trigger confirmation emails asynchronously
        try:
            from apps.notifications.tasks import send_interview_notification

            send_interview_notification.delay(entretien.id)
        except Exception:
            logger.exception(
                'Failed to queue interview notification for entretien %s', entretien.id
            )

        # Update candidature status if linked
        if entretien.candidature:
            entretien.candidature.statut = 'entretien'
            entretien.candidature.save(update_fields=['statut'])

        return JsonResponse({'success': True, 'id': entretien.id})


class ConduiteEntretienView(RecruteurMixin, DetailView):
    """Interview conduct interface with notes editor. Also handles AJAX date updates."""

    model = Entretien
    template_name = 'entretiens/conduite.html'

    def get_object(self, queryset=None):
        obj = super().get_object(queryset)
        # Allow recruiter who owns it or any RH/admin
        if obj.recruteur != self.request.user and not self.request.user.is_rh:
            raise PermissionDenied
        return obj

    def post(self, request, *args, **kwargs):
        """Handle AJAX POST for updating interview date (FullCalendar drag-drop)."""
        entretien = self.get_object()

        # Only RH/Admin or the assigned recruiter can reschedule
        if not (request.user.is_rh or request.user.is_admin or request.user == entretien.recruteur):
            return JsonResponse({'success': False, 'error': 'Non autorisé'}, status=403)

        try:
            data = json.loads(request.body)
            new_date = data.get('date_heure')
            if not new_date:
                return JsonResponse({'success': False, 'error': 'Date manquante'}, status=400)

            # Temporarily set for conflict check
            entretien.date_heure = new_date

            if entretien.check_conflict():
                return JsonResponse({'success': False, 'error': 'Conflit de planning détecté'})

            entretien.save(update_fields=['date_heure'])
            return JsonResponse({'success': True})

        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        candidature = self.object.candidature
        ctx['cv_data'] = getattr(candidature, 'cv_data', None) if candidature else None
        ctx['score_detail'] = getattr(candidature, 'score_detail', None) if candidature else None
        return ctx


class NotesSaveView(LoginRequiredMixin, View):
    """AJAX endpoint: save interview notes every 30 seconds."""

    def post(self, request, pk):
        entretien = get_object_or_404(Entretien, pk=pk, recruteur=request.user)
        try:
            data = json.loads(request.body)
        except (json.JSONDecodeError, ValueError):
            return JsonResponse({'success': False, 'error': 'JSON invalide'}, status=400)

        entretien.notes = data.get('notes', '')
        entretien.save(update_fields=['notes'])
        return JsonResponse(
            {
                'success': True,
                'saved_at': timezone.now().strftime('%H:%M:%S'),
            }
        )


class ClotureEntretienView(LoginRequiredMixin, View):
    """Mark an interview as terminated and redirect to evaluation creation."""

    def post(self, request, pk):
        entretien = get_object_or_404(Entretien, pk=pk, recruteur=request.user)
        entretien.statut = 'termine'
        entretien.save(update_fields=['statut'])
        return JsonResponse(
            {
                'success': True,
                'redirect': f'/evaluations/creer/{entretien.id}/',
            }
        )
