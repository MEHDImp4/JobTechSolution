"""
Générateur de rapports PDF pour les évaluations d'entretien.
Génère un document structuré avec un graphique radar.
"""

from io import BytesIO


class EvaluationPDFGenerator:
    """Génère un rapport d'évaluation complet en PDF."""

    LABELS = [
        'Comp\u00e9tences techniques',
        'Communication',
        'Motivation',
        'Adaptabilit\u00e9',
        'Culture fit',
    ]

    APPRECIATIONS = {
        1: 'Insuffisant',
        2: 'Passable',
        3: 'Correct',
        4: 'Bien',
        5: 'Excellent',
    }

    RECO_COLORS = {
        'retenu': '#16A34A',
        'a_reconsiderer': '#D97706',
        'non_retenu': '#DC2626',
    }

    def generate(self, evaluation) -> BytesIO:
        """Génère le PDF et retourne le flux de données."""
        from reportlab.lib import colors
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet
        from reportlab.platypus import (
            Image,
            Paragraph,
            SimpleDocTemplate,
            Spacer,
            Table,
        )

        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            topMargin=72,
            bottomMargin=72,
            leftMargin=72,
            rightMargin=72,
        )
        story = []
        styles = getSampleStyleSheet()

        # Titre du rapport
        candidat_name = evaluation.entretien.candidat.get_full_name
        story.append(
            Paragraph(
                f'Evaluation \u2014 {candidat_name}',
                styles['Title'],
            )
        )
        story.append(Spacer(1, 8))

        # Informations de l'offre
        if evaluation.entretien.candidature:
            offre_titre = evaluation.entretien.candidature.offre.titre
        else:
            offre_titre = 'N/A'
        story.append(Paragraph(f'Offre : {offre_titre}', styles['Normal']))
        date_str = evaluation.entretien.date_heure.strftime('%d/%m/%Y')
        story.append(Paragraph(f'Date : {date_str}', styles['Normal']))
        story.append(Spacer(1, 16))

        # Tableau des notes
        vals = [
            evaluation.competences_rate,
            evaluation.communication_rate,
            evaluation.motivation_rate,
            evaluation.adaptabilite_rate,
            evaluation.culture_fit_rate,
        ]
        table_data = [['Crit\u00e8re', 'Note', 'Appr\u00e9ciation']]
        for label, val in zip(self.LABELS, vals, strict=False):
            table_data.append([label, f'{val}/5', self.APPRECIATIONS.get(val, '')])
        table_data.append(['MOYENNE', f'{evaluation.moyenne_score}/5', ''])

        t = Table(table_data, colWidths=[250, 60, 150])
        t.setStyle(
            [
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                (
                    'ROWBACKGROUNDS',
                    (0, 1),
                    (-1, -1),
                    [colors.white, colors.HexColor('#EBF3FB')],
                ),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
                ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ]
        )
        story.append(t)
        story.append(Spacer(1, 16))

        # Graphique radar
        radar_img = self._radar_chart(self.LABELS, vals)
        story.append(Image(radar_img, width=280, height=220))
        story.append(Spacer(1, 16))

        # Commentaires et verdict
        story.append(Paragraph('Commentaires :', styles['Heading2']))
        story.append(Paragraph(evaluation.commentaires, styles['Normal']))
        story.append(Spacer(1, 8))

        if evaluation.points_forts:
            story.append(Paragraph('Points forts :', styles['Heading2']))
            story.append(Paragraph(evaluation.points_forts, styles['Normal']))
            story.append(Spacer(1, 8))

        if evaluation.points_amelioration:
            story.append(Paragraph('Points \u00e0 am\u00e9liorer :', styles['Heading2']))
            story.append(Paragraph(evaluation.points_amelioration, styles['Normal']))
            story.append(Spacer(1, 8))

        reco_color = self.RECO_COLORS.get(evaluation.recommandation, '#1F4E79')
        story.append(
            Paragraph(
                f'<para backColor="{reco_color}" textColor="white" borderPadding="8">'
                f'Recommandation : {evaluation.get_recommandation_display()}</para>',
                styles['Normal'],
            )
        )

        doc.build(story)
        buffer.seek(0)
        return buffer

    def _radar_chart(self, labels, values) -> BytesIO:
        """Génère le graphique radar Matplotlib."""
        import matplotlib
        matplotlib.use('Agg')
        import matplotlib.pyplot as plt
        import numpy as np

        N = len(labels)
        angles = np.linspace(0, 2 * np.pi, N, endpoint=False).tolist()
        angles += angles[:1]
        vals = [*list(values), values[0]]

        fig, ax = plt.subplots(figsize=(4, 4), subplot_kw=dict(polar=True))
        ax.fill(angles, vals, color='#2E75B6', alpha=0.25)
        ax.plot(angles, vals, 'o-', color='#1F4E79', linewidth=2)
        ax.set_xticks(angles[:-1])
        ax.set_xticklabels(labels, size=8)
        ax.set_ylim(0, 5)
        ax.set_yticks([1, 2, 3, 4, 5])
        ax.set_title('Profil de comp\u00e9tences', pad=15)

        buf = BytesIO()
        fig.savefig(buf, format='png', dpi=100, bbox_inches='tight')
        buf.seek(0)
        plt.close(fig)
        return buf
