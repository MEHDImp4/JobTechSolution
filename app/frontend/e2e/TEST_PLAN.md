# Plan de Test E2E - JobTech

## Architecture
- Backend: Django REST Framework
- Frontend: React / Vite
- Base de données: PostgreSQL / SQLite (ou MySQL via Docker)
- Framework de test E2E: Playwright

## Rôles identifiés
1. **Admin** (`admin`) : Accès total, gestion des utilisateurs, journal d'audit.
2. **Ressources Humaines** (`rh`) : Gestion complète des offres, candidatures, entretiens, évaluations, et statistiques.
3. **Recruteur** (`recruteur`) : Gestion des candidatures et entretiens liés à ses offres.
4. **Candidat** (`candidat`) : Consultation des offres, postulation, suivi de ses candidatures.

## Parcours Utilisateurs Critiques
### 1. Authentification & Sécurité
- Page de login fonctionnelle.
- Redirection correcte selon le rôle (dashboard vs offres).
- Protection des routes privées (un candidat ne peut pas accéder à `/dashboard`).
- Maintien de la session après rechargement.

### 2. Candidat : Postuler à une offre
- Lister les offres disponibles (`/offres`).
- Voir le détail d'une offre (`/offres/:id`).
- Soumettre une candidature (`/postuler/:id`) avec upload de CV.
- Vérifier la présence de la candidature dans "Mes candidatures" (`/mes-candidatures`).

### 3. RH/Recruteur : Gestion d'une Offre (CRUD)
- Création d'une nouvelle offre (`/gestion-offres/nouvelle`).
- Affichage de l'offre dans la liste.
- Modification de l'offre.
- Suppression/Archivage de l'offre.

### 4. RH/Recruteur : Traitement des Candidatures
- Visualisation des candidatures (`/candidatures`).
- Changement de statut de la candidature (ex: de "En attente" à "Entretien").
- Planification d'un entretien (`/entretiens`).

## Pages à tester
- `/connexion`, `/inscription`
- `/offres`, `/offres/:id`, `/postuler/:id`
- `/mes-candidatures`
- `/dashboard`
- `/gestion-offres`, `/candidatures`, `/entretiens`, `/evaluations`
- `/statistiques`, `/admin/utilisateurs`

## Formulaires critiques
- Formulaire de connexion.
- Formulaire de création d'offre.
- Formulaire de candidature (avec fichier).
