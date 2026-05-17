# Explication simple du projet

Ce document est fait pour une presentation rapide.
Le but est de comprendre le strict minimum du projet.

## 1. Le projet fait quoi ?

JobTech Solutions est une application de gestion de recrutement.

Elle permet de :
- gerer les utilisateurs et les roles
- gerer les offres d'emploi
- recevoir les candidatures
- planifier les entretiens
- noter les candidats
- voir des statistiques simples
- utiliser une IA simple pour lire un CV et calculer un score

## 2. Les 2 parties du projet

Le projet a 2 parties :

1. `app/backend/`
   C'est le serveur Django.
   Il contient la logique metier et la base de donnees.

2. `app/frontend/`
   C'est l'interface React.
   Il affiche les pages et appelle le backend.

## 3. Les fichiers les plus importants

### Racine du projet

- `README.md`
  Resume rapide du projet et des commandes utiles.

- `docker-compose.yml`
  Lance le projet avec Docker.

- `EXPLICATION_CODEBASE_DEBUTANT.md`
  Le fichier que tu lis maintenant.

### Backend Django

- `app/backend/manage.py`
  Fichier principal pour lancer Django.
  Exemples :
  `python manage.py runserver`
  `python manage.py migrate`
  `python manage.py test`

- `app/backend/jobtech/settings.py`
  Configuration Django.
  Base de donnees, apps installees, auth, fichiers media.

- `app/backend/jobtech/urls.py`
  Relie les routes principales du backend.

- `app/backend/requirements.txt`
  Liste des bibliotheques Python necessaires.

## 4. Les apps backend a connaitre

### `app/backend/apps/accounts/`

Gere les utilisateurs.

Fichiers utiles :
- `models.py` : modele utilisateur et roles
- `serializers.py` : transformation JSON
- `views.py` : register, login, logout, profile
- `urls.py` : routes de comptes
- `admin.py` : admin Django

### `app/backend/apps/offres/`

Gere les offres d'emploi.

Fichiers utiles :
- `models.py` : offre
- `serializers.py` : JSON des offres
- `views.py` : CRUD des offres
- `urls.py` : routes des offres

### `app/backend/apps/candidatures/`

Gere les candidatures.

Fichiers utiles :
- `models.py` : candidature
- `serializers.py` : JSON des candidatures
- `views.py` : postuler et suivre une candidature
- `ai.py` : IA simple pour lire le CV et calculer un score
- `urls.py` : routes des candidatures

### `app/backend/apps/entretiens/`

Gere les entretiens.

Fichiers utiles :
- `models.py` : entretien
- `serializers.py` : JSON des entretiens
- `views.py` : creation, modification, consultation
- `urls.py` : routes des entretiens

### `app/backend/apps/rapports/`

Gere les statistiques simples.

Fichiers utiles :
- `views.py` : statistiques + export
- `urls.py` : routes de reporting

## 5. Comment les donnees circulent ?

Le chemin est simple :

1. le frontend envoie une requete
2. `urls.py` choisit la bonne vue
3. `views.py` traite la demande
4. `serializers.py` valide ou prepare les donnees
5. `models.py` lit ou ecrit dans la base
6. la reponse JSON repart vers le frontend

## 6. Exemple tres simple

### Exemple : creer une offre

1. le frontend envoie un `POST /jobs/`
2. la vue dans `offres/views.py` recoit la requete
3. le serializer verifie les champs
4. le modele `Offre` est enregistre
5. Django renvoie l'offre creee

### Exemple : postuler

1. le candidat envoie son CV
2. la vue dans `candidatures/views.py` cree la candidature
3. `candidatures/ai.py` lit le CV
4. l'IA simple calcule un score
5. la candidature est mise a jour

### Exemple : planifier un entretien

1. RH ou recruteur envoie les infos
2. la vue dans `entretiens/views.py` cree l'entretien
3. l'entretien apparait ensuite dans la liste

## 7. L'IA, en version simple

Le projet ne fait pas une IA compliquee.

Le fichier important est :
- `app/backend/apps/candidatures/ai.py`

Il fait 3 choses :
- lire le texte d'un PDF ou DOCX
- chercher des competences dans ce texte
- calculer un score selon les competences demandees par l'offre

Donc l'idee a dire demain est simple :

"L'IA compare les competences detectees dans le CV avec les competences demandees dans l'offre, puis elle calcule un pourcentage."

## 8. Les roles

Les roles sont simples :

- `ADMIN` : peut tout faire
- `RH` : gere les offres, candidatures, entretiens, rapports
- `RECRUTEUR` : suit les candidatures et les entretiens
- `CANDIDAT` : voit les offres et postule
- `MANAGER` : consulte les entretiens et evaluations

## 9. Les routes a retenir

### Comptes
- `/accounts/register/`
- `/accounts/login/`
- `/accounts/logout/`
- `/accounts/profile/`

### Offres
- `/jobs/`
- `/jobs/<id>/`

### Candidatures
- `/applications/`
- `/applications/<id>/`

### Entretiens
- `/interviews/`
- `/interviews/<id>/`

### Rapports
- `/reports/stats/`
- `/reports/export/pdf/`
- `/reports/export/excel/`

## 10. Ce que tu peux dire a la prof

Si tu veux une explication simple a l'oral :

"Le projet est decoupe en 4 apps principales cote backend : accounts, offres, candidatures et entretiens, plus une petite partie rapports. Chaque app contient surtout un modele, un serializer, une vue et des urls. Le frontend appelle ces routes pour afficher les offres, les candidatures et les entretiens. L'IA est volontairement simple : elle lit le CV et calcule un score de compatibilite."

## 11. Ordre de lecture conseille

Si tu veux relire vite avant demain :

1. `README.md`
2. `app/backend/jobtech/settings.py`
3. `app/backend/jobtech/urls.py`
4. `app/backend/apps/accounts/views.py`
5. `app/backend/apps/offres/views.py`
6. `app/backend/apps/candidatures/views.py`
7. `app/backend/apps/candidatures/ai.py`
8. `app/backend/apps/entretiens/views.py`
9. `app/backend/apps/rapports/views.py`

## 12. Resume final

Le plus important a retenir :

- `settings.py` configure le projet
- `urls.py` dirige les routes
- `models.py` definit les donnees
- `serializers.py` gere les donnees JSON
- `views.py` contient la logique
- `ai.py` fait le score simple des CV

Si tu comprends ca, tu comprends deja l'essentiel du backend.
