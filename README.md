# JobTech - Application de Gestion des Recrutements

## Presentation du Projet

JobTech est une application web complete de gestion du processus de recrutement, developpee dans le cadre du projet de fin d'etude. L'application permet aux entreprises de gerer les offres d'emploi, traiter les candidatures, planifier des entretiens et evaluer les candidats avec l'aide de l'intelligence artificielle.

## Architecture Technique

L'application est constituee de deux parties distinctes:

### Backend (Django/Python)

Le backend est developpe avec Django et comprend les composants suivants:

- **Framework**: Django 5.x avec Python 3.12
- **API**: Django REST Framework (DRF) pour les endpoints REST
- **Base de donnees**: PostgreSQL (configurable pour SQLite en developpement)
- **Taches asynchrones**: Celery avec Redis pour le traitement des operations lourdes
- **IA/NLP**: Integration de modeles de language pour l'analyse des CV

#### Applications Django

L'application backend est organisee en 9 modules distincts:

1. **accounts** - Gestion des utilisateurs, authentification, RBAC (Role-Based Access Control)
2. **offres** - Gestion des offres d'emploi (CRUD, recherche, filtres)
3. **candidatures** - Traitement des postulations et upload des CV
4. **entretiens** - Planification et gestion des entretiens
5. **evaluations** - Systeme d'evaluation des candidats
6. **statistiques** - Tableaux de bord et indicateurs KPI
7. **rapports** - Generation de rapports PDF
8. **notifications** - Envoi d'emails automatises
9. **ia** - Pipeline NLP et analyse de CV par IA

### Frontend (React/TypeScript)

Le frontend est une application SPA (Single Page Application) developpee avec:

- **Framework**: React 18.x avec TypeScript
- **Build tool**: Vite
- **Gestion d'etat**: Zustand
- **Appels API**: Axios
- **Tests e2e**: Playwright
- **PWA**: Configuration pour installation hors ligne

## Fonctionnalites Principales

### Pour les Candidats

- Creation de compte et activation par email
- Consultation des offres d'emploi
- Postulation a une offre avec upload de CV
- Suivi du statut de ses candidatures

### Pour les Recruteurs (RH)

- Gestion des offres d'emploi (creation, modification, publication)
- Consultation des candidatures recues
- Tableau de bord Kanban pour le suivi des postulations
- Planification d'entretiens avec calendrier
- Evaluation des candidats avec systeme de notation
- Generations de rapports PDF
- Statistiques et graphiques analytiques

### Fonctionnalites Avancees

- Analyse automatique des CV par intelligence artificielle
- Scoring des candidats base sur la compatibilite avec l'offre
- Generations de questions d'entretien par IA
- Notifications par email automatisees
- Salle video pour les entretiens a distance (integration Jitsi)
- Application mobile (PWA)

## Installation et Configuration

### Prerequisites

- Python 3.12+
- Node.js 18+
- PostgreSQL (optionnel, SQLite pour developpement)
- Redis (pour Celery)

### Configuration du Backend

1. Creation de l'environnement virtuel:
```bash
cd app/backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows
```

2. Installation des dependances:
```bash
pip install -r requirements.txt
```

3. Configuration des variables d'environnement:
```bash
cp .env.example .env
# Editer .env avec les parametres desired
```

4. Migration de la base de donnees:
```bash
python manage.py migrate
```

5. Creation d'un superutilisateur:
```bash
python manage.py createsuperuser
```

6. Lancement du serveur:
```bash
python manage.py runserver
```

Pour Celery (taches asynchrones):
```bash
celery -A jobtech worker -l info
```

### Configuration du Frontend

1. Installation des dependances:
```bash
cd app/frontend
npm install
```

2. Lancement du serveur de developpement:
```bash
npm run dev
```

### Configuration avec Docker

L'application peut egalement etre lancee avec Docker Compose:
```bash
docker compose up --build
```

Cela demarre automatiquement tous les services necessaires (backend, frontend, PostgreSQL, Redis).

## Structure du Projet

```
JobTechSolution/
├── app/
│   ├── backend/
│   │   ├── apps/              # Modules Django
│   │   │   ├── accounts/
│   │   │   ├── offres/
│   │   │   ├── candidatures/
│   │   │   ├── entretiens/
│   │   │   ├── evaluations/
│   │   │   ├── statistiques/
│   │   │   ├── rapports/
│   │   │   ├── notifications/
│   │   │   └── ia/
│   │   ├── jobtech/           # Configuration Django
│   │   ├── static/            # Fichiers statiques
│   │   ├── templates/         # Templates HTML
│   │   └── requirements.txt
│   └── frontend/
│       ├── src/
│       │   ├── components/    # Composants React
│       │   ├── pages/         # Pages de l'application
│       │   ├── services/      # Services API
│       │   ├── stores/        # Gestion d'etat
│       │   └── types/         # Types TypeScript
│       └── package.json
├── assets/                    # Documentation
├── docker-compose.yml
└── README.md
```

## Technologies Utilisees

### Backend
- Django 5.x
- Django REST Framework
- Celery
- PostgreSQL / SQLite
- ReportLab (PDF)
- Matplotlib (graphiques)
- scikit-learn (TF-IDF)

### Frontend
- React 18
- TypeScript
- Vite
- Zustand
- Axios
- Playwright
- FullCalendar

### Infrastructure
- Docker / Docker Compose
- GitHub Actions (CI/CD)
- Redis

## Equipe

Projet developpe par un groupe d'etudiants dans le cadre du projet de fin d'etude.

## Licence

Ce projet est destine a des fins educatives.