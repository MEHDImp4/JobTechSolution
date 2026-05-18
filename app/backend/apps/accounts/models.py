from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_ADMIN = 'ADMIN'
    ROLE_RH = 'RH'
    ROLE_RECRUTEUR = 'RECRUTEUR'
    ROLE_CANDIDAT = 'CANDIDAT'
    ROLE_MANAGER = 'MANAGER'

    ROLE_CHOICES = [
        (ROLE_ADMIN, 'Administrateur'),
        (ROLE_RH, 'Responsable RH'),
        (ROLE_RECRUTEUR, 'Recruteur'),
        (ROLE_CANDIDAT, 'Candidat'),
        (ROLE_MANAGER, 'Manager'),
    ]

    email = models.EmailField(unique=True)
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    telephone = models.CharField(max_length=20, blank=True)
    adresse = models.CharField(max_length=255, blank=True)
    date_naissance = models.DateField(null=True, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_CANDIDAT)

    class Meta:
        ordering = ['username']

    def __str__(self):
        return f'{self.username} ({self.role})'

    @property
    def full_name(self):
        return f'{self.prenom} {self.nom}'.strip()


class AuditLog(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='audit_logs')
    user_email = models.EmailField()
    action = models.CharField(max_length=255)
    model_name = models.CharField(max_length=100, blank=True)
    object_id = models.CharField(max_length=100, blank=True)
    data_before = models.JSONField(null=True, blank=True)
    data_after = models.JSONField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    endpoint = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f'{self.timestamp} - {self.user_email} - {self.action}'
