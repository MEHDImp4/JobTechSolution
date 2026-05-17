from django.db import models


class NotificationLog(models.Model):
    """
    Tracks all automated notifications sent to users (Email/SMS).
    Proof of automated reminder requirements.
    """

    TYPE_CHOICES = [
        ('EMAIL', 'Email'),
        ('SMS', 'SMS'),
    ]

    STATUS_CHOICES = [
        ('SENT', 'Envoyé'),
        ('FAILED', 'Échoué'),
        ('PENDING', 'En attente'),
    ]

    recipient = models.CharField(max_length=255, verbose_name='Destinataire')
    type = models.CharField(
        max_length=10, choices=TYPE_CHOICES, default='EMAIL', verbose_name='Type'
    )
    status = models.CharField(
        max_length=10, choices=STATUS_CHOICES, default='PENDING', verbose_name='Statut'
    )
    error_message = models.TextField(null=True, blank=True, verbose_name="Message d'erreur")
    attempts = models.PositiveSmallIntegerField(default=1, verbose_name='Tentatives')
    timestamp = models.DateTimeField(auto_now_add=True, verbose_name='Horodatage')

    class Meta:
        verbose_name = 'Journal de notification'
        verbose_name_plural = 'Journaux de notifications'
        ordering = ['-timestamp']

    def __str__(self):
        return f'{self.type} to {self.recipient} - {self.status}'
