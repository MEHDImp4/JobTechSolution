"""
Initial migration for evaluations app — Phase 6 Plan 1.
"""

import django.core.validators
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ('entretiens', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Evaluation',
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
                    'competences_rate',
                    models.PositiveSmallIntegerField(
                        validators=[
                            django.core.validators.MinValueValidator(1),
                            django.core.validators.MaxValueValidator(5),
                        ],
                        verbose_name='Compétences techniques',
                    ),
                ),
                (
                    'communication_rate',
                    models.PositiveSmallIntegerField(
                        validators=[
                            django.core.validators.MinValueValidator(1),
                            django.core.validators.MaxValueValidator(5),
                        ],
                        verbose_name='Communication',
                    ),
                ),
                (
                    'motivation_rate',
                    models.PositiveSmallIntegerField(
                        validators=[
                            django.core.validators.MinValueValidator(1),
                            django.core.validators.MaxValueValidator(5),
                        ],
                        verbose_name='Motivation',
                    ),
                ),
                (
                    'adaptabilite_rate',
                    models.PositiveSmallIntegerField(
                        validators=[
                            django.core.validators.MinValueValidator(1),
                            django.core.validators.MaxValueValidator(5),
                        ],
                        verbose_name='Adaptabilité',
                    ),
                ),
                (
                    'culture_fit_rate',
                    models.PositiveSmallIntegerField(
                        validators=[
                            django.core.validators.MinValueValidator(1),
                            django.core.validators.MaxValueValidator(5),
                        ],
                        verbose_name='Culture fit',
                    ),
                ),
                (
                    'commentaires',
                    models.TextField(
                        validators=[django.core.validators.MinLengthValidator(100)],
                        verbose_name='Commentaires',
                    ),
                ),
                (
                    'points_forts',
                    models.TextField(blank=True, verbose_name='Points forts'),
                ),
                (
                    'points_amelioration',
                    models.TextField(blank=True, verbose_name='Points à améliorer'),
                ),
                (
                    'recommandation',
                    models.CharField(
                        choices=[
                            ('retenu', 'Retenu'),
                            ('a_reconsiderer', 'À reconsidérer'),
                            ('non_retenu', 'Non retenu'),
                        ],
                        max_length=20,
                        verbose_name='Recommandation',
                    ),
                ),
                (
                    'statut',
                    models.CharField(
                        choices=[('brouillon', 'Brouillon'), ('soumise', 'Soumise')],
                        default='brouillon',
                        max_length=15,
                        verbose_name='Statut',
                    ),
                ),
                (
                    'soumise_at',
                    models.DateTimeField(blank=True, null=True, verbose_name='Soumise le'),
                ),
                (
                    'pdf_file',
                    models.FileField(
                        blank=True,
                        null=True,
                        upload_to='rapports/',
                        verbose_name='Rapport PDF',
                    ),
                ),
                (
                    'entretien',
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='evaluation',
                        to='entretiens.entretien',
                        verbose_name='Entretien',
                    ),
                ),
                (
                    'recruteur',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='evaluations_creees',
                        to=settings.AUTH_USER_MODEL,
                        verbose_name='Recruteur',
                    ),
                ),
            ],
            options={
                'verbose_name': 'Évaluation',
                'verbose_name_plural': 'Évaluations',
                'ordering': ['-soumise_at'],
                'indexes': [
                    models.Index(fields=['statut'], name='evaluations_statut_idx'),
                    models.Index(fields=['recommandation'], name='evaluations_recommandation_idx'),
                ],
            },
        ),
    ]
