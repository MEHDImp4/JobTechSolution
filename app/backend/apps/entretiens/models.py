"""
Modèles pour la gestion des entretiens et du planning.
"""

from datetime import timedelta
from django.conf import settings
from django.db import models


class Entretien(models.Model):
    """Modèle représentant un entretien programmé."""

    TYPES = [
        ('recrutement', 'Recrutement'),
        ('annuel', 'Entretien annuel'),
        ('technique', 'Technique'),
        ('final', 'Final'),
    ]

    STATUTS = [
        ('planifie', 'Planifié'),
        ('en_cours', 'En cours'),
        ('termine', 'Terminé'),
        ('annule', 'Annulé'),
    ]

    DUREES = [
        (30, '30 min'),
        (45, '45 min'),
        (60, '1h'),
        (90, '1h30'),
    ]

    candidat = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='entretiens_candidat',
        verbose_name='Candidat',
    )
    recruteur = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='entretiens_recruteur',
        verbose_name='Recruteur',
    )
    candidature = models.ForeignKey(
        'candidatures.Candidature',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='entretiens',
        verbose_name='Candidature',
    )
    date_heure = models.DateTimeField(verbose_name='Date et heure')
    duree_minutes = models.IntegerField(
        choices=DUREES,
        default=60,
        verbose_name='Durée (minutes)',
    )
    type_entretien = models.CharField(
        max_length=15,
        choices=TYPES,
        default='recrutement',
        verbose_name='Type',
    )
    lieu = models.CharField(max_length=200, blank=True, verbose_name='Lieu')
    lien_visio = models.URLField(blank=True, verbose_name='Lien visio')
    statut = models.CharField(
        max_length=15,
        choices=STATUTS,
        default='planifie',
        verbose_name='Statut',
    )
    notes = models.TextField(blank=True, verbose_name='Notes')
    resume_ia = models.TextField(blank=True, verbose_name='Résumé IA')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='entretiens_crees',
        verbose_name='Créé par',
    )

    class Meta:
        ordering = ['date_heure']
        indexes = [
            models.Index(fields=['recruteur', 'date_heure']),
            models.Index(fields=['candidat', 'statut']),
        ]
        verbose_name = 'Entretien'
        verbose_name_plural = 'Entretiens'

    def __str__(self):
        return (
            f'{self.get_type_entretien_display()} — '
            f'{self.candidat.get_full_name()} '
            f'le {self.date_heure.strftime("%d/%m/%Y %H:%M")}'
        )

    @property
    def end_time(self):
        """Calcul de l'heure de fin."""
        return self.date_heure + timedelta(minutes=self.duree_minutes)

    def check_conflict(self):
        """Vérifie si le recruteur a déjà un entretien sur ce créneau."""
        end = self.end_time
        return (
            Entretien.objects.filter(
                recruteur=self.recruteur,
                statut__in=['planifie', 'en_cours'],
                date_heure__lt=end,
                date_heure__gte=self.date_heure - timedelta(minutes=self.duree_minutes),
            )
            .exclude(pk=self.pk)
            .exists()
        )


class ObjectifEntretien(models.Model):
    """Objectifs spécifiques à évaluer durant l'entretien."""

    entretien = models.ForeignKey(
        Entretien, on_delete=models.CASCADE, related_name='objectifs', verbose_name='Entretien'
    )
    titre = models.CharField(max_length=255, verbose_name='Objectif')
    est_atteint = models.BooleanField(default=False, verbose_name='Atteint')

    class Meta:
        verbose_name = "Objectif d'entretien"
        verbose_name_plural = "Objectifs d'entretien"

    def __str__(self):
        status = '✅' if self.est_atteint else '❌'
        return f'{status} {self.titre}'
