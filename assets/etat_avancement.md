# État d'Avancement du Projet : JobTech Solutions

**Date :** 16 Mai 2026  
**Phase :** Finalisation & Stabilisation  
**Établissement :** EMSI — École Marocaine des Sciences de l'Ingénieur  

---

## 👥 Équipe Projet
| Nom et Prénom | Rôle | Responsabilités principales |
| :--- | :--- | :--- |
| **Diouri Mehdi** | Chef de projet / Backend | Architecture Django, DRF, Sécurité, DevOps |
| **El Kharrazi Ibtihal** | Designer UI/UX / Frontend | React, Tailwind CSS, Expérience Utilisateur |
| **Assaadi Mohamed Nadir** | IA / Data Scientist | Analyse NLP des CV, Scoring IA |

---

## 🎯 Statut Actuel
Le projet est en phase finale de stabilisation. Les fonctionnalités majeures sont implémentées (Auth, Offres, Candidatures, Entretiens, Evaluations, Statistiques, IA).

### ✅ Mises à jour récentes (16/05/2026) :
- **Correction d'erreurs 405 (Method Not Allowed)** : 
    - Unification des endpoints d'authentification dans `AuthViewSet`.
    - Ajout des actions manquantes : `register`, `logout`, `change_password`, `update_profile`.
    - Correction de l'endpoint de postulation (`/api/candidatures/apply/`).
- **Amélioration de l'API** :
    - Alignement des noms de chemins (URL paths) entre le frontend et le backend (utilisation de tirets `-` au lieu de underscores `_`).
    - Support complet des méthodes HTTP (POST, DELETE, PATCH) pour les actions d'authentification.
- **Tests & Validation** :
    - Création d'une suite de tests automatisés pour valider les endpoints d'authentification.
    - Vérification du processus complet de déconnexion et de mise à jour de profil.

---

## 📊 Modules Complétés

### 1. Authentification & Profils
- Système complet RBAC (Admin, RH, Recruteur, Candidat).
- Gestion des profils et changements de mots de passe.
- Journalisation d'audit pour la traçabilité.

### 2. Gestion des Recrutements
- Cycle de vie des offres (Brouillon -> Publiée -> Clôturée).
- Système de postulation avec téléchargement de CV.
- Dashboard RH avec KPIs en temps réel.

### 3. IA & Entretiens
- Pipeline NLP pour l'analyse automatique des CV.
- Scoring des candidatures par rapport aux offres.
- Planification d'entretiens et système d'évaluation structuré.

---

## 📐 Architecture Technique
- **Backend :** Django 5.x + Django Rest Framework (DRF).
- **Frontend :** React 18 + Vite + Tailwind CSS + Zustand.
- **Base de Données :** MySQL 8.0.
- **PWA :** Support du mode offline et notifications Push.

---

## 📈 Prochaines Étapes
1. Finalisation de la documentation technique finale.
2. Préparation de la démo pour la soutenance finale.
3. Déploiement en environnement de pré-production via Docker.

---
**Rapport mis à jour le 16/05/2026 suite à la phase de stabilisation technique.**
