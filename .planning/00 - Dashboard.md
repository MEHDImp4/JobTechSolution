# Dashboard JobTechSolution

## Objectif
Résoudre les erreurs 400 sur l'endpoint d'inscription API et supprimer la vérification par e-mail.

## État actuel
- ✅ Cause identifiée : Erreur de duplication d'e-mail (78 octets).
- ✅ Problème 1 résolu : L'endpoint API envoie maintenant l'e-mail d'activation (puis supprimé car plus de vérification).
- ✅ Problème 2 résolu : L'UI affiche maintenant les erreurs détaillées.
- ✅ Suppression de la vérification par e-mail : Les comptes sont actifs par défaut.
- ✅ Robustesse login : E-mails normalisés en minuscule lors de l'inscription API.

## Prochaines étapes
- [x] Modifier le modèle User (is_active=True par défaut).
- [x] Supprimer l'envoi d'e-mail d'activation.
- [x] Mettre à jour les messages de succès.
- [x] Appliquer les migrations.
- [x] Normaliser les e-mails dans le serializer.
