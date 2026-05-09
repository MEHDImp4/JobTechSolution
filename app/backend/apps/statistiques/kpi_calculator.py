from collections import Counter

from django.db.models import Avg, DurationField, ExpressionWrapper, F, Max, Min


class RHKPICalculator:
    def __init__(self, date_debut=None, date_fin=None):
        from apps.candidatures.models import Candidature

        self.qs = Candidature.objects.all()
        if date_debut:
            self.qs = self.qs.filter(date_postulation__date__gte=date_debut)
        if date_fin:
            self.qs = self.qs.filter(date_postulation__date__lte=date_fin)

    def get_funnel(self) -> dict:
        total = self.qs.count()
        if not total:
            return {
                'total': 0,
                'preselectionnes': 0,
                'entretiens': 0,
                'retenus': 0,
                'taux': 0,
            }

        # Préselectionnés = statut changed from 'nouveau'
        presel = self.qs.filter(statut__in=['examen_rh', 'entretien', 'retenu', 'refuse']).count()
        # Entretiens = at least one interview linked
        entretiens = self.qs.filter(entretiens__isnull=False).distinct().count()
        retenus = self.qs.filter(statut='retenu').count()

        return {
            'total': total,
            'preselectionnes': presel,
            'entretiens': entretiens,
            'retenus': retenus,
            'taux': round(retenus / total * 100, 1) if total > 0 else 0,
        }

    def get_delai_moyen(self) -> float:
        from apps.evaluations.models import Evaluation

        # Délai entre postulation et soumission de l'évaluation finale
        result = (
            Evaluation.objects.filter(statut='soumise')
            .annotate(
                duree=ExpressionWrapper(
                    F('soumise_at') - F('entretien__candidature__date_postulation'),
                    output_field=DurationField(),
                )
            )
            .aggregate(moy=Avg('duree'))
        )

        if result['moy']:
            return round(result['moy'].days, 1)
        return 0

    def get_score_stats(self) -> dict:
        return self.qs.exclude(score_ia__isnull=True).aggregate(
            avg=Avg('score_ia'), max=Max('score_ia'), min=Min('score_ia')
        )

    def get_top_competences(self, n=8) -> list:
        from apps.offres.models import Offre

        counter = Counter()
        # On récupère les compétences des offres publiées
        for competences in Offre.objects.filter(statut='publiee').values_list(
            'competences', flat=True
        ):
            if isinstance(competences, list):
                counter.update(competences)
        return counter.most_common(n)

    def get_dashboard_stats(self) -> dict:
        from apps.offres.models import Offre

        top_candidats = []
        top_qs = (
            self.qs.select_related('candidat', 'offre')
            .exclude(score_ia__isnull=True)
            .order_by('-score_ia')[:5]
        )

        for candidature in top_qs:
            full_name = candidature.candidat.get_full_name
            if callable(full_name):
                full_name = full_name()

            top_candidats.append(
                {
                    'nom': full_name or candidature.candidat.email,
                    'offre': candidature.offre.titre,
                    'score': candidature.score_ia or 0,
                }
            )

        return {
            'total_offres': Offre.objects.filter(statut='publiee').count(),
            'total_candidatures': self.qs.count(),
            'total_entretiens': self.qs.filter(entretiens__isnull=False).distinct().count(),
            'recrutements_reussis': self.qs.filter(statut='retenu').count(),
            'top_candidats': top_candidats,
        }

    def get_all(self) -> dict:
        return {
            'funnel': self.get_funnel(),
            'delai_moyen': self.get_delai_moyen(),
            'score_stats': self.get_score_stats(),
            'top_competences': self.get_top_competences(),
        }
