"""
Initial migration for the candidatures app.
Creates the Candidature model with CV upload, statut, and IA status.
"""

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models

import apps.candidatures.models
import apps.candidatures.validators


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ('offres', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Candidature',
            fields=[
                (
                    'id',
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name='ID',
                    ),
                ),
                (
                    'cv_file',
                    models.FileField(
                        upload_to=apps.candidatures.models.cv_upload_path,
                        validators=[apps.candidatures.validators.validate_cv_file],
                        verbose_name='CV (PDF/DOCX)',
                    ),
                ),
                (
                    'cv_file_original_name',
                    models.CharField(
                        blank=True,
                        max_length=255,
                        verbose_name='Nom original du fichier',
                    ),
                ),
                (
                    'lettre_motivation',
                    models.TextField(
                        blank=True, max_length=2000, verbose_name='Lettre de motivation'
                    ),
                ),
                (
                    'date_postulation',
                    models.DateTimeField(auto_now_add=True, verbose_name='Date de postulation'),
                ),
                (
                    'statut',
                    models.CharField(
                        choices=[
                            ('recue', 'Reçue'),
                            ('analyse_ia', 'Analyse IA'),
                            ('examen_rh', 'Examen RH'),
                            ('entretien', 'Entretien planifié'),
                            ('retenu', 'Retenu'),
                            ('refuse', 'Refusé'),
                        ],
                        default='recue',
                        max_length=20,
                        verbose_name='Statut',
                    ),
                ),
                (
                    'score_ia',
                    models.FloatField(blank=True, default=0, null=True, verbose_name='Score IA'),
                ),
                (
                    'ia_status',
                    models.CharField(
                        choices=[
                            ('pending', 'En attente'),
                            ('processing', 'En cours'),
                            ('done', 'Terminé'),
                            ('error', 'Erreur'),
                        ],
                        default='pending',
                        max_length=15,
                        verbose_name='Statut analyse IA',
                    ),
                ),
                (
                    'offre',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='candidatures',
                        to='offres.offre',
                        verbose_name='Offre',
                    ),
                ),
                (
                    'candidat',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='candidatures',
                        to=settings.AUTH_USER_MODEL,
                        verbose_name='Candidat',
                    ),
                ),
            ],
            options={
                'verbose_name': 'Candidature',
                'verbose_name_plural': 'Candidatures',
                'ordering': ['-date_postulation'],
                'indexes': [
                    models.Index(fields=['statut'], name='candidature_statut_idx'),
                    models.Index(fields=['score_ia'], name='candidature_score_ia_idx'),
                ],
                'unique_together': {('offre', 'candidat')},
            },
        ),
    ]
