



## 1 / 5


## CAHIER DES CHARGES

Nom / Code projet JobTech Solutions  Système de gestion et suivi des entretiens


Référence EMSI INNOVATION
Soutenir la digitalisation des processus internes et renforcer l’efficacité organisationnelle.
Enseignant  O. OUADOUD/R. Filali/F. Ebobiss


module/filière Outils de développements

## Historique
## Version Auteur Description Date
001 OUADOUD Version initiale 02/03/2026

Contexte du projet
Contexte du projet
Les entretiens annuels sont un outil clé pour le suivi des performances des employés et l’évolution
de leur carrière. Cependant, leur gestion est souvent manuelle et non standardisée, ce qui entraîne
des retards, un manque de suivi et une absence d’historique accessible.
JobTech Solutions   est un système efficace pour organiser, suivre et optimiser les entretiens.
Actuellement, la gestion est fragmentée entre plusieurs outils, ce qui réduit la visibilité sur les
compétences acquises et les besoins en entretiens.
Enjeux du projet
- Développer une application web en Python pour centraliser et automatiser la gestion des entretiens.
- Intégrer un framework Python (Django).
## Délais
## Délais
Les grandes phases du projet communiquées lors du démarrage du projet ont été confirmées :
## Exemple :
## Jalon Chantier Date
## (semaine)
## Description
M1 Initialisation 2 Analyse des besoins et rédaction des spécifications : définir un
cahier des charges technique
M2 Conception 2 Conception technique et allocation des tâches
M3 Réalisation  5 Développement de l’application
M4 Tests et
valisation
2 Phase de Tests unitaires et corrections
M5 Déploiment 1 (Livrable finale) Mise en production, documentation et
formation
Ainsi que le macro-planning : (Gantt)
NB : Le nouveau système doit être disponible avant la clôture de fin d’année.



## 2 / 5

Objectifs du projet
Objectifs du projet
- Standardiser et centraliser la gestion des entretiens.
- Automatiser la planification et les rappels.
- Assurer un suivi des objectifs et des performances.
- Fournir un historique accessible des entretiens passés.
Indicateurs de Performance :
- Augmentation du taux d’entretiens réalisés (+30%).
- Automatisation des rappels d’entretiens (>90%).
- Satisfaction des utilisateurs (>85%)
Périmètre du projet
Périmètre du projet
- En quoi consiste-t-il ?  Gestion et suivi des entretiens.
- Où commence-t-il et où s’arrête-t-il ? De l’analyse des besoins à la mise en production et support.
- Qui est impliqué ? Les parties prenantes incluent :
o Sponsor du projet,
o équipe de développement,
o managers
o candidats
-  Qui ne sera pas impliqué ? Les Personnes sans relation avec les entretiens.
- Bénéficiaires principaux ? Candidats, managers et service RH.
- Personnes extérieures à l’entreprise les candidats.
- Limites géographiques ? Projet limité à l’organisation.
## Hypothèses :
- Disponibilité des parties prenantes : Le sponsor du projet, ainsi que l’équipe chargée de la gestion
des entretiens, participent activement à chaque phase
- Le contact et le suivi
- Ressources matérielles et logicielles disponibles : Accès à des serveurs de stockage et licences
nécessaires.
## Contraintes :
- Prérequis : les étudiants doivent maitriser la modélisation UML, la programmation html /css/ JS et les
SGBD relationnelle
Aspects fonctionnels
Description fonctionnelle



## 3 / 5

- Planification des entretiens
- Automatisation de la planification et des rappels.
- Notifications pour managers et candidats.
- Gestion des objectifs des participants
- Suivi des objectifs fixés lors des entretiens.
- Comparaison entre candidats (par un pourcentage)
- Prise de notes en temps réel
- Formulaire d’évaluation structuré (compétences, communication, motivation)
- Ajout de commentaires et recommandations
- Gestion des Utilisateurs et Rôles
- Rôles : Recruteur, Responsable RH, Candidat, Administrateur
- Accès et permissions selon le rôle
- Archivage des entretiens
- Stockage et accès aux anciens entretiens.
- Historique des performances des employés.
- Reporting et évaluation
- Export des rapports personnalisés en PDF/Excel.
- Statistiques sur l’évolution des performances.
- Création et Gestion des Offres d’Emploi
- Ajout, modification, suppression des offres d’emploi
- Informations : titre, description, compétences requises, expérience, type de contrat, salaire estimé
- Gestion du statut des offres (ouverte, en cours, clôturée)
- Soumission et Suivi des Candidatures
- Postulation en ligne avec CV et formulaire détaillé
- Tableau de bord des candidatures (en attente, en cours, présélectionné, rejeté)
- Notifications automatiques pour les candidats
## *********************IA***********************
- Analyse Prédictive des Candidats
- IA attribue un score de pertinence pour chaque candidat
- Comparaison entre les compétences du candidat et les exigences du poste
- Filtrage et tri des candidats selon leur compatibilité
-  Extraction et Analyse Automatisée des CV
- IA extrait : nom, expérience, formation, compétences, certifications
- Détection des incohérences et normalisation des données
- Matching Automatique des Candidats avec les Offres
- Comparaison automatique des CV avec les offres



## 4 / 5

- Recommandation des meilleurs candidats pour chaque offre
- Ajustement manuel des critères par le recruteur
- Débriefing et Prise de Décision
- Comparaison des candidats sur la base des scores et entretiens
- IA recommande les profils les plus adaptés
- Génération de rapports détaillés

## *********************Extensions Modernes (Ajoutées)***********************
- **Interface Adaptive (Dark Mode)**
    - Support du mode sombre et clair basé sur les préférences système ou choix manuel.
    - Persistance du choix du thème dès la page de connexion.
- **Support PWA (Progressive Web App)**
    - Installation de l'application sur mobile et desktop.
    - Support des notifications Push pour les rappels d'entretiens.
    - Mode déconnecté partiel pour la consultation des offres.
- **Visioconférence Intégrée**
    - Support des entretiens vidéo directement dans l'application.
    - Pas besoin d'outils tiers (intégration via WebRTC ou service dédié).
- **Audit de Conformité Automatisé**
    - Script de vérification en temps réel de la conformité au cahier des charges.
    - Génération de preuves d'audit pour les KPIs.
Chaque fonctionnalité doit inclure :
- Création, modification et suppression des profils.
- Informations personnelles : nom, prénom, date de naissance, adresse, contact, etc.
- Détails professionnels des managers : poste, date d’embauche, numéro de contrat, service, etc.
- Définir les différents niveaux d’accès (administrateur, managers, participants (candidat)).
- Traçabilité des actions utilisateurs.
- Rapports personnalisés sur la l’effectif des inscriptions, taux de réussite, etc.
- Export des données en divers formats (PDF, Excel, etc.).
Aspects techniques
Contraintes techniques
- Le système sera développé avec :
o Python 3 ainsi que sa Framework Django
o L’architecture MVC.
o Une base de données MySQL.
Outils supplémentaires : Tkinter pour les graphiques, PIL (Pillow) pour  la manipulation et traitement
d'images (redimensionnement, filtres, etc.), Matplotlib pour tracer des graphes simples et ReportLab
pour créer des documents PDF complexes (textes, images, graphiques)...
o NLP (Traitement du Langage Naturel) : SpaCy, BERT pour analyser les évaluations et feedbacks.
o Vision par Ordinateur : OpenCV ou TensorFlow pour l’analyse des images
o Machine Learning : Scikit-learn, TensorFlow pour prédire les performances et recommandations de
carrière.
- L’application doit respecter des normes de sécurité strictes (cryptage des données sensibles (SHA, md5), gestion
des sessions ...).
## Ressources
## Ressources
- Ressources humaines :
- 1 Chef de projet (responsable des décisions stratégiques).
## - 2 Développeurs Java (backend/frontend).
- 1 Designer UI/UX.
## - 1 Testeur.

- Matériels et logiciels :
- Serveur de développement et de production.
- VS code.
- Système de contrôle de version : Git.
- Responsabilités et rôles




## 5 / 5


## Budget
- Coûts de développement : 10,000 €.
- Licences logicielles : 2,000 €.
- Coûts de maintenance annuelle : 3,000 €.
- Matériels et serveurs : 5,000 €.
- Expérience  acquise :  Les  participants  (étudiants,  enseignants)  développeront  des  compétences
techniques avancées en Python : Django, et d'autres outils de développement logiciel.
- Compétences  acquises  : La  réalisation  des  livrables,  comme  une  application  fonctionnelle,  enrichira
les compétences en gestion de projet, analyse des besoins, et résolution de problèmes techniques.
- Valeur académique : Le projet renforcera la capacité des étudiants à appliquer des concepts théoriques
dans un contexte pratique, augmentant ainsi leur employabilité.
- Réputation institutionnelle : Le succès de ce projet renforcera l'image de l'établissement comme un
acteur clé dans l'innovation technologique.
- Contributions pédagogiques : Les résultats du projet pourront servir de support pédagogique pour les
futures promotions.


