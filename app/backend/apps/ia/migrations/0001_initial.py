"""
Initial migration for apps.ia — Phase 4 Plan 1.
Creates CVData and ScoreDetail tables.
"""

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ('candidatures', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='CVData',
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
                    'texte_brut',
                    models.TextField(blank=True, verbose_name='Texte brut extrait'),
                ),
                (
                    'competences_extraites',
                    models.JSONField(default=list, verbose_name='Compétences extraites'),
                ),
                (
                    'experience_annees',
                    models.IntegerField(blank=True, null=True, verbose_name="Années d'expérience"),
                ),
                (
                    'formations',
                    models.JSONField(default=list, verbose_name='Formations'),
                ),
                ('langues', models.JSONField(default=list, verbose_name='Langues')),
                (
                    'extracted_at',
                    models.DateTimeField(auto_now_add=True, verbose_name='Extrait le'),
                ),
                (
                    'extraction_error',
                    models.TextField(blank=True, verbose_name="Erreur d'extraction"),
                ),
                (
                    'candidature',
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='cv_data',
                        to='candidatures.candidature',
                        verbose_name='Candidature',
                    ),
                ),
            ],
            options={
                'verbose_name': 'Données CV',
                'verbose_name_plural': 'Données CV',
            },
        ),
        migrations.CreateModel(
            name='ScoreDetail',
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
                    'score_competences',
                    models.FloatField(default=0, verbose_name='Score compétences (%)'),
                ),
                (
                    'score_experience',
                    models.FloatField(default=0, verbose_name='Score expérience (%)'),
                ),
                (
                    'score_global',
                    models.FloatField(default=0, verbose_name='Score global (%)'),
                ),
                (
                    'matching_competences',
                    models.JSONField(default=list, verbose_name='Compétences correspondantes'),
                ),
                (
                    'missing_competences',
                    models.JSONField(default=list, verbose_name='Compétences manquantes'),
                ),
                (
                    'calculated_at',
                    models.DateTimeField(auto_now_add=True, verbose_name='Calculé le'),
                ),
                (
                    'candidature',
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='score_detail',
                        to='candidatures.candidature',
                        verbose_name='Candidature',
                    ),
                ),
            ],
            options={
                'verbose_name': 'Détail score IA',
                'verbose_name_plural': 'Détails scores IA',
            },
        ),
    ]
