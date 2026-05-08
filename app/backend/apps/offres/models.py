"""
Modèles pour la gestion des offres d'emploi et des compétences.
"""

from django.conf import settings
from django.db import models
from django.utils import timezone


class Competence(models.Model):
    """Tag représentant une compétence requise."""

    CATEGORIES = [
        ('langage', 'Langage'),
        ('framework', 'Framework'),
        ('outil', 'Outil'),
        ('soft_skill', 'Soft Skill'),
        ('autre', 'Autre'),
    ]

    nom = models.CharField(max_length=100, unique=True, verbose_name='Nom')
    categorie = models.CharField(
        max_length=20,
        choices=CATEGORIES,
        default='autre',
        verbose_name='Catégorie',
    )
    count_usage = models.IntegerField(default=0, verbose_name="Nombre d'utilisations")

    class Meta:
        ordering = ['-count_usage']
        verbose_name = 'Compétence'
        verbose_name_plural = 'Compétences'

    def __str__(self):
        return self.nom


class Offre(models.Model):
    """Modèle représentant une offre d'emploi."""

    TYPE_CONTRAT = [
        ('CDI', 'CDI'),
        ('CDD', 'CDD'),
        ('STAGE', 'Stage'),
        ('FREELANCE', 'Freelance'),
    ]

    STATUTS = [
        ('brouillon', 'Brouillon'),
        ('publiee', 'Publiée'),
        ('cloturee', 'Clôturée'),
    ]

    titre = models.CharField(max_length=200, verbose_name='Titre')
    description = models.TextField(verbose_name='Description')
    experience_requise = models.PositiveIntegerField(
        default=0, verbose_name='Expérience requise (années)'
    )
    competences = models.JSONField(default=list, verbose_name='Compétences requises')
    type_contrat = models.CharField(
        max_length=15,
        choices=TYPE_CONTRAT,
        verbose_name='Type de contrat',
    )
    salaire_min = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name='Salaire minimum (MAD)',
    )
    salaire_max = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name='Salaire maximum (MAD)',
    )
    statut = models.CharField(
        max_length=15,
        choices=STATUTS,
        default='brouillon',
        verbose_name='Statut',
    )
    date_publication = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Date de publication',
    )
    date_cloture = models.DateField(
        null=True,
        blank=True,
        verbose_name='Date de clôture',
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='offres_creees',
        verbose_name='Créée par',
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Créée le')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Modifiée le')

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Offre d'emploi"
        verbose_name_plural = "Offres d'emploi"
        indexes = [
            models.Index(fields=['statut']),
            models.Index(fields=['type_contrat']),
        ]

    def publish(self):
        """Publie l'offre."""
        self.statut = 'publiee'
        self.date_publication = timezone.now()
        self.save()

    def close(self):
        """Clôture l'offre."""
        self.statut = 'cloturee'
        self.save()

    def get_candidatures_count(self):
        """Retourne le nombre de candidatures."""
        return self.candidatures.count()

    def __str__(self):
        return self.titre
