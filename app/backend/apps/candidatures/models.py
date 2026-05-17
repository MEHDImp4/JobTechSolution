from uuid import uuid4

from django.conf import settings
from django.core.validators import FileExtensionValidator, MaxValueValidator, MinValueValidator
from django.db import models


def cv_upload_path(instance, filename):
    ext = filename.rsplit('.', 1)[-1].lower()
    unique_name = f'{uuid4().hex}.{ext}'
    return f'cvs/{instance.candidat.id}/{unique_name}'


class Candidature(models.Model):
    STATUTS = [
        ('en_attente', 'En attente'),
        ('en_cours', 'En cours'),
        ('preselectionne', 'Preselectionne'),
        ('rejete', 'Rejete'),
        ('accepte', 'Accepte'),
    ]

    offre = models.ForeignKey('offres.Offre', on_delete=models.CASCADE, related_name='candidatures')
    candidat = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='candidatures')
    cv_file = models.FileField(upload_to=cv_upload_path, validators=[FileExtensionValidator(['pdf', 'doc', 'docx'])])
    message = models.TextField(blank=True)
    statut = models.CharField(max_length=20, choices=STATUTS, default='en_attente')
    matching_score = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    cv_text = models.TextField(blank=True)
    ai_summary = models.CharField(max_length=255, blank=True)
    ai_extracted_data = models.JSONField(default=dict, blank=True)
    date_soumission = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [('offre', 'candidat')]
        ordering = ['-date_soumission']

    def __str__(self):
        return f'{self.candidat.username} -> {self.offre.titre}'
