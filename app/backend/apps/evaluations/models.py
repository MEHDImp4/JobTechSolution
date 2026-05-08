"""
Modèles pour les évaluations structurées des entretiens.
"""

from django.conf import settings
from django.core.validators import (
    MaxValueValidator,
    MinLengthValidator,
    MinValueValidator,
)
from django.db import models


class Evaluation(models.Model):
    """Évaluation structurée avec critères de notation et génération de rapport PDF."""

    RECOMMANDATIONS = [
        ('retenu', 'Retenu'),
        ('a_reconsiderer', 'À reconsidérer'),
        ('non_retenu', 'Non retenu'),
    ]

    SENTIMENTS = [
        ('positif', 'Positif'),
        ('neutre', 'Neutre'),
        ('negatif', 'Négatif'),
    ]

    STATUTS = [
        ('brouillon', 'Brouillon'),
        ('soumise', 'Soumise'),
    ]

    entretien = models.OneToOneField(
        'entretiens.Entretien',
        on_delete=models.CASCADE,
        related_name='evaluation',
        verbose_name='Entretien',
    )
    recruteur = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='evaluations_creees',
        verbose_name='Recruteur',
    )
    competences_rate = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name='Compétences techniques',
    )
    communication_rate = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name='Communication',
    )
    motivation_rate = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name='Motivation',
    )
    adaptabilite_rate = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name='Adaptabilité',
    )
    culture_fit_rate = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name='Culture fit',
    )
    commentaires = models.TextField(
        validators=[MinLengthValidator(100)],
        verbose_name='Commentaires',
    )
    points_forts = models.TextField(blank=True, verbose_name='Points forts')
    points_amelioration = models.TextField(blank=True, verbose_name='Points à améliorer')
    recommandation = models.CharField(
        max_length=20,
        choices=RECOMMANDATIONS,
        verbose_name='Recommandation',
    )
    statut = models.CharField(
        max_length=15,
        choices=STATUTS,
        default='brouillon',
        verbose_name='Statut',
    )

    # Champs pour l'analyse IA
    sentiment_ia = models.CharField(
        max_length=10,
        choices=SENTIMENTS,
        blank=True,
        null=True,
        verbose_name='Sentiment IA',
    )
    recommandation_ia = models.TextField(
        blank=True,
        null=True,
        verbose_name='Recommandation IA',
    )

    soumise_at = models.DateTimeField(null=True, blank=True, verbose_name='Soumise le')
    pdf_file = models.FileField(
        upload_to='rapports/',
        null=True,
        blank=True,
        verbose_name='Rapport PDF',
    )

    class Meta:
        ordering = ['-soumise_at']
        indexes = [
            models.Index(fields=['statut']),
            models.Index(fields=['recommandation']),
        ]
        verbose_name = 'Évaluation'
        verbose_name_plural = 'Évaluations'

    def __str__(self):
        return (
            f'Évaluation — {self.entretien.candidat.get_full_name()} ({self.get_statut_display()})'
        )

    @property
    def moyenne_score(self):
        scores = [
            self.competences_rate,
            self.communication_rate,
            self.motivation_rate,
            self.adaptabilite_rate,
            self.culture_fit_rate,
        ]
        valid = []
        for s in scores:
            if s:
                valid.append(s)
        if not valid:
            return 0
        return round(sum(valid) / len(valid), 1)
