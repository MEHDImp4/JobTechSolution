from django.conf import settings
from django.db import models


class Offre(models.Model):
    TYPE_CONTRAT = [
        ('CDI', 'CDI'),
        ('CDD', 'CDD'),
        ('STAGE', 'Stage'),
        ('FREELANCE', 'Freelance'),
    ]

    STATUTS = [
        ('ouverte', 'Ouverte'),
        ('en_cours', 'En cours'),
        ('cloturee', 'Cloturee'),
    ]

    titre = models.CharField(max_length=200)
    description = models.TextField()
    competences_requises = models.TextField(help_text='Liste simple de competences separees par des virgules.')
    experience_demandee = models.PositiveIntegerField(default=0)
    type_contrat = models.CharField(max_length=15, choices=TYPE_CONTRAT)
    salaire_estime = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    statut = models.CharField(max_length=15, choices=STATUTS, default='ouverte')
    cree_par = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='offres_creees')
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date_creation']

    def __str__(self):
        return self.titre

    def skill_list(self):
        return [skill.strip().lower() for skill in self.competences_requises.split(',') if skill.strip()]
