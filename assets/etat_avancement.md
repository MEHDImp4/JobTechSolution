# État d'Avancement du Projet : JobTech Solutions

**Date :** 20 Avril 2026  
**Cours :** Outils de développement / Programmation Python  
**Établissement :** EMSI — École Marocaine des Sciences de l'Ingénieur  
**Enseignants :** O. OUADOUD / R. Filali / F. Ebobiss  

---

## 👥 Équipe Projet
| Nom et Prénom | Rôle | Responsabilités principales |
| :--- | :--- | :--- |
| **Diouri Mehdi** | Chef de projet / Backend | Architecture Django, Modèles ORM, Sécurité RBAC |
| **El Kharrazi Ibtihal** | Designer UI/UX / Frontend | Conception des interfaces, Charte graphique, UX |
| **Assaadi Mohamed Nadir** | IA / Data Scientist | Pipeline NLP, Analyse de données, Modèles IA |

---

## 🎯 Objectif de la Phase Actuelle
Cette phase se concentre sur la **conception technique** et la **modélisation des données**, ainsi que la mise en place de l'infrastructure de base (Base de données et environnement de développement).

---

## 🛠️ Infrastructure & Setup Database
Le projet utilise une architecture moderne et robuste pour garantir la scalabilité et la performance :

- **Framework Backend :** Django 5.x (Architecture MVT).
- **Base de Données :** **MySQL 8.0**. 
    - Le choix de MySQL permet une gestion relationnelle rigoureuse, indispensable pour le suivi des entretiens et des candidatures.
    - Configuration du moteur `InnoDB` pour supporter les transactions et les clés étrangères.
- **Environnement :** Virtualenv Python, Git pour le versioning.

---

## 📊 Modélisation des Données (Modèles Django)

La structure de la base de données a été modélisée pour répondre aux exigences du cahier des charges. Voici les principaux modèles créés :

### 1. Gestion des Utilisateurs (App: `accounts`)
- **User** : Modèle personnalisé (`AbstractUser`) gérant quatre rôles (Admin, RH, Recruteur, Candidat).
- **Company** : Pivot de l'architecture SaaS, permettant d'isoler les données par entreprise.
- **AuditLog** : Journalisation de toutes les actions utilisateur pour la traçabilité.

### 2. Gestion des Offres (App: `offres`)
- **Offre** : Détails du poste (titre, description, type de contrat, salaire, etc.).
- **Competence** : Liste des compétences requises pour chaque offre.

### 3. Gestion des Candidatures (App: `candidatures`)
- **Candidature** : Lien entre un Candidat et une Offre, incluant le stockage du CV et la lettre de motivation.

### 4. Suivi des Entretiens (App: `entretiens`)
- **Entretien** : Planification (date, heure, recruteur, candidat).
- **Evaluation** : Formulaire structuré rempli par le recruteur après l'entretien.

---

## 📐 Relations entre les Tables (Diagramme Logique)

Le système repose sur un schéma relationnel cohérent :
- **Relation 1:N (One-to-Many)** :
    - Une `Company` possède plusieurs `Users` et plusieurs `Offres`.
    - Une `Offre` peut recevoir plusieurs `Candidatures`.
    - Un `User` (Recruteur) peut mener plusieurs `Entretiens`.
- **Relation N:N (Many-to-Many)** :
    - Une `Offre` est liée à plusieurs `Competences` (via JSON ou table de jointure).
- **Relation 1:1 (One-to-One)** :
    - Un `Entretien` a exactement une `Evaluation` finale.

---

## 📈 Prochaines Étapes
1. Développement des interfaces de capture des données (CRUD Offres et Candidatures).
2. Intégration des premières fonctions de parsing de CV.
3. Mise en place du système de notifications par email pour les rappels d'entretiens.

---
**Rapport généré pour la soutenance d'étape du 20/04/2026.**
