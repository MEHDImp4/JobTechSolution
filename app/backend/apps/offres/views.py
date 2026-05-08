# Vues pour les offres d'emploi
from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect
from django.urls import reverse_lazy
from django.views import View
from django.views.generic import (
    CreateView,
    DeleteView,
    DetailView,
    ListView,
    UpdateView,
)

from apps.accounts.mixins import RHOrAdminMixin

from .filters import OffreFilter
from .forms import OffreForm
from .models import Competence, Offre


class OffreListView(LoginRequiredMixin, ListView):
    """Public list of published offers; RH/admin also see their drafts."""

    template_name = 'offres/list.html'
    context_object_name = 'offres'
    paginate_by = 10

    def get_queryset(self):
        return Offre.objects.filter(statut='publiee').select_related('created_by')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        role = getattr(self.request.user, 'role', None)
        if role in ('rh', 'admin'):
            context['offres_rh'] = Offre.objects.filter(
                statut__in=['brouillon', 'cloturee']
            ).select_related('created_by')
        return context


class OffreDetailView(LoginRequiredMixin, DetailView):
    """Detail page for a single offer."""

    model = Offre
    template_name = 'offres/detail.html'
    context_object_name = 'offre'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        offre = self.get_object()
        user = self.request.user
        context['can_apply'] = user.role == 'candidat' and offre.statut == 'publiee'
        context['candidature_existante'] = None
        # Check if candidate already applied (candidatures app may not exist yet)
        if hasattr(offre, 'candidatures') and user.role == 'candidat':
            context['candidature_existante'] = offre.candidatures.filter(candidat=user).first()
        return context


class OffreCreateView(RHOrAdminMixin, CreateView):
    """Create a new job offer (RH/admin only)."""

    model = Offre
    form_class = OffreForm
    template_name = 'offres/form.html'
    success_url = reverse_lazy('offres:list')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['action'] = 'Créer'
        return context

    def form_valid(self, form):
        form.instance.created_by = self.request.user
        form.instance.company = self.request.user.company
        # Handle publish-directly button
        super().form_valid(form)
        offre = self.object
        # Update competences from hidden JSON input
        offre.competences = form.get_competences_list()
        _update_competence_counts(offre.competences)
        # Direct publish if requested
        if 'publier' in self.request.POST:
            offre.publish()
        else:
            offre.save()
        messages.success(self.request, f'Offre "{offre.titre}" créée avec succès.')
        return redirect(self.success_url)


class OffreUpdateView(RHOrAdminMixin, UpdateView):
    """Edit an existing offer (RH/admin only)."""

    model = Offre
    form_class = OffreForm
    template_name = 'offres/form.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['action'] = 'Modifier'
        return context

    def get_success_url(self):
        return reverse_lazy('offres:detail', kwargs={'pk': self.object.pk})

    def form_valid(self, form):
        super().form_valid(form)
        offre = self.object
        offre.competences = form.get_competences_list()
        _update_competence_counts(offre.competences)
        offre.save()
        messages.success(self.request, f'Offre "{offre.titre}" mise à jour.')
        return redirect(self.get_success_url())


class OffreDeleteView(RHOrAdminMixin, DeleteView):
    """Delete an offer — blocked if active candidatures exist."""

    model = Offre
    template_name = 'offres/confirm_delete.html'
    success_url = reverse_lazy('offres:list')

    def get(self, request, *args, **kwargs):
        offre = self.get_object()
        # Block deletion if active candidatures exist
        if (
            hasattr(offre, 'candidatures')
            and offre.candidatures.filter(statut__in=['soumise', 'en_cours']).exists()
        ):
            messages.error(
                request,
                'Impossible de supprimer cette offre : des candidatures actives existent.',
            )
            return redirect('offres:detail', pk=offre.pk)
        return super().get(request, *args, **kwargs)

    def form_valid(self, form):
        offre = self.get_object()
        messages.success(self.request, f'Offre "{offre.titre}" supprimée.')
        return super().form_valid(form)


class OffrePublishView(RHOrAdminMixin, View):
    """Publish an offer via POST request."""

    def post(self, request, pk):
        offre = get_object_or_404(Offre, pk=pk)
        offre.publish()
        messages.success(request, f'Offre "{offre.titre}" publiée.')
        return redirect('offres:detail', pk=pk)


class CompetenceAutocompleteView(LoginRequiredMixin, View):
    """AJAX endpoint returning competence suggestions for Select2."""

    def get(self, request):
        q = request.GET.get('q', '')
        comps = Competence.objects.filter(nom__icontains=q)[:10]
        data = [{'id': c.nom, 'text': c.nom, 'categorie': c.categorie} for c in comps]
        return JsonResponse({'results': data})


class OffreSearchView(LoginRequiredMixin, ListView):
    """Full-text search + filter view for job offers."""

    template_name = 'offres/search.html'
    context_object_name = 'offres'
    paginate_by = 10

    def get_queryset(self):
        qs = Offre.objects.filter(statut='publiee').select_related('created_by')
        self.filterset = OffreFilter(self.request.GET, queryset=qs)
        return self.filterset.qs

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['filterset'] = self.filterset
        context['total_results'] = self.filterset.qs.count()
        context['selected_type_contrat'] = self.request.GET.getlist('type_contrat')
        return context


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------


def _update_competence_counts(competence_names: list):
    """Ensure each tag exists in Competence table and increment count_usage."""
    for nom in competence_names:
        nom = nom.strip()
        if not nom:
            continue
        obj, created = Competence.objects.get_or_create(nom=nom)
        if not created:
            Competence.objects.filter(pk=obj.pk).update(count_usage=obj.count_usage + 1)
