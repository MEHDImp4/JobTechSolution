"""
Modèles pour le stockage des données extraites par l'IA et des scores.
"""

from django.db import models


class CVData(models.Model):
    """Données extraites d'un CV via traitement NLP."""

    candidature = models.OneToOneField(
        'candidatures.Candidature',
        on_delete=models.CASCADE,
        related_name='cv_data',
        verbose_name='Candidature',
    )
    texte_brut = models.TextField(blank=True, verbose_name='Texte brut extrait')
    competences_extraites = models.JSONField(default=list, verbose_name='Compétences extraites')
    experience_annees = models.IntegerField(
        null=True, blank=True, verbose_name="Années d'expérience"
    )
    formations = models.JSONField(default=list, verbose_name='Formations')
    langues = models.JSONField(default=list, verbose_name='Langues')
    resume_ia = models.TextField(
        blank=True,
        verbose_name='Résumé IA',
        help_text='Synthèse du CV générée automatiquement par le LLM.',
    )
    questions_ia = models.JSONField(
        default=list,
        verbose_name="Questions d'entretien IA",
        help_text="Questions d'entretien suggérées par l'IA.",
    )
    extracted_at = models.DateTimeField(auto_now_add=True, verbose_name='Extrait le')
    extraction_error = models.TextField(blank=True, verbose_name="Erreur d'extraction")

    class Meta:
        verbose_name = 'Données CV'
        verbose_name_plural = 'Données CV'

    def __str__(self):
        return f'CVData({self.candidature_id})'


class ScoreDetail(models.Model):
    """Détail du calcul du score de compatibilité."""

    candidature = models.OneToOneField(
        'candidatures.Candidature',
        on_delete=models.CASCADE,
        related_name='score_detail',
        verbose_name='Candidature',
    )
    score_competences = models.FloatField(default=0, verbose_name='Score compétences (%)')
    score_experience = models.FloatField(default=0, verbose_name='Score expérience (%)')
    score_global = models.FloatField(default=0, verbose_name='Score global (%)')
    matching_competences = models.JSONField(
        default=list, verbose_name='Compétences correspondantes'
    )
    missing_competences = models.JSONField(default=list, verbose_name='Compétences manquantes')
    calculated_at = models.DateTimeField(auto_now_add=True, verbose_name='Calculé le')

    class Meta:
        verbose_name = 'Détail score IA'
        verbose_name_plural = 'Détails scores IA'

    def __str__(self):
        return f'ScoreDetail({self.candidature_id}) — {self.score_global}%'
