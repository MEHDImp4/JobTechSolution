from django.db import models


class KPISnapshot(models.Model):
    """
    Monthly snapshot of key performance indicators.
    Used to track growth and performance over time.
    """

    month = models.DateField(unique=True, verbose_name='Mois')
    total_interviews = models.PositiveIntegerField(default=0, verbose_name='Total Entretiens')
    total_hires = models.PositiveIntegerField(default=0, verbose_name='Total Recrutements')
    total_registrations = models.PositiveIntegerField(default=0, verbose_name='Total Inscriptions')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Créé le')

    class Meta:
        verbose_name = 'Instantané KPI'
        verbose_name_plural = 'Instantanés KPI'
        ordering = ['-month']

    def __str__(self):
        return f'KPI Snapshot - {self.month.strftime("%Y-%m")}'
