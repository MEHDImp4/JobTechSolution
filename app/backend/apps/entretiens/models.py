from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class Entretien(models.Model):
    STATUTS = [
        ('planifie', 'Planifie'),
        ('termine', 'Termine'),
        ('annule', 'Annule'),
    ]

    candidature = models.ForeignKey('candidatures.Candidature', on_delete=models.CASCADE, related_name='entretiens')
    evaluateur = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='entretiens_evalues')
    date_heure = models.DateTimeField()
    statut = models.CharField(max_length=15, choices=STATUTS, default='planifie')
    notes = models.TextField(blank=True)
    commentaires = models.TextField(blank=True)
    recommandation = models.TextField(blank=True)
    score_communication = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    score_competences = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    score_motivation = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    score_adaptabilite = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    score_culture_fit = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    score_global = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    points_forts = models.TextField(blank=True)
    points_amelioration = models.TextField(blank=True)

    class Meta:
        ordering = ['-date_heure']

    def __str__(self):
        return f'{self.candidature.offre.titre} - {self.candidature.candidat.username}'
