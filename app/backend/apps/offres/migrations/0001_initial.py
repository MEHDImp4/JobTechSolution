"""
Initial migration for offres app — Phase 2 Plan 1.
Creates Competence and Offre tables.
"""

import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Competence',
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
                    'nom',
                    models.CharField(max_length=100, unique=True, verbose_name='Nom'),
                ),
                (
                    'categorie',
                    models.CharField(
                        choices=[
                            ('langage', 'Langage'),
                            ('framework', 'Framework'),
                            ('outil', 'Outil'),
                            ('soft_skill', 'Soft Skill'),
                            ('autre', 'Autre'),
                        ],
                        default='autre',
                        max_length=20,
                        verbose_name='Catégorie',
                    ),
                ),
                (
                    'count_usage',
                    models.IntegerField(default=0, verbose_name="Nombre d'utilisations"),
                ),
            ],
            options={
                'verbose_name': 'Compétence',
                'verbose_name_plural': 'Compétences',
                'ordering': ['-count_usage'],
            },
        ),
        migrations.CreateModel(
            name='Offre',
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
                ('titre', models.CharField(max_length=200, verbose_name='Titre')),
                ('description', models.TextField(verbose_name='Description')),
                (
                    'competences',
                    models.JSONField(default=list, verbose_name='Compétences requises'),
                ),
                (
                    'type_contrat',
                    models.CharField(
                        choices=[
                            ('CDI', 'CDI'),
                            ('CDD', 'CDD'),
                            ('STAGE', 'Stage'),
                            ('FREELANCE', 'Freelance'),
                        ],
                        max_length=15,
                        verbose_name='Type de contrat',
                    ),
                ),
                (
                    'salaire_min',
                    models.DecimalField(
                        blank=True,
                        decimal_places=2,
                        max_digits=10,
                        null=True,
                        verbose_name='Salaire minimum (MAD)',
                    ),
                ),
                (
                    'salaire_max',
                    models.DecimalField(
                        blank=True,
                        decimal_places=2,
                        max_digits=10,
                        null=True,
                        verbose_name='Salaire maximum (MAD)',
                    ),
                ),
                (
                    'statut',
                    models.CharField(
                        choices=[
                            ('brouillon', 'Brouillon'),
                            ('publiee', 'Publiée'),
                            ('cloturee', 'Clôturée'),
                        ],
                        default='brouillon',
                        max_length=15,
                        verbose_name='Statut',
                    ),
                ),
                (
                    'date_publication',
                    models.DateTimeField(blank=True, null=True, verbose_name='Date de publication'),
                ),
                (
                    'date_cloture',
                    models.DateField(blank=True, null=True, verbose_name='Date de clôture'),
                ),
                (
                    'created_at',
                    models.DateTimeField(auto_now_add=True, verbose_name='Créée le'),
                ),
                (
                    'updated_at',
                    models.DateTimeField(auto_now=True, verbose_name='Modifiée le'),
                ),
                (
                    'created_by',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name='offres_creees',
                        to=settings.AUTH_USER_MODEL,
                        verbose_name='Créée par',
                    ),
                ),
            ],
            options={
                'verbose_name': "Offre d'emploi",
                'verbose_name_plural': "Offres d'emploi",
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='offre',
            index=models.Index(fields=['statut'], name='offres_offre_statut_idx'),
        ),
        migrations.AddIndex(
            model_name='offre',
            index=models.Index(fields=['type_contrat'], name='offres_offre_type_contrat_idx'),
        ),
    ]
