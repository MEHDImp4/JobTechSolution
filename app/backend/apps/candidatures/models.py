"""
Modèles pour la gestion des candidatures.
"""

from uuid import uuid4

from django.conf import settings
from django.db import models

from .validators import validate_cv_file


def cv_upload_path(instance, filename):
    """Définit le chemin de stockage des CV."""
    ext = filename.rsplit('.', 1)[-1].lower()
    unique_name = f'{uuid4().hex}.{ext}'
    return f'cvs/{instance.candidat.id}/{unique_name}'


class Candidature(models.Model):
    """Représente une candidature d'un candidat pour une offre spécifique."""

    STATUTS = [
        ('recue', 'Reçue'),
        ('analyse_ia', 'Analyse IA'),
        ('examen_rh', 'Examen RH'),
        ('entretien', 'Entretien planifié'),
        ('retenu', 'Retenu'),
        ('refuse', 'Refusé'),
    ]

    IA_STATUS = [
        ('pending', 'En attente'),
        ('processing', 'En cours'),
        ('done', 'Terminé'),
        ('error', 'Erreur'),
    ]

    offre = models.ForeignKey(
        'offres.Offre',
        on_delete=models.CASCADE,
        related_name='candidatures',
        verbose_name='Offre',
    )
    candidat = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='candidatures',
        verbose_name='Candidat',
    )
    cv_file = models.FileField(
        upload_to=cv_upload_path,
        validators=[validate_cv_file],
        verbose_name='CV (PDF/DOCX)',
    )
    cv_file_original_name = models.CharField(
        max_length=255,
        blank=True,
        verbose_name='Nom original du fichier',
    )
    lettre_motivation = models.TextField(
        blank=True,
        max_length=2000,
        verbose_name='Lettre de motivation',
    )
    experience_annees = models.IntegerField(
        null=True,
        blank=True,
        verbose_name="Années d'expérience (déclarées)",
    )
    linkedin_url = models.URLField(
        blank=True,
        max_length=500,
        verbose_name='Profil LinkedIn',
    )
    date_postulation = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Date de postulation',
    )
    statut = models.CharField(
        max_length=20,
        choices=STATUTS,
        default='recue',
        verbose_name='Statut',
    )
    score_ia = models.FloatField(
        null=True,
        blank=True,
        default=0,
        verbose_name='Score IA',
    )
    ia_status = models.CharField(
        max_length=15,
        choices=IA_STATUS,
        default='pending',
        verbose_name='Statut analyse IA',
    )

    class Meta:
        unique_together = [('offre', 'candidat')]
        ordering = ['-date_postulation']
        indexes = [
            models.Index(fields=['statut']),
            models.Index(fields=['score_ia']),
        ]
        verbose_name = 'Candidature'
        verbose_name_plural = 'Candidatures'

    def __str__(self):
        return f'{self.candidat} -> {self.offre} ({self.get_statut_display()})'

    def get_statut_step(self):
        """Retourne l'étape actuelle pour l'affichage visuel."""
        step_map = {
            'recue': 1,
            'analyse_ia': 2,
            'examen_rh': 3,
            'entretien': 4,
            'retenu': 5,
            'refuse': 5,
        }
        return step_map.get(self.statut, 1)
