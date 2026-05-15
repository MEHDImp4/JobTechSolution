# Explication complète de la codebase

Ce document explique le projet JobTech de façon simple, avec un niveau adapté à une personne qui débute en Python. L'idée n'est pas de recopier le code, mais de montrer à quoi servent les fichiers, comment ils travaillent ensemble, et par où commencer pour comprendre le projet.

## 1. Présentation simple du projet

JobTech est une application web de gestion du recrutement.

Elle sert à aider une entreprise à :

- publier des offres d'emploi
- recevoir des candidatures
- analyser les CV
- planifier des entretiens
- noter les candidats
- suivre des statistiques de recrutement
- envoyer des notifications et des rapports PDF

Le projet a deux grandes parties :

- le backend Python avec Django, qui stocke les données et applique les règles métier
- une interface web reliée au backend, qui passe par les routes API et les services du projet

Quand on lance le projet, le backend expose les données et l'interface web les récupère via les API. Le lien principal se fait par `jobtech/api.py` et par la couche web qui appelle ces routes.

Qui peut utiliser cette application ?

- un candidat, pour consulter les offres et postuler
- un recruteur, pour suivre les candidatures et faire les entretiens
- un responsable RH, pour gérer les offres, les statistiques et les décisions
- un administrateur, pour gérer les utilisateurs et le journal d'audit

## 2. Vue d'ensemble du fonctionnement

Le projet fonctionne comme une chaîne simple :

1. L'utilisateur ouvre le site dans son navigateur.
2. L'interface web charge la page correspondante.
3. La page appelle un service API.
4. Ce service envoie une requête au backend Django.
5. Django applique les règles métier, lit ou écrit en base de données, puis renvoie une réponse.
6. React affiche le résultat à l'écran.

Schéma simplifié :

```txt
Utilisateur
   ↓
Interface web
   ↓
Services API TypeScript
   ↓
Backend Django / DRF
   ↓
Modèles de données / base de données
   ↓
Réponse JSON ou PDF
```

Dans ce projet, il y a aussi des tâches en arrière-plan avec Celery. Ces tâches servent par exemple à analyser un CV, générer un résumé IA, envoyer un email ou créer un PDF. Cela évite de bloquer l'utilisateur pendant une opération longue.

## 3. Structure des dossiers

### Dossier racine : `JobTechSolution/`

Ce dossier contient le projet complet.
Il contient la documentation, la configuration Docker et le dossier `app/`.
Il est important parce qu'il montre que le projet est séparé en backend et frontend.

### Dossier : `app/backend/`

Ce dossier contient toute la partie Django/Python.
Il contient les modèles, les vues, les serializers, les tâches Celery et la configuration Django.
Il est important parce que c'est là que se trouve la logique métier.

### Dossier : `app/backend/apps/`

Ce dossier regroupe les applications Django métier.
Chaque sous-dossier correspond à un sujet précis : comptes, offres, candidatures, entretiens, évaluations, IA, statistiques, rapports et notifications.
Cette séparation rend le projet plus facile à lire.

### Dossier : `app/backend/jobtech/`

Ce dossier contient la configuration générale du projet Django.
On y trouve les réglages, les routes principales, Celery et la pagination.

### Dossier : `app/backend/media/`

Ce dossier contient les fichiers uploadés ou générés.
Par exemple : les CV, les rapports PDF et les fichiers temporaires.

### Dossier : `app/backend/static/`

Ce dossier contient les fichiers statiques du backend.
On y met par exemple du CSS ou du JavaScript côté Django.

### Dossier : `app/backend/templates/`

Ce dossier contient les templates HTML du backend.
Il sert surtout pour les anciennes pages Django et pour les emails.

### Dossier : `app/frontend/`

Ce dossier contient l'application React.
Il gère l'interface utilisateur, les routes de navigation, les services API et l'état local.

### Dossier : `app/frontend/src/`

Ce dossier contient presque tout le code React.
On y trouve les pages, les composants, les services, les stores et les types TypeScript.

### Dossier : `assets/`

Ce dossier contient des documents du projet, comme des rapports ou un cahier des charges.
Il sert de mémoire documentaire.

## 4. Explication des fichiers importants

### Fichier : `README.md`

#### Rôle du fichier

Ce fichier donne la vue d'ensemble du projet.
Il explique ce que fait JobTech, quelles technologies sont utilisées et comment lancer le projet.

#### Ce qu'il contient

- une présentation générale
- l'architecture backend/frontend
- les fonctionnalités principales
- les commandes d'installation
- un résumé de la structure du projet

#### Comment il est utilisé

Il sert de point d'entrée rapide pour quelqu'un qui découvre le dépôt.

#### Explication simple

Si tu veux comprendre vite le projet, ce fichier est le premier à lire.

### Fichier : `docker-compose.yml`

#### Rôle du fichier

Ce fichier décrit les services nécessaires pour faire tourner le projet avec Docker.

#### Ce qu'il contient

- une base MySQL
- Redis pour les tâches asynchrones
- le backend Django
- le worker Celery
- le scheduler Celery Beat
- l'interface web

#### Comment il est utilisé

Il permet de lancer tout le projet avec une seule commande Docker.

#### Explication simple

Ce fichier dit à Docker quoi démarrer, dans quel ordre, et avec quelles variables d'environnement.

### Fichier : `app/backend/manage.py`

#### Rôle du fichier

Ce fichier sert à lancer les commandes Django.

#### Ce qu'il contient

- la préparation de la variable `DJANGO_SETTINGS_MODULE`
- l'appel à `execute_from_command_line`

#### Comment il est utilisé

On l'utilise pour faire `runserver`, `migrate`, `createsuperuser`, `test`, etc.

#### Explication simple

C'est la porte d'entrée des commandes Django.

### Fichier : `app/backend/requirements.txt`

#### Rôle du fichier

Ce fichier liste les bibliothèques Python nécessaires au projet.

#### Ce qu'il contient

- Django et Django REST Framework
- Celery et Redis
- PostgreSQL/MySQL drivers
- spaCy, scikit-learn et OpenAI pour la partie IA
- ReportLab et Matplotlib pour les PDFs et graphiques
- django-filter, django-formtools, corsheaders, webpush

#### Comment il est utilisé

On l'installe avec `pip install -r requirements.txt`.

#### Explication simple

Si un package manque ici, Python ne pourra pas importer les modules qui en dépendent.

### Fichier : `app/backend/pyproject.toml`

#### Rôle du fichier

Ce fichier configure les outils de qualité de code.

#### Ce qu'il contient

- les règles Ruff
- les règles Black
- la configuration MyPy
- la configuration Django stubs

#### Comment il est utilisé

Il sert pour le formatage, le lint et les vérifications de type.

#### Explication simple

Ce fichier dit aux outils comment contrôler le style et la qualité du code Python.

### Fichier : `app/backend/jobtech/settings.py`

#### Rôle du fichier

Ce fichier contient la configuration principale de Django.

#### Ce qu'il contient

- la clé secrète
- le mode debug
- les applications installées
- les middleware
- les templates
- la base de données
- les fichiers statiques et médias
- le cache
- Celery
- l'email
- CORS et CSRF
- WebPush
- des réglages spéciaux pour les tests

#### Comment il est utilisé

Chaque fois que Django démarre, il lit ce fichier.

#### Explication simple

Ce fichier est très important : il dit au projet comment se connecter, comment s'authentifier, où trouver les fichiers, et quelles bibliothèques activer.

Points à retenir pour un débutant :

- le projet lit les variables depuis un fichier `.env`
- si `DATABASE_URL` existe, Django essaie de l'utiliser
- sinon, le projet tombe sur SQLite en local
- pendant les tests, le projet force SQLite en mémoire pour aller plus vite

### Fichier : `app/backend/jobtech/urls.py`

#### Rôle du fichier

Ce fichier dit quelle route mène vers quel module.

#### Ce qu'il contient

- `/admin/` pour l'administration Django
- `/api/` pour les routes REST
- `/webpush/` pour les notifications push
- `/accounts/`, `/offres/`, `/candidat/` pour certaines pages Django classiques

#### Comment il est utilisé

Quand le navigateur visite une URL, Django regarde ce fichier pour savoir quoi afficher ou quelle API appeler.

#### Explication simple

Ce fichier joue le rôle de panneau de direction pour toute l'application.

### Fichier : `app/backend/jobtech/api.py`

#### Rôle du fichier

Ce fichier regroupe les routes API Django REST Framework.

#### Ce qu'il contient

- un routeur pour l'authentification
- un routeur principal pour les utilisateurs, offres, candidatures, entretiens, évaluations et statistiques
- une route spéciale pour les statistiques RH

#### Comment il est utilisé

Il est inclus dans `/api/` depuis `jobtech/urls.py`.

#### Explication simple

Ce fichier transforme les classes DRF en vraies URLs d'API.

### Fichier : `app/backend/jobtech/celery.py`

#### Rôle du fichier

Ce fichier configure Celery.

#### Ce qu'il contient

- la variable de configuration Django
- l'objet Celery `app`
- la découverte automatique des tâches

#### Comment il est utilisé

Il permet d'exécuter les tâches en arrière-plan.

#### Explication simple

Sans ce fichier, Django ne saurait pas comment lancer les workers Celery.

### Fichier : `app/backend/jobtech/pagination.py`

#### Rôle du fichier

Ce fichier définit la pagination API.

#### Ce qu'il contient

- une classe `StandardResultsSetPagination`

#### Comment il est utilisé

Elle est utilisée dans plusieurs viewsets pour limiter le nombre d'éléments par page.

#### Explication simple

La pagination évite d'envoyer trop de données en une seule réponse.

Le frontend existe bien dans le dépôt, mais pour comprendre le projet il suffit de savoir qu'il est branché sur le backend par les routes API, les services HTTP et la navigation de l'application.

## 5. Structure des dossiers métier backend

### Dossier : `app/backend/apps/accounts/`

Ce dossier gère les comptes utilisateurs, l'authentification, les rôles et l'audit.
Il est important parce qu'il contrôle qui a le droit de faire quoi.

#### Fichier : `models.py`

Ce fichier contient les modèles `User` et `AuditLog`.

- `User` représente un compte avec email, nom, prénom, téléphone, rôle, statut actif et statut de vérification email.
- `AuditLog` enregistre les actions importantes faites dans l'application.

Idées simples à retenir :

- une classe `User` sert à représenter une personne connectée
- une classe `AuditLog` sert à garder une trace de ce qui a été modifié

#### Fichier : `managers.py`

Ce fichier contient `CustomUserManager`.

Il définit comment créer un utilisateur normal et comment créer un superutilisateur.
Il force aussi la présence de l'email.

#### Fichier : `serializers.py`

Ce fichier transforme les objets Python en JSON et inversement.

- `UserSerializer` affiche un utilisateur
- `UserCreateSerializer` crée un utilisateur avec mot de passe et confirmation
- `ProfileUpdateSerializer` met à jour le profil
- `PasswordChangeSerializer` valide un changement de mot de passe
- `AuditLogSerializer` expose les logs d'audit

#### Fichier : `middleware.py`

Ce fichier contient `AuditMiddleware`.

Il observe les requêtes `POST`, `PUT`, `PATCH` et `DELETE`, puis lance une tâche Celery pour enregistrer un log d'audit après la réponse.

#### Fichier : `tokens.py`

Ce fichier contient `AccountActivationTokenGenerator`.

Il fabrique un token de validation pour l'activation par email.

#### Fichier : `utils.py`

Ce fichier contient `compute_json_diff`.

Il compare deux dictionnaires et explique ce qui a été ajouté, supprimé ou modifié.

#### Fichier : `tasks.py`

Ce fichier contient les tâches Celery liées aux comptes.

- `create_audit_log` enregistre un log de manière asynchrone
- `cleanup_expired_data` anonymise les anciens comptes candidats

#### Fichier : `viewsets.py`

Ce fichier expose les APIs DRF du module comptes.

- `AuthViewSet` gère la session, le login, le logout et la route `me`
- `UserViewSet` gère les utilisateurs, les filtres, le changement de rôle, l'activation et le changement de mot de passe
- `AuditLogViewSet` affiche les journaux d'audit

#### Fichier : `urls.py`

Ce fichier relie les vues classiques et les routes API du module comptes.

Il contient notamment l'inscription, l'activation, le login, le logout, la liste des utilisateurs, l'import CSV et les vues d'audit.

#### Fichier : `views.py`

Ce fichier contient les vues Django classiques du module comptes.

On y trouve :

- `RegisterView`
- `ActivateAccountView`
- `CustomLoginView`
- `CustomLogoutView`
- `UserListView`
- `UserToggleActiveView`
- `UserRoleChangeView`
- `UserImportCSVView`
- `AuditLogListView`

Ces vues servent surtout aux pages serveur et à l'administration.

### Dossier : `app/backend/apps/offres/`

Ce dossier gère les offres d'emploi et les compétences.

#### Fichier : `models.py`

Les classes principales sont :

- `Competence` : une compétence comme Python, SQL ou communication
- `Offre` : une offre d'emploi complète

Le modèle `Offre` contient par exemple : titre, description, type de contrat, salaire, statut, date de publication et la liste des compétences.

Il a aussi des méthodes utiles :

- `publish()` pour publier l'offre
- `close()` pour la clôturer
- `get_candidatures_count()` pour compter les candidatures liées

#### Fichier : `serializers.py`

Ce fichier prépare les données pour l'API.

- `CompetenceSerializer`
- `OffreSerializer`
- `OffreCreateSerializer`
- `OffreListSerializer`

#### Fichier : `viewsets.py`

Ce fichier gère les APIs DRF des offres.

- `OffreViewSet` liste, filtre, crée et récupère les offres
- `CompetenceViewSet` expose les compétences

Il y a aussi une action `autocomplete` pour chercher rapidement des compétences.

#### Fichier : `filters.py`

Ce fichier définit les filtres utilisés dans la recherche des offres.

#### Fichier : `forms.py`

Ce fichier sert aux vues Django classiques qui créent ou modifient des offres.

#### Fichier : `urls.py`

Ce fichier expose les pages classiques des offres et les routes API.

#### Fichier : `views.py`

Ce fichier contient les vues serveur classiques : liste, détail, création, modification, suppression, publication et recherche.

Une fonction importante y apparaît aussi : `_update_competence_counts`, qui met à jour le compteur d'utilisation des compétences.

### Dossier : `app/backend/apps/candidatures/`

Ce dossier gère les candidatures envoyées par les candidats.

#### Fichier : `models.py`

Les classes principales sont :

- `Candidature` : une candidature pour une offre donnée

Cette classe stocke :

- l'offre concernée
- le candidat
- le fichier CV
- la lettre de motivation
- le nombre d'années d'expérience
- le lien LinkedIn
- le statut de la candidature
- le score IA
- le statut du traitement IA

La méthode `get_statut_step()` sert à afficher l'étape courante dans l'interface.

Il y a aussi la fonction `cv_upload_path`, qui choisit où stocker le CV.

#### Fichier : `validators.py`

Ce fichier vérifie les fichiers CV.

La fonction `validate_cv_file` contrôle :

- le type du fichier avec les premiers octets du fichier
- la taille maximale de 5 Mo

#### Fichier : `serializers.py`

Ce fichier transforme les candidatures pour l'API.

- `CandidatureSerializer`
- `CandidatureCreateSerializer`
- `CandidatureUpdateSerializer`
- `CandidatureListSerializer`

#### Fichier : `viewsets.py`

Ce fichier gère les opérations API sur les candidatures.

- `CandidatureViewSet` limite la vue des données selon le rôle
- il empêche la double candidature sur la même offre
- il permet de voir ses propres candidatures
- il permet à RH de changer le statut ou de faire une mise à jour groupée

#### Fichier : `forms.py`

Ce fichier contient les formulaires utilisés par le wizard de candidature côté Django classique.

#### Fichier : `urls.py`

Ce fichier relie la partie candidat, le wizard de candidature et les endpoints API.

#### Fichier : `views.py`

Ce fichier contient les vues classiques du parcours candidat.

- `CandidatureCreateView` pour l'envoi direct d'un CV
- `IaStatusView` pour connaître l'état d'analyse IA
- `CandidatureWizardView` pour le formulaire en plusieurs étapes
- `CandidatDashboardView` pour le tableau de bord candidat

Cette partie montre clairement le flux : offre → candidature → analyse IA → dashboard.

### Dossier : `app/backend/apps/entretiens/`

Ce dossier gère les entretiens et le planning.

#### Fichier : `models.py`

Les classes principales sont :

- `Entretien` : un entretien planifié entre un candidat et un recruteur
- `ObjectifEntretien` : un objectif à vérifier pendant l'entretien

Le modèle `Entretien` contient la date, la durée, le type, le lieu, le lien visio, les notes et le résumé IA.

Ses éléments importants :

- `end_time` calcule l'heure de fin
- `check_conflict()` vérifie si le recruteur a déjà un autre entretien au même moment

#### Fichier : `serializers.py`

Ce fichier prépare les entretiens pour l'API.

- `EntretienSerializer`
- `EntretienCreateSerializer`
- `ObjectifSerializer`

#### Fichier : `viewsets.py`

Ce fichier gère les entretiens via DRF.

- `EntretienViewSet` filtre selon le rôle
- il permet de créer un entretien
- il permet de changer les notes
- il permet de changer le statut

#### Fichier : `tasks.py`

Ce fichier contient des tâches asynchrones pour les entretiens.

Dans le code, ces tâches servent à préparer ou à automatiser certains traitements liés aux entretiens.

#### Fichier : `urls.py`

Ce fichier relie les vues classiques et la route API du module entretiens.

#### Fichier : `views.py`

Ce fichier existe comme couche serveur classique. Dans l'état du dépôt, certaines vues y sont prévues par l'architecture du projet, même si la logique métier principale passe surtout par les viewsets et l'interface web.

### Dossier : `app/backend/apps/evaluations/`

Ce dossier gère les évaluations de fin d'entretien.

#### Fichier : `models.py`

La classe principale est `Evaluation`.

Elle stocke :

- l'entretien évalué
- le recruteur
- plusieurs notes de 1 à 5
- les commentaires
- les points forts
- les points à améliorer
- la recommandation finale
- le sentiment IA
- la recommandation IA
- la date de soumission
- le fichier PDF généré

La propriété `moyenne_score` calcule la moyenne des notes.

#### Fichier : `serializers.py`

Ce fichier prépare les évaluations pour l'API.

- `EvaluationSerializer`
- `EvaluationCreateSerializer`

#### Fichier : `viewsets.py`

Ce fichier gère les évaluations via DRF.

- `EvaluationViewSet` limite les résultats selon le rôle
- il permet de créer une évaluation
- il permet de la soumettre
- il expose une route pour le PDF

#### Fichier : `forms.py`

Ce fichier sert aux vues serveur classiques de création ou de saisie.

#### Fichier : `urls.py`

Ce fichier relie les vues serveur et l'API.

#### Fichier : `views.py`

Ce fichier existe pour la couche Django classique.

Dans ce dépôt, la logique la plus utile est surtout exposée par le viewset et le frontend.

### Dossier : `app/backend/apps/ia/`

Ce dossier gère la partie IA et traitement de CV.

#### Fichier : `models.py`

Les classes principales sont :

- `CVData` : les données extraites d'un CV
- `ScoreDetail` : le détail du score IA

`CVData` peut contenir :

- le texte brut du CV
- les compétences extraites
- les années d'expérience
- les formations
- les langues
- un résumé IA
- des questions d'entretien suggérées
- une erreur d'extraction si quelque chose a raté

`ScoreDetail` contient :

- un score compétences
- un score expérience
- un score global
- les compétences trouvées
- les compétences manquantes

#### Fichier : `extractors.py`

Ce fichier contient `CVTextExtractor`.

Il sait lire :

- les PDF
- les DOCX
- les anciens DOC

Il essaie aussi un OCR si un PDF est scanné et que l'extraction simple ne marche pas.

#### Fichier : `nlp_pipeline.py`

Ce fichier contient `CVEntityExtractor`.

Il cherche dans le texte du CV :

- les compétences
- les années d'expérience
- les sections comme formation ou langues

#### Fichier : `scorer.py`

Ce fichier contient `CompatibilityScorer`.

Il compare le CV et l'offre pour produire un score de compatibilité.

L'idée simple est :

- si les compétences matchent, le score monte
- si l'expérience correspond, le score monte aussi
- le score final est une moyenne pondérée

#### Fichier : `llm_client.py`

Ce fichier contient `LLMClient`.

Il sert à parler à un modèle de langage externe pour :

- générer un résumé de CV
- normaliser des compétences
- générer des questions d'entretien
- analyser le sentiment des notes
- générer une recommandation d'embauche
- générer un résumé d'entretien

Le fichier contient aussi des mécanismes de repli local si l'API n'est pas configurée.

#### Fichier : `service.py`

Ce fichier joue le rôle de couche de service.

Il cache la complexité et expose des fonctions simples :

- `extract_cv_text`
- `extract_competences`
- `extract_experience`
- `normalize_competences`
- `compute_score`
- `generate_summary`

#### Fichier : `tasks.py`

Ce fichier contient les tâches Celery liées à l'IA.

- `analyze_cv` extrait le texte, les compétences et lance le scoring
- `calculate_score` calcule le score final et met à jour le statut
- `generate_cv_summary` produit un résumé IA

#### Fichier : `views.py`

Ce fichier est prévu pour la couche vue, mais la logique utile du module est surtout dans les services et les tâches.

#### Fichier : `urls.py`

Ce fichier expose deux routes utiles :

- un résumé IA JSON pour une candidature
- une page de détail candidature pour RH

### Dossier : `app/backend/apps/statistiques/`

Ce dossier gère les indicateurs et tableaux de bord.

#### Fichier : `models.py`

La classe principale est `KPISnapshot`.

Elle stocke des indicateurs mensuels :

- le mois
- le nombre d'entretiens
- le nombre d'embauches
- le nombre d'inscriptions

#### Fichier : `kpi_calculator.py`

Ce fichier contient `RHKPICalculator`.

Il calcule :

- un entonnoir de recrutement
- le délai moyen entre candidature et décision
- les statistiques de score IA
- les compétences les plus demandées
- les chiffres du dashboard RH

#### Fichier : `chart_generator.py`

Ce fichier contient `DashboardChartGenerator`.

Il fabrique des graphiques Matplotlib encodés en base64.

#### Fichier : `tasks.py`

Ce fichier contient `generate_monthly_snapshot`.

Cette tâche enregistre les KPI du mois dans la base.

#### Fichier : `serializers.py`

Ce fichier contient :

- `KPISerializer`
- `DashboardStatsSerializer`

#### Fichier : `viewsets.py`

Ce fichier expose les statistiques via DRF.

- `KPIViewSet`
- `dashboard_stats`
- `export_csv`

### Dossier : `app/backend/apps/rapports/`

Ce dossier gère la génération de rapports PDF.

#### Fichier : `pdf_generator.py`

Ce fichier contient `EvaluationPDFGenerator`.

Il crée un PDF à partir d'une évaluation et ajoute aussi un petit graphique radar.

#### Fichier : `tasks.py`

Ce fichier contient `generate_evaluation_pdf`.

La tâche construit le PDF et l'enregistre dans le champ `pdf_file` de l'évaluation.

#### Fichier : `models.py`

Dans l'état actuel du dépôt, ce fichier est minimal ou réservé à de futures évolutions.

#### Fichier : `views.py`

Ce fichier est aussi prévu pour la couche vue du module rapports.

### Dossier : `app/backend/apps/notifications/`

Ce dossier gère les notifications et les traces d'envoi.

#### Fichier : `models.py`

La classe principale est `NotificationLog`.

Elle garde la trace des notifications envoyées, échouées ou en attente.

#### Fichier : `tasks.py`

Ce fichier contient les tâches d'envoi d'email :

- `send_activation_email`
- `send_interview_notification`
- `send_interview_reminders`
- `send_decision_email`

#### Fichier : `views.py`

Ce fichier est prévu pour la couche web du module notifications.

## 6. Explication des classes et fonctions principales

Cette section résume les classes et fonctions les plus importantes à retenir.

### Classe : `User`

Fichier : `app/backend/apps/accounts/models.py`

Elle représente un utilisateur du système.

Attributs importants :

- `email` : identifiant de connexion
- `nom` et `prenom` : identité de la personne
- `phone` : numéro de téléphone
- `role` : admin, RH, recruteur ou candidat
- `is_active` : compte actif ou non
- `is_email_verified` : email validé ou non

Méthodes importantes :

- `get_full_name` : retourne le nom complet
- `is_admin`, `is_rh`, `is_recruteur`, `is_candidat` : aident à savoir quel droit possède la personne

### Classe : `AuditLog`

Fichier : `app/backend/apps/accounts/models.py`

Elle garde un historique des actions faites dans le système.

Elle sert à savoir qui a fait quoi, quand, depuis quelle adresse IP, et sur quel endpoint.

### Classe : `Competence`

Fichier : `app/backend/apps/offres/models.py`

Elle représente une compétence réutilisable dans les offres.

### Classe : `Offre`

Fichier : `app/backend/apps/offres/models.py`

Elle représente une offre d'emploi.

Méthodes importantes :

- `publish()` : passe l'offre en publiée
- `close()` : ferme l'offre
- `get_candidatures_count()` : compte les candidatures

### Classe : `Candidature`

Fichier : `app/backend/apps/candidatures/models.py`

Elle représente la candidature d'un candidat à une offre.

Méthode importante :

- `get_statut_step()` : donne un numéro d'étape pour l'affichage visuel

### Fonction : `validate_cv_file`

Fichier : `app/backend/apps/candidatures/validators.py`

Elle vérifie qu'un CV est bien un PDF ou un DOCX et qu'il ne dépasse pas 5 Mo.

### Classe : `Entretien`

Fichier : `app/backend/apps/entretiens/models.py`

Elle représente un entretien planifié.

Méthodes importantes :

- `end_time` : calcule l'heure de fin
- `check_conflict()` : vérifie si le recruteur est déjà pris

### Classe : `Evaluation`

Fichier : `app/backend/apps/evaluations/models.py`

Elle représente l'évaluation finale d'un entretien.

Méthode importante :

- `moyenne_score` : calcule la moyenne des notes

### Classe : `CVTextExtractor`

Fichier : `app/backend/apps/ia/extractors.py`

Elle lit un CV et en extrait le texte.

### Classe : `CVEntityExtractor`

Fichier : `app/backend/apps/ia/nlp_pipeline.py`

Elle repère les compétences, l'expérience et certaines sections du CV.

### Classe : `CompatibilityScorer`

Fichier : `app/backend/apps/ia/scorer.py`

Elle compare le CV avec l'offre et retourne un score sur 100.

### Classe : `LLMClient`

Fichier : `app/backend/apps/ia/llm_client.py`

Elle envoie du texte à un modèle de langage pour obtenir un résumé, des questions ou une recommandation.

### Classe : `RHKPICalculator`

Fichier : `app/backend/apps/statistiques/kpi_calculator.py`

Elle calcule les chiffres utiles au tableau de bord RH.

### Classe : `EvaluationPDFGenerator`

Fichier : `app/backend/apps/rapports/pdf_generator.py`

Elle transforme une évaluation en PDF.

### Classe : `DashboardChartGenerator`

Fichier : `app/backend/apps/statistiques/chart_generator.py`

Elle fabrique des graphiques pour le dashboard.

### Classe : `CustomUserManager`

Fichier : `app/backend/apps/accounts/managers.py`

Elle sait créer un utilisateur normal ou un superutilisateur.

### Classe : `AuditMiddleware`

Fichier : `app/backend/apps/accounts/middleware.py`

Elle observe les requêtes qui modifient des données et déclenche une tâche d'audit.

## 6. Explication des fonctions importantes

Cette partie résume les fonctions les plus utiles à comprendre. Pour rester lisible, elles sont regroupées par module.

### Fonctions du module comptes

#### Fonction : `role_required`

Fichier : `app/backend/apps/accounts/decorators.py`

Elle vérifie que l'utilisateur a l'un des rôles autorisés avant d'entrer dans une vue.

#### Fonction : `admin_required`

Fichier : `app/backend/apps/accounts/decorators.py`

Elle bloque l'accès si l'utilisateur n'est pas administrateur.

#### Fonction : `rh_required`

Fichier : `app/backend/apps/accounts/decorators.py`

Elle bloque l'accès si l'utilisateur n'a pas de droit RH.

#### Fonction : `user_permissions`

Fichier : `app/backend/apps/accounts/context_processors.py`

Elle ajoute les permissions de l'utilisateur au contexte des templates.

#### Fonctions : `create_user` et `create_superuser`

Fichier : `app/backend/apps/accounts/managers.py`

Elles créent respectivement un utilisateur normal et un superutilisateur.

#### Fonctions : `clean_email`, `clean_nom`, `clean_prenom`, `clean_password1`, `clean`, `save`

Fichier : `app/backend/apps/accounts/forms.py`

Elles vérifient les données du formulaire d'inscription avant de créer le compte.

#### Fonctions : `process_request`, `process_response`, `_get_ip`, `_extract_model`

Fichier : `app/backend/apps/accounts/middleware.py`

Elles détectent les requêtes à auditer, récupèrent les infos utiles, puis lancent la création d'un log d'audit.

#### Fonctions : `create_audit_log`, `cleanup_expired_data`

Fichier : `app/backend/apps/accounts/tasks.py`

La première enregistre un log en arrière-plan. La seconde anonymise les anciens comptes candidats.

#### Fonction : `_login_error_response`

Fichier : `app/backend/apps/accounts/viewsets.py`

Elle renvoie un message d'erreur différent si le compte est inactif ou si les identifiants sont faux.

#### Fonctions : `list`, `me`, `create`, `login`, `destroy`

Fichier : `app/backend/apps/accounts/viewsets.py`

Elles gèrent la session, la connexion, la déconnexion et la récupération du profil courant.

#### Fonctions : `get_queryset`, `get_serializer_class`, `get_permissions`

Fichier : `app/backend/apps/accounts/viewsets.py`

Elles choisissent quelles données afficher, quel serializer utiliser et quels droits vérifier.

#### Fonctions : `update_profile`, `change_password`, `toggle_active`, `change_role`

Fichier : `app/backend/apps/accounts/viewsets.py`

Elles permettent de modifier le profil, changer le mot de passe, activer ou désactiver un compte, et changer son rôle.

#### Fonction : `compute_json_diff`

Fichier : `app/backend/apps/accounts/utils.py`

Elle compare deux dictionnaires et liste les champs ajoutés, supprimés ou modifiés.

#### Fonction : `assign_default_company` et `remove_default_company`

Fichier : `app/backend/apps/accounts/migrations/0005_assign_default_company.py`

Elles servent à migrer les anciennes données lorsque la structure du modèle change.

### Fonctions du module offres

#### Fonctions : `filter_search`, `filter_competences`

Fichier : `app/backend/apps/offres/filters.py`

Elles filtrent les offres selon le texte recherché ou les compétences.

#### Fonction : `get_competences_list`

Fichier : `app/backend/apps/offres/forms.py`

Elle transforme le contenu du formulaire en vraie liste de compétences.

#### Fonction : `get_queryset`

Fichier : `app/backend/apps/offres/views.py`

Elle choisit quelles offres afficher selon le rôle de l'utilisateur et les filtres demandés.

#### Fonction : `get_context_data`

Fichier : `app/backend/apps/offres/views.py`

Elle ajoute des données utiles au template, par exemple les offres RH ou les filtres actifs.

#### Fonction : `form_valid`

Fichier : `app/backend/apps/offres/views.py`

Elle s'exécute quand le formulaire est correct. Elle enregistre l'offre, les compétences et éventuellement la publication.

#### Fonction : `get_success_url`

Fichier : `app/backend/apps/offres/views.py`

Elle décide où rediriger l'utilisateur après une modification réussie.

#### Fonction : `get`

Fichier : `app/backend/apps/offres/views.py`

Elle sert à bloquer la suppression si des candidatures actives existent.

#### Fonction : `post`

Fichier : `app/backend/apps/offres/views.py`

Elle publie une offre via une requête POST.

#### Fonction : `_update_competence_counts`

Fichier : `app/backend/apps/offres/views.py`

Elle crée ou met à jour les compétences utilisées dans les offres.

#### Fonctions : `get_serializer_class`, `get_queryset`, `is_rh`, `create`, `autocomplete`

Fichier : `app/backend/apps/offres/viewsets.py`

Elles choisissent le serializer, filtrent les offres, vérifient le rôle RH, créent une offre et proposent l'autocomplétion des compétences.

#### Fonction : `get_candidatures_count`

Fichier : `app/backend/apps/offres/models.py`

Elle compte combien de candidatures sont liées à une offre.

#### Fonctions : `publish` et `close`

Fichier : `app/backend/apps/offres/models.py`

Elles changent le statut de l'offre en publiée ou clôturée.

### Fonctions du module candidatures

#### Fonction : `cv_upload_path`

Fichier : `app/backend/apps/candidatures/models.py`

Elle choisit le chemin de stockage d'un CV téléchargé.

#### Fonction : `validate_cv_file`

Fichier : `app/backend/apps/candidatures/validators.py`

Elle vérifie que le CV est bien un PDF ou un DOCX et qu'il ne dépasse pas la taille autorisée.

#### Fonction : `get_statut_step`

Fichier : `app/backend/apps/candidatures/models.py`

Elle transforme le statut d'une candidature en numéro d'étape pour l'affichage.

#### Fonction : `get_candidat_nom`

Fichier : `app/backend/apps/candidatures/serializers.py`

Elle renvoie le nom complet du candidat dans les réponses API.

#### Fonctions : `get_offre_titre`, `get_candidat_nom`

Fichier : `app/backend/apps/candidatures/serializers.py`

Elles ajoutent des textes lisibles dans les listes de candidatures.

#### Fonctions : `get_serializer_class`, `get_queryset`, `is_rh`, `create`

Fichier : `app/backend/apps/candidatures/viewsets.py`

Elles choisissent le serializer, filtrent les candidatures visibles, vérifient le rôle RH et empêchent les doubles candidatures.

#### Fonctions : `offre`, `my_applications`, `status`, `statut`, `bulk_statut`

Fichier : `app/backend/apps/candidatures/viewsets.py`

Elles donnent les candidatures d'une offre, les candidatures du candidat connecté, l'état d'une candidature, la modification d'un statut et la mise à jour groupée.

#### Fonction : `post`

Fichier : `app/backend/apps/candidatures/views.py`

Elle reçoit un CV, crée une candidature puis lance l'analyse IA.

#### Fonction : `get`

Fichier : `app/backend/apps/candidatures/views.py`

Elle renvoie l'état IA d'une candidature au candidat concerné.

#### Fonctions : `get_form_kwargs`, `get_template_names`, `get_context_data`, `done`

Fichier : `app/backend/apps/candidatures/views.py`

Elles pilotent le formulaire en plusieurs étapes de candidature.

#### Fonction : `get_context_data`

Fichier : `app/backend/apps/candidatures/views.py`

Elle prépare les statistiques du dashboard candidat.

### Fonctions du module entretiens

#### Fonction : `_full_name`

Fichier : `app/backend/apps/entretiens/serializers.py`

Elle récupère le nom complet d'un utilisateur de façon sûre.

#### Fonction : `get_candidat_nom`

Fichier : `app/backend/apps/entretiens/serializers.py`

Elle affiche le nom du candidat dans les réponses API.

#### Fonction : `get_recruteur_name`

Fichier : `app/backend/apps/entretiens/serializers.py`

Elle affiche le nom du recruteur dans les réponses API.

#### Fonction : `get_offre_titre`

Fichier : `app/backend/apps/entretiens/serializers.py`

Elle récupère le titre de l'offre liée à l'entretien.

#### Fonction : `get_cv_url`

Fichier : `app/backend/apps/entretiens/serializers.py`

Elle donne l'URL du CV attaché à l'entretien si elle existe.

#### Fonction : `create`

Fichier : `app/backend/apps/entretiens/serializers.py`

Elle crée un entretien à partir de la candidature choisie.

#### Fonctions : `get_serializer_class`, `get_queryset`, `create`, `notes`, `statut`

Fichier : `app/backend/apps/entretiens/viewsets.py`

Elles choisissent le serializer, filtrent les entretiens visibles, créent un entretien, modifient les notes et changent le statut.

#### Fonction : `summarize_entretien_task`

Fichier : `app/backend/apps/entretiens/tasks.py`

Elle génère automatiquement un résumé d'entretien en arrière-plan.

#### Fonctions de vues Django classiques

Fichier : `app/backend/apps/entretiens/views.py`

Les fonctions et méthodes de ce fichier gèrent l'interface serveur classique du calendrier, des notes et de la clôture des entretiens.

### Fonctions du module évaluations

#### Fonction : `moyenne_score`

Fichier : `app/backend/apps/evaluations/models.py`

Elle calcule la moyenne des notes d'une évaluation.

#### Fonctions : `get_serializer_class`, `get_queryset`, `create`, `submit`, `pdf`

Fichier : `app/backend/apps/evaluations/viewsets.py`

Elles choisissent le serializer, filtrent les évaluations visibles, créent une évaluation, la soumettent et donnent l'accès au PDF.

#### Fonctions Django classiques

Fichier : `app/backend/apps/evaluations/views.py`

Elles gèrent la création et l'affichage classique des évaluations côté serveur.

### Fonctions du module IA

#### Fonction : `extract_cv_text`

Fichier : `app/backend/apps/ia/service.py`

Elle appelle l'extracteur de texte adapté au fichier CV.

#### Fonction : `extract_competences`

Fichier : `app/backend/apps/ia/service.py`

Elle cherche les compétences dans le texte du CV.

#### Fonction : `extract_experience`

Fichier : `app/backend/apps/ia/service.py`

Elle estime le nombre d'années d'expérience.

#### Fonction : `normalize_competences`

Fichier : `app/backend/apps/ia/service.py`

Elle nettoie ou harmonise la liste des compétences.

#### Fonction : `compute_score`

Fichier : `app/backend/apps/ia/service.py`

Elle calcule le score de compatibilité entre un CV et une offre.

#### Fonction : `generate_summary`

Fichier : `app/backend/apps/ia/service.py`

Elle produit un résumé IA du CV.

#### Fonctions : `analyze_cv`, `calculate_score`, `generate_cv_summary`

Fichier : `app/backend/apps/ia/tasks.py`

Elles lancent l'analyse du CV, calculent le score final et génèrent le résumé IA.

#### Fonctions : `extract_competences`, `extract_experience_years`, `extract_sections`

Fichier : `app/backend/apps/ia/nlp_pipeline.py`

Elles repèrent les compétences, l'expérience et les sections importantes dans le CV.

#### Fonction : `calculate_score`

Fichier : `app/backend/apps/ia/scorer.py`

Elle compare le CV et l'offre pour produire un score global détaillé.

#### Fonctions : `generate_cv_summary`, `normalize_competences`, `generate_interview_questions`, `analyze_interview_sentiment`, `generate_hiring_recommendation`, `generate_meeting_summary`, `test_connection`

Fichier : `app/backend/apps/ia/llm_client.py`

Elles utilisent un modèle de langage pour résumer, normaliser, questionner, analyser et recommander.

#### Fonctions : `_get_client`, `_call_with_retry`, `_call_api`, `_local_fallback_questions`, `_local_fallback_summary`

Fichier : `app/backend/apps/ia/llm_client.py`

Elles gèrent la connexion au service IA, les tentatives automatiques et les solutions de repli.

### Fonctions du module statistiques

#### Fonction : `generate_monthly_snapshot`

Fichier : `app/backend/apps/statistiques/tasks.py`

Elle enregistre les indicateurs du mois dans la base.

#### Méthodes : `get_funnel`, `get_delai_moyen`, `get_score_stats`, `get_top_competences`, `get_dashboard_stats`, `get_all`

Fichier : `app/backend/apps/statistiques/kpi_calculator.py`

Elles calculent les chiffres du recrutement, les délais et les top compétences.

#### Méthodes : `score_distribution`, `candidatures_timeline`, `recommendations_pie`

Fichier : `app/backend/apps/statistiques/chart_generator.py`

Elles génèrent les graphiques du tableau de bord.

#### Fonction : `dashboard_stats`

Fichier : `app/backend/apps/statistiques/viewsets.py`

Elle renvoie les indicateurs principaux du dashboard RH.

#### Fonction : `export_csv`

Fichier : `app/backend/apps/statistiques/viewsets.py`

Elle exporte certaines statistiques au format CSV.

### Fonctions du module rapports

#### Fonction : `generate`

Fichier : `app/backend/apps/rapports/pdf_generator.py`

Elle construit le PDF complet d'une évaluation.

#### Fonction : `_radar_chart`

Fichier : `app/backend/apps/rapports/pdf_generator.py`

Elle crée le graphique radar affiché dans le PDF.

#### Fonction : `generate_evaluation_pdf`

Fichier : `app/backend/apps/rapports/tasks.py`

Elle génère et sauvegarde le PDF de l'évaluation en arrière-plan.

### Fonctions du module notifications

#### Fonction : `_send_email`

Fichier : `app/backend/apps/notifications/tasks.py`

Elle envoie un email HTML et sa version texte.

#### Fonction : `_log_notif`

Fichier : `app/backend/apps/notifications/tasks.py`

Elle enregistre l'état d'une notification dans la base.

#### Fonctions : `send_activation_email`, `send_interview_notification`, `send_interview_reminders`, `send_decision_email`

Fichier : `app/backend/apps/notifications/tasks.py`

Elles envoient les emails importants du projet : activation, entretien, rappel et décision.

## 7. Explication de la logique métier

### Logique : création d'un compte candidat

Quand un candidat s'inscrit :

1. Le formulaire est validé.
2. Un utilisateur est créé avec `is_active=False`.
3. Un email d'activation est envoyé par Celery.
4. Le candidat clique sur le lien de validation.
5. Le compte passe en actif et email vérifié.

### Logique : publication d'une offre

Quand un RH crée une offre :

1. Il remplit le formulaire.
2. Les compétences sont ajoutées dans la liste.
3. L'offre est sauvegardée en brouillon ou publiée.
4. Si elle est publiée, la date de publication est enregistrée.

### Logique : candidature d'un candidat

Quand un candidat postule :

1. Il choisit une offre.
2. Il envoie son CV.
3. Le backend vérifie le fichier.
4. La candidature est créée.
5. Une tâche Celery lance l'analyse IA.
6. Le score IA et le statut sont mis à jour plus tard.

### Logique : analyse IA d'un CV

Quand la tâche `analyze_cv` démarre :

1. Le fichier CV est lu.
2. Le texte est extrait.
3. Les compétences sont recherchées.
4. L'expérience est calculée.
5. Le score de compatibilité est calculé.
6. La candidature reçoit un score et un nouveau statut.

### Logique : entretien

Quand un entretien est créé :

1. Le recruteur choisit une candidature.
2. Le backend crée l'entretien avec date, durée et type.
3. Les notes peuvent être ajoutées plus tard.
4. Le statut peut passer de planifié à en cours, terminé ou annulé.

### Logique : évaluation d'entretien

Quand l'entretien est terminé :

1. Le recruteur remplit les notes.
2. L'évaluation enregistre les scores et les commentaires.
3. Un PDF peut être généré.
4. L'évaluation peut être soumise.

### Logique : statistiques RH

Le tableau de bord RH lit les candidatures, les entretiens et les scores IA.

Il calcule :

- le volume d'activité
- le taux de conversion
- le délai moyen
- les meilleurs candidats
- les compétences les plus demandées

## 8. Flux complets importants

### Flux : lancer le programme

1. Le backend Django démarre avec `manage.py`.
2. Les routes sont chargées depuis `jobtech/urls.py`.
3. Les API sont chargées depuis `jobtech/api.py`.
4. L'interface web appelle ces API avec les services du projet.
5. Le backend répond avec les données.

### Flux : consulter une offre et postuler

1. Le candidat ouvre la liste des offres.
2. L'interface web appelle l'API des offres.
3. Le candidat ouvre le détail d'une offre.
4. Il envoie sa candidature avec son CV.
5. Le backend crée la candidature et lance l'analyse IA.

### Flux : suivre une candidature

1. Le candidat consulte ses candidatures.
2. L'interface web recharge l'état si une analyse est en cours.
3. Le candidat voit le statut, le score IA et l'étape actuelle.

### Flux : traiter les candidatures côté RH

1. Le RH consulte les offres.
2. Il choisit une offre pour voir les candidatures liées.
3. Il change un statut, lance une analyse ou planifie un entretien.

### Flux : gérer un entretien

1. Le RH ou le recruteur consulte les entretiens.
2. Il filtre par statut, ouvre la visio ou prend des notes.
3. Quand l'entretien est terminé, il crée une évaluation.

### Flux : consulter les statistiques

1. L'interface web demande les KPI au backend.
2. Le backend calcule les chiffres via `RHKPICalculator`.
3. Les résultats sont renvoyés à l'écran.

## 9. Explication des imports

Les imports servent à réutiliser du code d'un autre fichier.

Exemple simple :

```python
from apps.offres.models import Competence
```

Cette ligne veut dire : on prend la classe `Competence` qui se trouve dans le fichier `apps/offres/models.py`.

Autres exemples importants dans ce projet :

- `from rest_framework import serializers` : pour transformer les objets en JSON
- `from rest_framework import viewsets` : pour créer des APIs REST plus vite
- `from celery import shared_task` : pour déclarer une tâche en arrière-plan
- `from django.conf import settings` : pour lire la configuration du projet

Le lien avec l'interface web passe surtout par les routes API et les appels HTTP du projet, sans qu'il soit nécessaire d'entrer dans les détails du frontend ici.

## 10. Configuration du projet

### Fichier `.env`

Ce fichier contient les variables sensibles ou variables d'environnement.

Dans ce projet, `settings.py` lit un `.env` via `django-environ`, et Docker Compose peut aussi utiliser un fichier `.env` à la racine.

Variables importantes vues dans le code :

- `SECRET_KEY`
- `DEBUG`
- `ALLOWED_HOSTS`
- `DATABASE_URL`
- `REDIS_URL`
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USE_TLS`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`
- `NVIDIA_API_KEY`
- `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_ADMIN_EMAIL`

### Fichier `settings.py`

Ce fichier décide comment Django se comporte.

Pour le modifier sans casser le projet :

- change d'abord une seule valeur à la fois
- garde des valeurs de test en local
- vérifie les dépendances des autres modules

### Fichier `requirements.txt`

Il liste les bibliothèques Python.

Pour le modifier sans casser le projet :

- ajoute un package seulement s'il est vraiment utilisé
- vérifie la compatibilité Python 3.12

### Fichier `pyproject.toml`

Il règle les outils de qualité.

Pour le modifier sans casser le projet :

- ne change pas trop les règles d'un coup
- garde les formats cohérents avec le reste du code

### Fichier `Dockerfile`

Il décrit comment construire l'image Docker du backend ou du frontend selon le dossier.

### Fichier `docker-compose.yml`

Il orchestre plusieurs conteneurs ensemble.

Dans ce projet, il démarre MySQL, Redis, Django, Celery et le frontend.

Pour le modifier sans casser le projet :

- vérifie les ports exposés
- vérifie les noms de services
- vérifie les variables `DATABASE_URL` et `REDIS_URL`

## 11. Comment installer et lancer le projet

### Option locale pour le backend

```bash
cd app/backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Lancer Celery

```bash
cd app/backend
celery -A jobtech worker -l info
```

Si les tâches planifiées sont nécessaires :

```bash
cd app/backend
celery -A jobtech beat -l info
```

### Option Docker

```bash
docker-compose up --build
```

### Conseils simples

- si tu développes le backend, commence par `migrate` puis `runserver`
- si tu utilises Docker, garde les variables d'environnement cohérentes avec le code

## 12. Concepts Python utilisés dans cette codebase

### Les classes

Une classe est un plan pour créer des objets.
Ici, les classes servent à représenter un utilisateur, une offre, une candidature, un entretien, une évaluation, un résumé IA, etc.

### Les fonctions

Une fonction regroupe une action précise.
Dans ce projet, les fonctions servent à valider un fichier, calculer un score, envoyer un email, générer un PDF ou comparer deux données.

### Les dictionnaires

Un dictionnaire stocke des données sous forme clé/valeur.
Le projet les utilise souvent pour les statuts, les résultats d'API et les configurations simples.

### Les listes

Une liste sert à stocker plusieurs éléments dans un ordre donné.
On l'utilise pour les compétences, les questions IA, les résultats paginés et les graphiques.

### Les propriétés `@property`

Elles permettent d'accéder à une valeur comme si c'était un attribut, tout en calculant la valeur au besoin.

Exemples dans le projet :

- `User.get_full_name`
- `Entretien.end_time`
- `Evaluation.moyenne_score`

### Les tâches asynchrones

Le projet utilise Celery pour lancer des opérations en arrière-plan.
Cela évite de faire attendre l'utilisateur pendant une lecture de CV, un envoi d'email ou une génération de PDF.

### Les serializers Django REST Framework

Ils transforment les objets Python en JSON et vérifient aussi les données reçues.

### Les viewsets DRF

Ils regroupent dans une seule classe les actions de lecture, création, modification et suppression.

### Les mixins et middleware

Un mixin ajoute des règles de réutilisation à une vue.
Un middleware observe les requêtes et réponses globalement.

### Les échanges avec l'interface web

L'interface web récupère les données du backend via les routes API et les services du projet.

## 13. Les erreurs possibles et comment les comprendre

### Erreur : module introuvable

Cela veut dire qu'un package Python ou JavaScript manque.

Pourquoi cela arrive :

- `pip install` ou `npm install` n'a pas été fait
- une dépendance n'est pas listée dans le bon fichier

Comment corriger :

- réinstalle les dépendances
- vérifie les fichiers de dépendances du projet

### Erreur : variable d'environnement manquante

Cela veut dire que Django attend une valeur comme `SECRET_KEY` ou `DATABASE_URL` mais ne la trouve pas.

Pourquoi cela arrive :

- le fichier `.env` est absent
- la variable n'est pas définie

Comment corriger :

- crée ou complète le fichier `.env`
- vérifie les noms exacts des variables dans `settings.py`

### Erreur : problème de base de données

Cela veut dire que Django n'arrive pas à se connecter à MySQL ou SQLite.

Pourquoi cela arrive :

- la base n'est pas lancée
- `DATABASE_URL` est incorrect
- les identifiants sont faux

Comment corriger :

- démarre la base
- vérifie l'URL de connexion
- relance les migrations

### Erreur : problème de migration

Cela veut dire que la structure de la base ne correspond pas aux modèles.

Pourquoi cela arrive :

- un modèle a changé
- les migrations n'ont pas été appliquées

Comment corriger :

- lance `python manage.py migrate`
- si besoin, crée une nouvelle migration

### Erreur : problème d'import Python

Cela veut dire qu'un fichier essaie d'importer une classe ou une fonction qui n'existe pas ou pas encore.

Pourquoi cela arrive :

- erreur de chemin
- fichier déplacé
- import circulaire

Comment corriger :

- vérifie le nom du fichier et de la classe
- regarde les imports voisins

### Erreur : fichier CV refusé

Cela veut dire que le fichier envoyé n'est pas accepté.

Pourquoi cela arrive :

- ce n'est pas un PDF ou un DOCX
- le fichier dépasse 5 Mo

Comment corriger :

- convertis le fichier dans un format accepté
- compresse le fichier si besoin

### Erreur : analyse IA indisponible

Cela veut dire que l'API IA n'est pas configurée ou que le service externe ne répond pas.

Pourquoi cela arrive :

- `NVIDIA_API_KEY` est vide
- l'API a une erreur ou une limite d'utilisation

Comment corriger :

- configure la clé API
- vérifie les logs Celery
- utilise le mode de repli local si disponible

### Erreur : modèle spaCy manquant

Cela veut dire que le modèle `fr_core_news_lg` n'est pas installé.

Pourquoi cela arrive :

- spaCy n'a pas encore téléchargé le modèle

Comment corriger :

- installe le modèle spaCy
- relance le traitement du CV

### Erreur : dépendance système manquante pour OCR ou PDF

Cela veut dire qu'un outil externe comme Tesseract ou Poppler manque.

Pourquoi cela arrive :

- OCR activé mais outils système absents

Comment corriger :

- installe les outils système nécessaires
- désactive l'OCR si tu n'en as pas besoin

## 14. Comment modifier le projet sans tout casser

### Ajouter une nouvelle fonctionnalité backend

1. Trouve le bon dossier métier dans `app/backend/apps/`.
2. Ajoute ou modifie le modèle si la donnée doit être stockée.
3. Ajoute un serializer si la donnée passe par l'API.
4. Ajoute ou modifie la viewset ou la vue.
5. Branche la route dans `urls.py` ou `jobtech/api.py`.
6. Ajoute un test si possible.

### Ajouter un nouveau modèle

1. Crée le modèle dans le bon `models.py`.
2. Génère une migration.
3. Applique la migration.
4. Ajoute le serializer et l'admin si nécessaire.

### Modifier la logique métier

1. Regarde d'abord le modèle.
2. Regarde ensuite le serializer.
3. Regarde la viewset ou la tâche Celery.
4. Vérifie seulement que l'interface web appelle la bonne route API.

### Liaison avec l'interface web

Si tu ajoutes une nouvelle donnée ou une nouvelle action côté backend, il faut aussi exposer la route API correspondante pour que l'interface web puisse l'utiliser.

### Fichiers à toucher avec prudence

- `settings.py`
- `jobtech/urls.py`
- `jobtech/api.py`
- la liaison web/backend

Ces fichiers sont centraux. Une petite erreur peut casser beaucoup de choses.

### Comment tester après une modification

1. Lance les tests du backend si tu as modifié Python.
2. Lance les tests du backend ou vérifie l'appel API si tu as modifié une route utilisée par l'interface web.
3. Vérifie les erreurs dans le terminal.
4. Teste le flux réel dans le navigateur.

### Comment lire les erreurs du terminal

Commence par regarder :

- le premier message d'erreur utile
- le fichier indiqué
- la ligne indiquée
- si le problème vient d'un import, d'une variable, d'une migration ou d'une API

## 15. Résumé final très simple

En résumé, ce projet fonctionne comme ceci :

1. Le candidat ou le RH utilise une interface web reliée au backend.
2. L'interface appelle les routes API du projet.
3. Django stocke les données, applique les règles et lance des tâches Celery si besoin.
4. L'IA, les statistiques et les PDF complètent le recrutement.

Si tu es débutant, commence par lire ces fichiers dans cet ordre :

1. `README.md`
2. `app/backend/jobtech/settings.py`
3. `app/backend/jobtech/api.py`
4. `app/backend/apps/accounts/models.py`
5. `app/backend/apps/offres/models.py`
6. L'interface web est reliée au backend par les routes API et les services HTTP.

Pourquoi cet ordre ?

- `README.md` donne le contexte général
- `settings.py` montre la configuration du backend
- `api.py` montre les grandes routes
- les modèles expliquent les données réelles du projet
- la liaison web/backend montre comment l'interface parle au backend

Le plus important à retenir pour un débutant : ce projet est organisé en petits blocs. Chaque bloc a un rôle précis. Si tu lis les fichiers dans le bon ordre, tu comprends beaucoup plus vite comment tout fonctionne ensemble.