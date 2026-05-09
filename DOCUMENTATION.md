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
3. Une session authentifiee est ouverte cote backend
4. Le frontend envoie les cookies de session avec `credentials: 'include'` et ajoute le header `X-CSRFToken` pour les mutations
5. La deconnexion applicative se fait via `DELETE /api/auth/`

#### Comportement API actuel
- Le login accepte l'email ou le username selon les donnees fournies
- Un message explicite est renvoye si le compte existe mais n'est pas encore actif
- Le frontend n'utilise pas de JWT pour la session courante

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

#### Endpoints utilises par le frontend
- `GET /api/candidatures/offre/<offre_id>/` pour charger les candidatures d'une offre cote RH
- `GET /api/candidatures/my-applications/` pour lister les candidatures du candidat connecte
- `GET /api/candidatures/<id>/status/` pour recuperer rapidement l'etat d'une candidature
- `POST /api/candidatures/<id>/statut/` pour mettre a jour le statut d'une candidature

#### Contrat de donnees principal
Les listes de candidatures exposees au frontend renvoient notamment:
- `offre_id`, `offre_titre`
- `candidat_nom`, `candidat_email`
- `cv_file_original_name`
- `experience_annees`, `linkedin_url`
- `ia_status`, `score_ia`
- `date_candidature`, `date_maj`

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

#### Endpoints actuellement exploites
- `GET /api/statistiques/rh/` alimente le tableau de bord RH avec les compteurs de synthese
- `GET /api/kpi/` renvoie directement un objet KPI calcule avec:
  - `funnel`
  - `delai_moyen`
  - `score_stats`
  - `top_competences`

#### Robustesse frontend
La page `StatistiquesPage.tsx` utilise un etat vide par defaut pour eviter tout crash si l'API renvoie temporairement des donnees absentes ou partielles.

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
Enregistre toutes les actions effectuees sur le systeme pour la tracabilite.

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

#### Contrat API expose au frontend
L'endpoint `GET /api/audit/` utilise un serializer dedie et renvoie notamment:
- `user_email`
- `action`
- `model_name`
- `object_id`
- `ip_address`
- `user_agent`
- `timestamp`
- `endpoint`

Cette structure est celle attendue par `AuditLogPage.tsx`.

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

### Communication API
- Le client HTTP frontend est base sur `ky`
- Toutes les requetes passent par le helper `client.ts`
- Les cookies de session sont envoyes automatiquement
- Les requetes `POST`, `PUT`, `PATCH` et `DELETE` ajoutent automatiquement `X-CSRFToken`

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

### Notifications push (PWA)
- L'abonnement push necessite une vraie cle publique VAPID dans `VITE_VAPID_PUBLIC_KEY`
- Si cette cle est absente ou invalide, l'interface desactive proprement l'abonnement aux notifications push
- Cette protection evite l'erreur navigateur `InvalidAccessError` lors de `pushManager.subscribe()`

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

## 13. API Backend - Méthodes et Fonctions

### Module Accounts (Authentification et Utilisateurs)

#### Classe User
`app/backend/apps/accounts/models.py`

| Méthode | Signature | Description |
|---------|-----------|-------------|
| `get_full_name` | `get_full_name(self)` | Propriété retournant le nom complet au format "Nom Prénom" |
| `get_short_name()` | `get_short_name(self)` | Retourne le prénom de l'utilisateur |
| `is_admin` | `is_admin(self)` | Propriété booléenne : vérifie si l'utilisateur a les droits admin |
| `is_rh` | `is_rh(self)` | Propriété booléenne : vérifie si l'utilisateur a les droits RH |
| `is_recruteur` | `is_recruteur(self)` | Propriété booléenne : vérifie si l'utilisateur a les droits recruteur |
| `is_candidat` | `is_candidat(self)` | Propriété booléenne : vérifie si l'utilisateur est candidat |
| `__str__()` | `__str__(self)` | Retourne une représentation textuelle : "Nom Prénom <email>" |

#### Classe AuditLog
`app/backend/apps/accounts/models.py`

| Champ | Type | Description |
|-------|------|-------------|
| `user` | ForeignKey | Référence à l'utilisateur ayant effectué l'action (nullable) |
| `action` | CharField | Type d'action : CREATE, UPDATE, DELETE, VIEW |
| `model_name` | CharField | Nom du modèle affecté (ex: "Candidature", "Offre") |
| `object_id` | IntegerField | ID de l'objet concerné |
| `data_before` | JSONField | Données avant modification |
| `data_after` | JSONField | Données après modification |
| `ip_address` | GenericIPAddressField | Adresse IP de l'utilisateur |
| `user_agent` | CharField | User-Agent du navigateur |
| `timestamp` | DateTimeField | Horodatage de l'action |
| `endpoint` | CharField | Endpoint API utilisé |

#### ViewSet AuthViewSet
`app/backend/apps/accounts/viewsets.py`

| Action | Endpoint | Méthode HTTP | Description |
|--------|----------|--------------|-------------|
| `list()` | `/auth/` | GET | Retourne l'utilisateur connecté |
| `me` | `/auth/me/` | GET | Alias pour retourner l'utilisateur connecté |
| `create()` | `/auth/` | POST | Authentifie l'utilisateur (login) |
| `login()` | `/auth/login/` | POST | Authentification par email/password |
| `destroy()` | `/auth/` | DELETE | Déconnecte l'utilisateur (logout) |

#### View UserListView
`app/backend/apps/accounts/views.py`

| Propriété | Valeur | Description |
|-----------|--------|-------------|
| `get_queryset()` | Filtre les utilisateurs | Retourne tous les utilisateurs, filtrables par rôle, statut (actif/inactif), et recherche textuelle |
| `get_context_data()` | Contexte template | Ajoute les rôles disponibles au contexte |
| Pagination | 25 par page | Affiche 25 utilisateurs par page |

#### View UserToggleActiveView
`app/backend/apps/accounts/views.py` - AJAX POST
- Bascule le statut `is_active` d'un utilisateur
- Invalide toutes les sessions de l'utilisateur s'il est désactivé
- Retourne JSON avec le nouveau statut

#### View UserRoleChangeView
`app/backend/apps/accounts/views.py` - AJAX POST
- Change le rôle d'un utilisateur
- Valide que le nouveau rôle existe
- Enregistre l'action dans AuditLog

#### Décorateurs et Mixins
`app/backend/apps/accounts/decorators.py` et `app/backend/apps/accounts/mixins.py`

| Nom | Type | Roles autorisés | Description |
|-----|------|-----------------|-------------|
| `@role_required(*roles)` | Décorateur | Variable | Restreint l'accès selon les rôles |
| `@admin_required` | Décorateur | admin | Réserve aux administrateurs |
| `@rh_required` | Décorateur | rh, admin | Réserve aux RH et admins |
| `AdminRequiredMixin` | Mixin | admin | Classe de base pour les vues réservées à l'admin |
| `RHOrAdminMixin` | Mixin | rh, admin | Pour les vues RH et admin |
| `RecruteurMixin` | Mixin | recruteur, rh, admin | Pour les vues recruteur |
| `CandidatMixin` | Mixin | candidat | Pour les vues candidat |

---

### Module Candidatures (Postulations)

#### ViewSet CandidatureViewSet
`app/backend/apps/candidatures/viewsets.py`

| Action | Endpoint | Méthode | Description |
|--------|----------|---------|-------------|
| `list()` | `/candidatures/` | GET | Liste les candidatures (filtrées selon le rôle) |
| `create()` | `/candidatures/` | POST | Crée une nouvelle candidature (postulation) |
| `offre()` | `/candidatures/offre/{id}/` | GET | Retourne les candidatures d'une offre |
| `my_applications()` | `/candidatures/my-applications/` | GET | Retourne les candidatures du candidat connecté |
| `status()` | `/candidatures/{id}/status/` | GET | Retourne rapidement le statut IA et général d'une candidature |
| `statut()` | `/candidatures/{id}/statut/` | POST | Met à jour le statut d'une candidature (RH only) |

**Logiques importantes:**
- Les candidats ne voient que leurs propres candidatures
- Vérification anti-doublon : impossible de postuler deux fois à la même offre
- Filtrage par offre et statut en querystring
- Validation du nouveau statut lors de la mise à jour

---

### Module Offres (Job Listings)

#### ViewSet OffreViewSet
`app/backend/apps/offres/viewsets.py`

| Action | Endpoint | Méthode | Description |
|--------|----------|---------|-------------|
| `list()` | `/offres/` | GET | Liste les offres (publiées pour candidats, toutes pour RH) |
| `create()` | `/offres/` | POST | Crée une nouvelle offre (RH only) |
| `autocomplete()` | `/offres/autocomplete/` | GET | Autocomplétion pour les compétences |

**Filtres querystring:**
- `q` : Recherche texte sur titre et description
- `type_contrat` : CDI, CDD, Stage, Freelance
- `statut` : brouillon, publiee, fermee

#### ViewSet CompetenceViewSet
`app/backend/apps/offres/viewsets.py`

| Action | Endpoint | Méthode | Description |
|--------|----------|---------|-------------|
| `list()` | `/competences/` | GET | Liste toutes les compétences (publique) |
| `create()` | `/competences/` | POST | Crée une compétence |

---

### Module Entretiens (Interviews)

#### ViewSet EntretienViewSet
`app/backend/apps/entretiens/viewsets.py`

| Action | Endpoint | Méthode | Description |
|--------|----------|---------|-------------|
| `list()` | `/entretiens/` | GET | Liste les entretiens (filtrés par rôle) |
| `create()` | `/entretiens/` | POST | Crée un nouvel entretien |
| `notes()` | `/entretiens/{id}/notes/` | PATCH/POST | Enregistre les notes d'un entretien |
| `statut()` | `/entretiens/{id}/statut/` | PATCH/POST | Modifie le statut (planifie, en_cours, termine, annule) |

**Statuts disponibles:**
- `planifie` : Entretien programmé
- `en_cours` : En déroulement
- `termine` : Terminé
- `annule` : Annulé

---

### Module Évaluations

#### ViewSet EvaluationViewSet
`app/backend/apps/evaluations/viewsets.py`

| Action | Endpoint | Méthode | Description |
|--------|----------|---------|-------------|
| `list()` | `/evaluations/` | GET | Liste les évaluations (filtrées par rôle) |
| `create()` | `/evaluations/` | POST | Crée une nouvelle évaluation |
| `submit()` | `/evaluations/{id}/submit/` | POST | Soumet l'évaluation (statut = 'soumis') |
| `pdf()` | `/evaluations/{id}/pdf/` | GET | Retourne l'URL du PDF d'évaluation |

**Critères d'évaluation:**
- `competences_rate` (1-5) : Compétences techniques
- `communication_rate` (1-5) : Communication
- `motivation_rate` (1-5) : Motivation
- `adaptabilite_rate` (1-5) : Adaptabilité
- `culture_fit_rate` (1-5) : Adéquation culturelle
- `moyenne_score` : Calculée automatiquement

---

### Module Statistiques (KPI & Dashboard)

#### Classe RHKPICalculator
`app/backend/apps/statistiques/kpi_calculator.py`

| Méthode | Paramètres | Retour | Description |
|---------|-----------|--------|-------------|
| `__init__()` | `date_debut`, `date_fin` (optionnels) | None | Initialise avec filtrage optionnel par date |
| `get_funnel()` | Aucun | dict | Retourne l'entonnoir : total, préséléctionnés, entretiens, retenus, taux |
| `get_delai_moyen()` | Aucun | float | Délai moyen (jours) entre postulation et évaluation soumise |
| `get_score_stats()` | Aucun | dict | Statistiques des scores IA : average, max, min |
| `get_top_competences()` | `n=8` (int) | list | Top N compétences les plus demandées |
| `get_dashboard_stats()` | Aucun | dict | Synthèse pour le dashboard : total_offres, total_candidatures, total_entretiens, recrutements_reussis, top_candidats |
| `get_all()` | Aucun | dict | Agrège toutes les métriques |

#### ViewSet KPIViewSet
`app/backend/apps/statistiques/viewsets.py`

| Action | Endpoint | Méthode | Description |
|--------|----------|---------|-------------|
| `list()` | `/kpi/` | GET | Retourne les KPIs complets (via RHKPICalculator) |

#### Fonction dashboard_stats
`app/backend/apps/statistiques/viewsets.py` - Décorée avec `@api_view(['GET'])`

- Endpoint : `/statistiques/rh/`
- Retourne les statistiques du dashboard RH
- Sérialisée via `DashboardStatsSerializer`

---

### Module IA (Intelligence Artificielle)

#### Classe CVTextExtractor
`app/backend/apps/ia/extractors.py`

| Méthode | Paramètres | Retour | Description |
|---------|-----------|--------|-------------|
| `extract()` | `file_path` (str) | str | Extraction de texte (point d'entrée) - détermine le format |
| `_extract_pdf()` | `path` (Path) | str | Extraction PDF standard via PyPDF2 |
| `_extract_pdf_ocr()` | `path` (Path) | str | Extraction PDF par OCR (pour scans) via Tesseract |
| `_extract_docx()` | `path` (Path) | str | Extraction DOCX via python-docx |
| `_clean_text()` | `text` (str) | str | Normalisation du texte (espaces, retours à la ligne) |

**Formats supportés:** `.pdf`, `.docx`, `.doc`

#### Fonctions du Service IA
`app/backend/apps/ia/service.py`

| Fonction | Paramètres | Retour | Description |
|----------|-----------|--------|-------------|
| `extract_cv_text()` | `file_path` | str | Extrait le texte brut du CV |
| `extract_competences()` | `texte`, `offre_skills` | list | Extrait les compétences du CV comparées à l'offre |
| `extract_experience()` | `texte` | int | Extrait le nombre d'années d'expérience |
| `normalize_competences()` | `competences` | list | Normalise les compétences via LLM |
| `compute_score()` | `cv_data`, `offre` | float | Calcule le score de compatibilité (0-100%) |
| `generate_summary()` | `texte` | str | Génère un résumé du CV via LLM |

---

### Module Rapports PDF

#### Classe EvaluationPDFGenerator
`app/backend/apps/rapports/pdf_generator.py`

| Méthode | Paramètres | Retour | Description |
|---------|-----------|--------|-------------|
| `generate()` | `evaluation` (Evaluation) | BytesIO | Génère le PDF d'évaluation complet avec notes et graphique |

**Contenu du PDF:**
- Titre et informations du candidat
- Offre et date d'entretien
- Tableau des notes par critère
- Graphique radar (scores visuels)
- Recommandation colorée (retenu/reconsidérer/refusé)
- Commentaires du recruteur

---

### Module Notifications

#### Tâches Celery
`app/backend/apps/notifications/tasks.py`

| Tâche | Paramètres | Description |
|-------|-----------|-------------|
| `send_activation_email()` | `user_id`, `activation_link` | Envoie le lien d'activation |
| `send_application_notification()` | `candidature_id` | Notifie le recruteur d'une nouvelle candidature |
| `send_interview_invitation()` | `entretien_id` | Invite le candidat à un entretien |
| `send_final_decision()` | `candidature_id`, `decision` | Communique la décision finale au candidat |

---

## 14. Frontend Services - Méthodes et Fonctions

### Service Auth
`app/frontend/src/services/auth.service.ts`

| Fonction | Paramètres | Retour | Description |
|----------|-----------|--------|-------------|
| `login()` | `email`, `password` | Promise | Authentifie l'utilisateur |
| `register()` | `data` (UserCreateData) | Promise | Crée un nouveau compte utilisateur |
| `logout()` | Aucun | Promise | Déconnecte l'utilisateur |
| `getCurrentUser()` | Aucun | Promise | Récupère l'utilisateur connecté |
| `updateProfile()` | `data` (ProfileUpdateData) | Promise | Met à jour le profil utilisateur |
| `changePassword()` | `oldPassword`, `newPassword` | Promise | Change le mot de passe |

---

### Service Offres
`app/frontend/src/services/offres.service.ts`

| Fonction | Paramètres | Retour | Description |
|----------|-----------|--------|-------------|
| `listOffres()` | `filters?` (OffreFilters) | Promise | Liste les offres avec filtres optionnels |
| `getOffre()` | `id` (number) | Promise | Récupère une offre par ID |
| `createOffre()` | `data` (OffreCreateData) | Promise | Crée une nouvelle offre (RH) |
| `updateOffre()` | `id`, `data` | Promise | Met à jour une offre (RH) |
| `deleteOffre()` | `id` (number) | Promise | Supprime une offre (RH) |
| `autocompleteSkills()` | `query` (string) | Promise | Autocomplétion pour les compétences |

---

### Service Candidatures
`app/frontend/src/services/candidatures.service.ts`

| Fonction | Paramètres | Retour | Description |
|----------|-----------|--------|-------------|
| `listCandidatures()` | `offreId?` (number) | Promise | Liste les candidatures d'une offre |
| `getCandidature()` | `id` (number) | Promise | Récupère une candidature par ID |
| `createCandidature()` | `data` (CandidatureCreateData) | Promise | Crée une nouvelle candidature (postulation) |
| `updateStatus()` | `id`, `newStatus` | Promise | Met à jour le statut d'une candidature (RH) |
| `getMyApplications()` | Aucun | Promise | Récupère les candidatures de l'utilisateur connecté |
| `getStatus()` | `id` (number) | Promise | Récupère rapidement le statut IA et général |

---

### Service Entretiens
`app/frontend/src/services/entretiens.service.ts`

| Fonction | Paramètres | Retour | Description |
|----------|-----------|--------|-------------|
| `listEntretiens()` | Aucun | Promise | Liste les entretiens de l'utilisateur |
| `getEntretien()` | `id` (number) | Promise | Récupère un entretien par ID |
| `createEntretien()` | `data` (EntretienCreateData) | Promise | Crée un nouvel entretien (planification) |
| `updateNotes()` | `id`, `notes` | Promise | Enregistre les notes d'un entretien |
| `updateStatus()` | `id`, `status` | Promise | Change le statut d'un entretien |

---

### Service Évaluations
`app/frontend/src/services/evaluations.service.ts`

| Fonction | Paramètres | Retour | Description |
|----------|-----------|--------|-------------|
| `listEvaluations()` | Aucun | Promise | Liste les évaluations |
| `getEvaluation()` | `id` (number) | Promise | Récupère une évaluation par ID |
| `createEvaluation()` | `data` (EvaluationCreateData) | Promise | Crée une nouvelle évaluation |
| `submitEvaluation()` | `id` (number) | Promise | Soumet l'évaluation (finalise) |
| `getPDF()` | `id` (number) | Promise | Récupère le PDF d'évaluation |

---

### Service Statistiques
`app/frontend/src/services/statistiques.service.ts`

| Fonction | Paramètres | Retour | Description |
|----------|-----------|--------|-------------|
| `getDashboardStats()` | Aucun | Promise | Récupère les statistiques du dashboard RH |
| `getKPIs()` | Aucun | Promise | Récupère les KPIs complets |
| `exportCSV()` | Aucun | Promise | Exporte les données en CSV |

---

### Service Admin
`app/frontend/src/services/admin.service.ts`

| Fonction | Paramètres | Retour | Description |
|----------|-----------|--------|-------------|
| `listUsers()` | `filters?` | Promise | Liste les utilisateurs (admin only) |
| `updateUserRole()` | `userId`, `newRole` | Promise | Change le rôle d'un utilisateur (admin only) |
| `toggleUserStatus()` | `userId` | Promise | Bascule le statut actif/inactif d'un utilisateur |
| `getAuditLogs()` | `filters?` | Promise | Récupère les journaux d'audit (admin only) |

---

## 15. Frontend Composants - Méthodes Principales

### Composant KanbanBoard
`app/frontend/src/components/rh/KanbanBoard.tsx`

| Méthode | Description |
|---------|-------------|
| `handleDragStart()` | Initialise le drag-and-drop d'une candidature |
| `handleDragOver()` | Gère l'espace de drop |
| `handleDrop()` | Finalise le drop et met à jour le statut |
| `getStatusColor()` | Retourne la couleur associée au statut |
| `groupByStatus()` | Groupe les candidatures par statut |

### Composant CreateEvaluationModal
`app/frontend/src/components/rh/CreateEvaluationModal.tsx`

| Méthode | Description |
|---------|-------------|
| `calculateAverage()` | Calcule la note moyenne des 5 critères |
| `handleSubmit()` | Valide et soumet l'évaluation |
| `generatePDF()` | Génère et télécharge le PDF |

### Composant PlanifierEntretienModal
`app/frontend/src/components/rh/PlanifierEntretienModal.tsx`

| Méthode | Description |
|---------|-------------|
| `checkConflicts()` | Détecte les conflits d'horaire |
| `generateMeetingLink()` | Génère un lien Jitsi pour la vidéo |
| `handleSubmit()` | Crée l'entretien et envoie l'invitation |

### Composant CandidatureIAModal
`app/frontend/src/components/rh/CandidatureIAModal.tsx`

| Méthode | Description |
|---------|-------------|
| `displayScore()` | Affiche le score IA avec barre de progression |
| `showMatchingSkills()` | Liste les compétences correspondantes |
| `showMissingSkills()` | Liste les compétences manquantes |
| `displaySummary()` | Affiche le résumé généré par l'IA |

---

## 16. Stores (Gestion d'état)

### AuthStore
`app/frontend/src/stores/authStore.ts`

| État | Type | Description |
|------|------|-------------|
| `user` | User \| null | Utilisateur actuellement connecté |
| `isLoading` | boolean | État de chargement |
| `setUser()` | (user: User) => void | Définit l'utilisateur connecté |
| `logout()` | () => void | Réinitialise l'utilisateur |

### UIStore
`app/frontend/src/stores/uiStore.ts`

| État | Type | Description |
|------|------|-------------|
| `isDarkMode` | boolean | Thème clair/sombre |
| `sidebarOpen` | boolean | État de la sidebar |
| `toggleTheme()` | () => void | Bascule le thème |
| `toggleSidebar()` | () => void | Bascule la sidebar |

---

## 17. Hooks React Personnalisés

### useAuth
`app/frontend/src/hooks/useAuth.ts`

```typescript
function useAuth(): {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}
```

### useCandidatures
`app/frontend/src/hooks/useCandidatures.ts`

```typescript
function useCandidatures(offreId?: number): {
  candidatures: Candidature[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}
```

### useKanbanBoard
`app/frontend/src/hooks/useKanbanBoard.ts`

```typescript
function useKanbanBoard(): {
  groupedCandidatures: Record<string, Candidature[]>
  updateStatus: (candidatureId: number, newStatus: string) => Promise<void>
}
```

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
- **ky** - Client HTTP
- **Playwright** - Tests e2e

### Infrastructure
- **Docker** - Conteneurisation
- **GitHub Actions** - CI/CD

---

## Pour toute question

Cette documentation couvre l'ensemble des fonctionnalites de l'application JobTech. Chaque section indique les fichiers sources concernes pour permet une comprehension technique detaillee du fonctionnement.
