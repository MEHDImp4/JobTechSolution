"""
Générateur de graphiques pour le tableau de bord RH.
Génère des images encodées en base64 à partir de Matplotlib.
"""

import base64
import itertools
from io import BytesIO


class DashboardChartGenerator:
    """Génère des graphiques au format base64 pour l'affichage web."""

    def _to_base64(self, fig) -> str:
        """Convertit une figure Matplotlib en chaîne base64 PNG."""
        import matplotlib
        matplotlib.use('Agg')
        import matplotlib.pyplot as plt

        buf = BytesIO()
        fig.savefig(buf, format='png', dpi=100, bbox_inches='tight', transparent=True)
        buf.seek(0)
        plt.close(fig)
        return base64.b64encode(buf.read()).decode()

    def score_distribution(self, candidatures_qs) -> str:
        """Graphique à barres montrant la répartition des scores IA."""
        import matplotlib
        matplotlib.use('Agg')
        import matplotlib.pyplot as plt

        scores = list(
            candidatures_qs.exclude(score_ia__isnull=True).values_list('score_ia', flat=True)
        )
        if not scores:
            return ''

        fig, ax = plt.subplots(figsize=(6, 4))
        bins = [0, 20, 40, 60, 80, 100]
        colors_list = ['#DC2626', '#EF4444', '#F59E0B', '#86EFAC', '#16A34A']
        counts, edges = [], []
        for start, end in itertools.pairwise(bins):
            bucket_count = sum(start <= score < end for score in scores)
            counts.append(bucket_count)
            edges.append(start)

        # Inclure les scores parfaits (100) dans le dernier bac
        if scores:
            counts[-1] += sum(score == bins[-1] for score in scores)

        ax.bar(
            edges,
            counts,
            width=20,
            align='edge',
            color=colors_list,
            edgecolor='white',
        )
        ax.set_xlabel('Score IA (%)', labelpad=10)
        ax.set_ylabel('Nombre de candidatures')
        ax.set_title('Distribution des scores IA')
        ax.set_xticks(bins)
        ax.set_xticklabels(['0', '20', '40', '60', '80', '100'])
        return self._to_base64(fig)

    def candidatures_timeline(self, candidatures_qs, days=30) -> str:
        """Graphique en aire montrant l'évolution des candidatures sur 30 jours."""
        import matplotlib
        matplotlib.use('Agg')
        from datetime import timedelta
        import matplotlib.pyplot as plt
        from django.utils import timezone

        end = timezone.now().date()
        start = end - timedelta(days=days)

        date_list = []
        current = start
        while current <= end:
            date_list.append(current)
            current += timedelta(days=1)

        counts = [candidatures_qs.filter(date_postulation__date=d).count() for d in date_list]

        if not any(counts):
            return ''

        fig, ax = plt.subplots(figsize=(8, 4))
        x = range(len(date_list))
        ax.fill_between(x, counts, alpha=0.3, color='#2E75B6')
        ax.plot(x, counts, color='#1F4E79', linewidth=2)
        ax.set_title(f'Candidatures — {days} derniers jours')

        n = len(date_list)
        ax.set_xticks([0, n // 2, n - 1])
        ax.set_xticklabels(
            [
                date_list[0].strftime('%d/%m'),
                date_list[n // 2].strftime('%d/%m'),
                date_list[-1].strftime('%d/%m'),
            ]
        )
        return self._to_base64(fig)

    def recommendations_pie(self, evaluations_qs) -> str:
        """Graphique circulaire montrant la répartition des recommandations."""
        import matplotlib
        matplotlib.use('Agg')
        import matplotlib.pyplot as plt
        from django.db.models import Count

        data = dict(
            evaluations_qs.values('recommandation')
            .annotate(n=Count('id'))
            .values_list('recommandation', 'n')
        )
        if not data:
            return ''

        labels = ['Retenu', 'À reconsidérer', 'Non retenu']
        keys = ['retenu', 'a_reconsiderer', 'non_retenu']
        vals = [data.get(k, 0) for k in keys]
        colors_list = ['#16A34A', '#F59E0B', '#DC2626']

        filtered = []
        for l, v, c in zip(labels, vals, colors_list):
            if v > 0:
                filtered.append((l, v, c))
        if not filtered:
            return ''

        f_labels, f_vals, f_colors = zip(*filtered, strict=False)

        fig, ax = plt.subplots(figsize=(5, 5))
        ax.pie(
            f_vals,
            labels=f_labels,
            colors=f_colors,
            autopct='%1.0f%%',
            startangle=90,
        )
        ax.set_title('Répartition des recommandations')
        return self._to_base64(fig)
