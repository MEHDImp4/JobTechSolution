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
