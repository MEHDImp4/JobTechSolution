# Documentation Fonctionnelle de JobTech

Cette documentation liste toutes les fonctionnalites de l'application JobTech avec une explication detaillee de leur fonctionnement et la localisation des fichiers concernes.

---

## Table des matieres

1. [Gestion des Utilisateurs](#1-gestion-des-utilisateurs)
2. [Gestion des Offres d'Emploi](#2-gestion-des-offres-demploi)
3. [Gestion des Candidatures](#3-gestion-des-candidatures)
4. [Intelligence Artificielle et Analyse de CV](#4-intelligence-artificielle-et-analyse-de-cv)
5. [Planification des Entretiens](#5-planification-des-entretiens)
6. [Evaluations des Candidats](#6-evaluations-des-candidats)
7. [Statistiques et Tableaux de Bord](#7-statistiques-et-tableaux-de-bord)
8. [Generation de Rapports PDF](#8-generation-de-rapports-pdf)
9. [Notifications par Email](#9-notifications-par-email)
10. [Journal d'Audit](#10-journal-daudit)
11. [Interface d'Administration](#11-interface-dadministration)
12. [Application Frontend React](#12-application-frontend-react)

---

## 1. Gestion des Utilisateurs

### Description
Le systeme de gestion des utilisateurs permet de creer, authentifier et administrer differents types d'utilisateurs avec des roles precis.

### Roles disponibles
- **Administrateur**: Acces complet au systeme
- **Responsable RH**: Gestion des RH et acces a toutes les donnees
- **Recruteur**: Gestion des candidatures et entretiens
- **Candidat**: Consultation des offres et postulation

### Fonctionnement

#### Creation de compte
1. L'utilisateur remplit le formulaire d'inscription (email, nom, prenom, mot de passe)
2. Un token d'activation est genere et envoye par email
3. L'utilisateur clique sur le lien d'activation pour activer son compte
4. Le compte est actif et peut se connecter

#### Authentification
1. L'utilisateur saisit email et mot de passe
2. Le systeme verifie les identifiants
3. Un token JWT est genere pour la session
4. Le token est stocke cote frontend pour les requetes suivantes

#### Protection RBAC
Chaque vue verifie le role de l'utilisateur avant d'autoriser l'acces:
- `@login_required` pour l'acces general
- Decorateurs speciales pour les permissions specifiques

### Fichiers concernes

| Fonction | Fichiers |
|----------|----------|
| Modeles utilisateur | `app/backend/apps/accounts/models.py` |
| Vues inscription/login | `app/backend/apps/accounts/views.py` |
| Serializers API | `app/backend/apps/accounts/serializers.py` |
| URLs | `app/backend/apps/accounts/urls.py` |
| Decorateurs RBAC | `app/backend/apps/accounts/decorators.py` |
| Middleware securite | `app/backend/apps/accounts/middleware.py` |
| Page login frontend | `app/frontend/src/pages/auth/LoginPage.tsx` |
| Page register frontend | `app/frontend/src/pages/auth/RegisterPage.tsx` |
| Service auth frontend | `app/frontend/src/services/auth.service.ts` |

---

## 2. Gestion des Offres d'Emploi

### Description
Permet aux recruiters de creer, modifier, publier et cloturer des offres d'emploi.

### Fonctionnalites

#### Creation d'une offre
1. Le recruteur remplit le formulaire (titre, description, type de contrat, salaire, competences)
2. L'offre est enregistree en statut "brouillon"
3. Le recruteur peut la modifier ou la publier

#### Publication
- Une offre publiee apparait dans la liste des offres pour les candidats
- Seules les offrespubliees sont visibles par les candidats

#### Recherche et filtres
- Recherche par titre
- Filtrage par type de contrat (CDI, CDD, Stage, Freelance)
- Filtrage par competences
- Tri par date ou popularite

### Fichiers concernes

| Fonction | Fichiers |
|----------|----------|
| Modeles Offre/Competence | `app/backend/apps/offres/models.py` |
| Vues API | `app/backend/apps/offres/viewsets.py` |
| Serializers | `app/backend/apps/offres/serializers.py` |
| Filtres | `app/backend/apps/offres/filters.py` |
| URLs | `app/backend/apps/offres/urls.py` |
| Formulaires Django | `app/backend/apps/offres/forms.py` |
| Page liste offres (candidat) | `app/frontend/src/pages/candidat/OffresListPage.tsx` |
| Page detail offre | `app/frontend/src/pages/candidat/OffreDetailPage.tsx` |
| Page gestion offres (RH) | `app/frontend/src/pages/rh/OffresManagePage.tsx` |
| Page creation offre (RH) | `app/frontend/src/pages/rh/OffreFormPage.tsx` |
| Service API offres | `app/frontend/src/services/offres.service.ts` |

---

## 3. Gestion des Candidatures

### Description
Permet aux candidats de postuler aux offres et aux RH de suivre le processus de recrutement.

### Fonctionnalites

#### Postulation
1. Le candidat selectionne une offre
2. Il remplit le formulaire (CV, lettre de motivation, experience, LinkedIn)
3. Le CV est telecharge et stocke sur le serveur
4. Une analyse IA est declenchee automatiquement
5. La candidature apparait dans le tableau de bord RH

#### Suivi du statut
Le statut evolue automatiquement ou manuellement:
1. **Recue** - Candidature recue
2. **Analyse IA** - Traitement en cours par l'IA
3. **Examen RH** - En cours de revision par le recruteur
4. **Entretien planifie** - Un entretien est programme
5. **Retenu** ou **Refuse** - Decision finale

#### Tableau Kanban
Interface visuelle avec des colonnes pour chaque statut:
- Glisser-deposer pour changer le statut
- Affichage des informations du candidat
- Score IA visible

### Fichiers concernes

| Fonction | Fichiers |
|----------|----------|
| Modele Candidature | `app/backend/apps/candidatures/models.py` |
| Validateurs CV | `app/backend/apps/candidatures/validators.py` |
| Vues API | `app/backend/apps/candidatures/viewsets.py` |
| Serializers | `app/backend/apps/candidatures/serializers.py` |
| URLs | `app/backend/apps/candidatures/urls.py` |
| Page postulation | `app/frontend/src/pages/candidat/ApplyPage.tsx` |
| Page mes candidatures | `app/frontend/src/pages/candidat/MyApplicationsPage.tsx` |
| Page gestion candidatures | `app/frontend/src/pages/rh/CandidaturesPage.tsx` |
| Composant Kanban | `app/frontend/src/components/rh/KanbanBoard.tsx` |
| Service API | `app/frontend/src/services/candidatures.service.ts` |

---

## 4. Intelligence Artificielle et Analyse de CV

### Description
L'application integre plusieurs fonctionnalites basees sur l'IA pour automatiser l'analyse des candidatures.

### Fonctionnalites

#### Extraction de texte (NLP)
- Extraction du texte brut du CV (PDF/DOCX)
- Identification des informations clees:
  - Competences techniques
  - Annees d'experience
  - Formations
  - Langues

#### Scoring de compatibilite
- Comparaison des competences du candidat avec celles de l'offre
- Calcul d'un score de 0 a 100%
- Affichage des competences correspondantes et manquantes

#### Resume automatique
- Generation d'un resume du CV par un modele de langage (LLM)
- Synthese des points forts du candidat

#### Questions d'entretien
- Generation automatique de questions d'entretien par l'IA
- Basees sur le CV et le poste

#### Sentiment et recommandation IA
- Analyse du texte de l'evaluation pour determiner le sentiment
- Recommendation automatique basee sur les notes

### Fonctionnement technique

1. Lorsqu'une candidature est soumise, une tache Celery est declenchee
2. Le texte est extrait du CV via un parser
3. Les donnees sont analysees avec TF-IDF et sklearn
4. Le score est calcule et enregistre
5. Si configure, le LLM genere le resume et les questions

### Fichiers concernes

| Fonction | Fichiers |
|----------|----------|
| Modeles CVData/ScoreDetail | `app/backend/apps/ia/models.py` |
| Extracteurs NLP | `app/backend/apps/ia/extractors.py` |
| Pipeline NLP | `app/backend/apps/ia/nlp_pipeline.py` |
| Scorer | `app/backend/apps/ia/scorer.py` |
| Client LLM | `app/backend/apps/ia/llm_client.py` |
| Service IA | `app/backend/apps/ia/service.py` |
| Taches Celery | `app/backend/apps/ia/tasks.py` |
| Modal analyse IA | `app/frontend/src/components/rh/CandidatureIAModal.tsx` |
| Types | `app/frontend/src/types/candidature.ts` |

---

## 5. Planification des Entretiens

### Description
Permet de planifier, organiser et suivre les entretiens avec les candidats.

### Fonctionnalites

#### Creation d'un entretien
1. Le recruteur selectionne un candidat
2. Il choisit une date et heure
3. Il selectionne le type (recrutement, technique, final)
4. Il definit la duree (30, 45, 60, 90 min)
5. Le systeme verifie les conflits d'horaire

#### Calendrier
- Affichage mensuel avec les entretiens
- Couleurs selon le type d'entretien
- Clic sur un entretien pour les details

#### Detection de conflits
- Le systeme verifie que le recruteur n'a pas deja un entretien
- Affichage d'un avertissement si conflit

#### Salle video
- Lien Jitsi genere automatiquement
- Le candidat et le recruteur peuvent rejoindre la visio

### Fichiers concernes

| Fonction | Fichiers |
|----------|----------|
| Modele Entretien | `app/backend/apps/entretiens/models.py` |
| Vues API | `app/backend/apps/entretiens/viewsets.py` |
| Serializers | `app/backend/apps/entretiens/serializers.py` |
| URLs | `app/backend/apps/entretiens/urls.py` |
| Taches Celery | `app/backend/apps/entretiens/tasks.js` |
| Page entretiens | `app/frontend/src/pages/shared/EntretiensPage.tsx` |
| Page salle video | `app/frontend/src/pages/shared/VideoRoomPage.tsx` |
| Composants video | `app/frontend/src/components/video/` |
| Modal planification | `app/frontend/src/components/rh/PlanifierEntretienModal.tsx` |
| Service API | `app/frontend/src/services/entretiens.service.ts` |

---

## 6. Evaluations des Candidats

### Description
Permet aux recruiters d'evaluer les candidats apres les entretiens avec un systeme de notation structure.

### Fonctionnalites

#### Formulaire d'evaluation
Le recruteur note le candidat sur 5 criteres (note de 1 a 5):
1. Competences techniques
2. Communication
3. Motivation
4. Adaptabilite
5. Culture fit

#### Recommandation
Le recruteur donne une recommandation:
- Retenu
- A reconsiderer
- Non retenu

#### Analyse IA automatique
Apres soumission, l'IA analyse les commentaires et:
- Determine le sentiment (positif, neutre, negatif)
- Donne une recommandation IA

#### Notes et objectifs
- Ajout de notes pendant l'entretien
- Definition d'objectifs a evaluer

### Fichiers concernes

| Fonction | Fichiers |
|----------|----------|
| Modele Evaluation | `app/backend/apps/evaluations/models.py` |
| Vues API | `app/backend/apps/evaluations/viewsets.py` |
| Serializers | `app/backend/apps/evaluations/serializers.py` |
| URLs | `app/backend/apps/evaluations/urls.py` |
| Page evaluations | `app/frontend/src/pages/shared/EvaluationsPage.tsx` |
| Modal creation evaluation | `app/frontend/src/components/rh/CreateEvaluationModal.tsx` |
| Service API | `app/frontend/src/services/evaluations.service.ts` |

---

## 7. Statistiques et Tableaux de Bord

### Description
Fournit des indicateurs et graphiques pour analyser les performances du recrutement.

### Fonctionnalites

#### Indicateurs KPI
- Nombre total d'offres
- Nombre de candidatures
- Nombre d'entretiens realises
- Nombre de recrutements
- Taux de transformation

#### Graphiques
- **Entonnoir de recrutement**: Visualisation du pipeline
- **Distribution des scores**: Repartition des scores IA
- **Statistiques par offre**: Performances par offre

#### Export CSV
Export des donnees pour analyse externe

#### Snapshots mensuels
Enregistrement automatique des KPIs chaque mois pour suivi historique

### Fichiers concernes

| Fonction | Fichiers |
|----------|----------|
| Modele KPISnapshot | `app/backend/apps/statistiques/models.py` |
| Generateur de graphiques | `app/backend/apps/statistiques/chart_generator.py` |
| Calculateur KPI | `app/backend/apps/statistiques/kpi_calculator.py` |
| Vues API | `app/backend/apps/statistiques/viewsets.py` |
| URLs | `app/backend/apps/statistiques/urls.py` |
| Page statistiques | `app/frontend/src/pages/rh/StatistiquesPage.tsx` |
| Composant KPI Card | `app/frontend/src/components/data/KPICard.tsx` |
| Service API | `app/frontend/src/services/statistiques.service.ts` |

---

## 8. Generation de Rapports PDF

### Description
Genere des rapports PDF professionnels pour les evaluations des candidats.

### Fonctionnalites

#### Contenu du PDF
- Informations du candidat
- Note globale et detaillee par critere
- Points forts et points a ameliorer
- Recommandation
- Commentaires du recruteur
- Date et signature

#### Generation automatique
Le PDF est genere automatiquement apres soumission de l'evaluation

### Fichiers concernes

| Fonction | Fichiers |
|----------|----------|
| Generateur PDF | `app/backend/apps/rapports/pdf_generator.py` |
| Tache Celery | `app/backend/apps/rapports/tasks.py` |
| Modele | `app/backend/apps/rapports/models.py` |

---

## 9. Notifications par Email

### Description
Envoie des emails automatises aux utilisateurs pour les informer des evenements importants.

### Fonctionnalites

#### Emails envoyes
- **Activation de compte**: Lien d'activation
- **Notification de candidature**: Au recruteur quand un candidat postule
- **Invitation entretien**: Au candidat avec les details
- **Decision finale**: Retenu ou refuse
- **Rappel**: Avant un entretien

#### Configuration
- Utilisation de Celery pour l'envoi asynchrone
- Templates HTML et texte pour chaque type
- Retry automatique en cas d'echec

### Fichiers concernes

| Fonction | Fichiers |
|----------|----------|
| Modele Notification | `app/backend/apps/notifications/models.py` |
| Taches Celery | `app/backend/apps/notifications/tasks.py` |
| Templates emails | `app/backend/templates/emails/` |

---

## 10. Journal d'Audit

### Description
Enregistre toutes les actions effectuees sur le systeme pour la traçabilite.

### Fonctionnalites

#### Actions enregistrees
- Creation, modification, suppression
- Consultation de donnees

#### Informations enregistrees
- Utilisateur ayant effectue l'action
- Type d'action
- Modele concerne
- ID de l'objet
- Donnees avant et apres modification
- Adresse IP
- Date et heure

### Fichiers concernes

| Fonction | Fichiers |
|----------|----------|
| Modele AuditLog | `app/backend/apps/accounts/models.py` (lignes 73-112) |
| Middleware audit | `app/backend/apps/accounts/middleware.py` |
| Page logs | `app/frontend/src/pages/admin/AuditLogPage.tsx` |
| Service API | `app/frontend/src/services/admin.service.ts` |

---

## 11. Interface d'Administration

### Description
Interface Django admin pour la gestion des donnees par les administrateurs.

### Fonctionnalites

- Gestion des utilisateurs
- Gestion des offres
- Gestion des candidatures
- Gestion des entretiens
- Visualisation des logs d'audit
- Configuration du systeme

### Fichiers concernes

| Fonction | Fichiers |
|----------|----------|
| Configuration admin | `app/backend/apps/*/admin.py` |
| Page utilisateurs admin | `app/frontend/src/pages/admin/UsersPage.tsx` |

---

## 12. Application Frontend React

### Description
Interface utilisateur web developed avec React et TypeScript.

### Pages et Fonctionnalites

#### Pages d'authentification
- Login (`LoginPage.tsx`)
- Register (`RegisterPage.tsx`)

#### Pages candidat
- Liste des offres (`OffresListPage.tsx`)
- Detail d'une offre (`OffreDetailPage.tsx`)
- Formulaire de postulation (`ApplyPage.tsx`)
- Mes candidatures (`MyApplicationsPage.tsx`)

#### Pages RH/Recruteur
- Dashboard (`DashboardPage.tsx`)
- Gestion des offres (`OffresManagePage.tsx`)
- Creation/modification offre (`OffreFormPage.tsx`)
- Gestion candidatures (`CandidaturesPage.tsx`)
- Statistiques (`StatistiquesPage.tsx`)
- Planification entretiens (`EntretiensPage.tsx`)
- Evaluations (`EvaluationsPage.tsx`)

#### Pages communes
- Profile (`ProfilePage.tsx`)
- Salle video (`VideoRoomPage.tsx`)
- 404 (`NotFoundPage.tsx`)

#### Pages Admin
- Gestion utilisateurs (`UsersPage.tsx`)
- Journal d'audit (`AuditLogPage.tsx`)

### Composants principaux

| Composant | Fichier | Description |
|-----------|---------|-------------|
| Sidebar | `components/layout/Sidebar.tsx` | Menu de navigation |
| Topbar | `components/layout/Topbar.tsx` | Barre superieure avec profil |
| Kanban | `components/rh/KanbanBoard.tsx` | Tableau Kanban des candidatures |
| Modal evaluation | `components/rh/CreateEvaluationModal.tsx` | Formulaire d'evaluation |
| Modal planification | `components/rh/PlanifierEntretienModal.tsx` | Planification entretien |
| Modal IA | `components/rh/CandidatureIAModal.tsx` | Analyse IA du candidat |
| ThemeToggle | `components/ui/ThemeToggle.tsx` | Changement theme clair/sombre |

### Services API

| Service | Fichier | Description |
|---------|---------|-------------|
| Auth | `services/auth.service.ts` | Authentification |
| Offres | `services/offres.service.ts` | Gestion offres |
| Candidatures | `services/candidatures.service.ts` | Gestion candidatures |
| Entretiens | `services/entretiens.service.ts` | Gestion entretiens |
| Evaluations | `services/evaluations.service.ts` | Gestion evaluations |
| Statistiques | `services/statistiques.service.ts` | Donnees statistiques |
| Admin | `services/admin.service.ts` | Administration |

### Gestion d'etat

| Store | Fichier | Description |
|-------|---------|-------------|
| AuthStore | `stores/authStore.ts` | Utilisateur connecte |
| UIStore | `stores/uiStore.ts` | UI (theme, sidebar, etc.) |

### Types TypeScript

| Type | Fichier |
|------|---------|
| Auth | `types/auth.ts` |
| Offre | `types/offre.ts` |
| Candidature | `types/candidature.ts` |
| Entretien | `types/entretien.ts` |
| Evaluation | `types/evaluation.ts` |
| Statistique | `types/statistique.ts` |

---

## Resume des technologies utilisees

### Backend
- **Django 5.x** - Framework web Python
- **Django REST Framework** - API REST
- **Celery** - Taches asynchrones
- **Redis** - Broker de messages
- **PostgreSQL/SQLite** - Base de donnees
- **scikit-learn** - Algorithmes ML (TF-IDF)
- **ReportLab** - Generation PDF
- **Matplotlib** - Graphiques

### Frontend
- **React 18** - Framework UI
- **TypeScript** - Typage statique
- **Vite** - Build tool
- **Zustand** - Gestion d'etat
- **Axios** - Client HTTP
- **Playwright** - Tests e2e

### Infrastructure
- **Docker** - Conteneurisation
- **GitHub Actions** - CI/CD

---

## Pour toute question

Cette documentation couvre l'ensemble des fonctionnalites de l'application JobTech. Chaque section indique les fichiers sources concernes pour permet une comprehension technique detaillee du fonctionnement.