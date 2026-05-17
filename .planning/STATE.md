# État du projet

## Tâches terminées
- [x] Correction de l'endpoint d'inscription API (envoi d'e-mail -> puis suppression vérification)
- [x] Amélioration de l'UI pour les erreurs de validation
- [x] Mise en place de la structure de planning (.planning/)
- [x] Suppression de la vérification par e-mail (Comptes actifs par défaut)
- [x] Correction du crash `crypto.randomUUID` dans le composant Toast
- [x] Réparation des workflows CI/CD (`docker-compose` et chemins d'accès)

## Historique récent
- Modification de `models.py` : `is_active` et `is_email_verified` passent à `True` par défaut.
- Suppression de l'envoi d'e-mail dans `AuthViewSet` et `RegisterView`.
- Mise à jour des messages de succès pour l'inscription.
- Application des migrations via Docker.
