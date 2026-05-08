"""
Initial migration for the entretiens app — Phase 5 Plan 1.
Creates the Entretien table.
"""

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ('candidatures', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Entretien',
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
                ('date_heure', models.DateTimeField(verbose_name='Date et heure')),
                (
                    'duree_minutes',
                    models.IntegerField(
                        choices=[
                            (30, '30 min'),
                            (45, '45 min'),
                            (60, '1h'),
                            (90, '1h30'),
                        ],
                        default=60,
                        verbose_name='Durée (minutes)',
                    ),
                ),
                (
                    'type_entretien',
                    models.CharField(
                        choices=[
                            ('recrutement', 'Recrutement'),
                            ('annuel', 'Entretien annuel'),
                            ('technique', 'Technique'),
                            ('final', 'Final'),
                        ],
                        default='recrutement',
                        max_length=15,
                        verbose_name='Type',
                    ),
                ),
                (
                    'lieu',
                    models.CharField(blank=True, max_length=200, verbose_name='Lieu'),
                ),
                ('lien_visio', models.URLField(blank=True, verbose_name='Lien visio')),
                (
                    'statut',
                    models.CharField(
                        choices=[
                            ('planifie', 'Planifié'),
                            ('en_cours', 'En cours'),
                            ('termine', 'Terminé'),
                            ('annule', 'Annulé'),
                        ],
                        default='planifie',
                        max_length=15,
                        verbose_name='Statut',
                    ),
                ),
                ('notes', models.TextField(blank=True, verbose_name='Notes')),
                (
                    'candidat',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='entretiens_candidat',
                        to=settings.AUTH_USER_MODEL,
                        verbose_name='Candidat',
                    ),
                ),
                (
                    'recruteur',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='entretiens_recruteur',
                        to=settings.AUTH_USER_MODEL,
                        verbose_name='Recruteur',
                    ),
                ),
                (
                    'candidature',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name='entretiens',
                        to='candidatures.candidature',
                        verbose_name='Candidature',
                    ),
                ),
                (
                    'created_by',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='entretiens_crees',
                        to=settings.AUTH_USER_MODEL,
                        verbose_name='Créé par',
                    ),
                ),
            ],
            options={
                'verbose_name': 'Entretien',
                'verbose_name_plural': 'Entretiens',
                'ordering': ['date_heure'],
            },
        ),
        migrations.AddIndex(
            model_name='entretien',
            index=models.Index(fields=['recruteur', 'date_heure'], name='entretiens__recrute_idx'),
        ),
        migrations.AddIndex(
            model_name='entretien',
            index=models.Index(fields=['candidat', 'statut'], name='entretiens__candida_idx'),
        ),
    ]
