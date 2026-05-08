"""
Migration: add resume_ia field to CVData — Phase 9 Plan 1.
"""

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('ia', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='cvdata',
            name='resume_ia',
            field=models.TextField(
                blank=True,
                default='',
                verbose_name='Résumé IA',
                help_text='Synthèse du CV générée automatiquement par le LLM.',
            ),
            preserve_default=False,
        ),
    ]
