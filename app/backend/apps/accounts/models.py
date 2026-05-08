from django.conf import settings
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models

from .managers import CustomUserManager


class User(AbstractBaseUser, PermissionsMixin):
    """Modèle utilisateur personnalisé avec rôles."""

    ROLES = [
        ('admin', 'Administrateur'),
        ('rh', 'Responsable RH'),
        ('recruteur', 'Recruteur'),
        ('candidat', 'Candidat'),
    ]

    email = models.EmailField(unique=True, verbose_name='Adresse e-mail')
    nom = models.CharField(max_length=100, verbose_name='Nom')
    prenom = models.CharField(max_length=100, verbose_name='Prénom')
    phone = models.CharField(max_length=20, blank=True, verbose_name='Téléphone')
    role = models.CharField(max_length=20, choices=ROLES, default='candidat', verbose_name='Rôle')
    is_active = models.BooleanField(default=False, verbose_name='Actif')
    is_email_verified = models.BooleanField(default=False, verbose_name='Email vérifié')
    is_staff = models.BooleanField(default=False, verbose_name='Staff')
    date_joined = models.DateTimeField(auto_now_add=True, verbose_name="Date d'inscription")

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nom', 'prenom']

    objects = CustomUserManager()

    @property
    def get_full_name(self):
        """Retourne le nom complet."""
        return f'{self.nom} {self.prenom}'

    def get_short_name(self):
        """Retourne le prénom."""
        return self.prenom

    @property
    def is_admin(self):
        """Vérifie si l'utilisateur est admin."""
        return self.role == 'admin' or self.is_superuser

    @property
    def is_rh(self):
        """Vérifie si l'utilisateur a des droits RH."""
        return self.role in ['admin', 'rh'] or self.is_superuser

    @property
    def is_recruteur(self):
        """Vérifie si l'utilisateur a des droits Recruteur."""
        return self.role in ['admin', 'rh', 'recruteur'] or self.is_superuser

    @property
    def is_candidat(self):
        """Vérifie si l'utilisateur est un candidat."""
        return self.role == 'candidat'

    def __str__(self):
        return f'{self.get_full_name} <{self.email}>'

    class Meta:
        verbose_name = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'
        indexes = [
            models.Index(fields=['role', 'is_active']),
        ]


class AuditLog(models.Model):
    """Enregistre les actions effectuées sur le système."""

    ACTIONS = [
        ('CREATE', 'Création'),
        ('UPDATE', 'Modification'),
        ('DELETE', 'Suppression'),
        ('VIEW', 'Consultation'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='audit_logs',
        verbose_name='Utilisateur',
    )
    action = models.CharField(max_length=10, choices=ACTIONS, verbose_name='Action')
    model_name = models.CharField(max_length=100, verbose_name='Modèle')
    object_id = models.IntegerField(null=True, blank=True, verbose_name='ID objet')
    data_before = models.JSONField(null=True, blank=True, verbose_name='Données avant')
    data_after = models.JSONField(null=True, blank=True, verbose_name='Données après')
    ip_address = models.GenericIPAddressField(null=True, blank=True, verbose_name='Adresse IP')
    user_agent = models.CharField(max_length=500, null=True, blank=True, verbose_name='User-Agent')
    timestamp = models.DateTimeField(auto_now_add=True, verbose_name='Horodatage')
    endpoint = models.CharField(max_length=255, null=True, blank=True, verbose_name='Endpoint')

    def __str__(self):
        user_str = str(self.user) if self.user else 'anonyme'
        return f'[{self.timestamp}] {self.action} {self.model_name} par {user_str}'

    class Meta:
        verbose_name = "Journal d'audit"
        verbose_name_plural = "Journaux d'audit"
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', 'timestamp']),
            models.Index(fields=['model_name', 'action']),
        ]
