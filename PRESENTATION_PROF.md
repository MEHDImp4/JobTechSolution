# Présentation JobTechSolution — Checklist Prof

## Ordre de présentation recommandé

### 1. Architecture générale (1 min)
- Stack : Django REST + React + Vite + PostgreSQL
- 5 modules backend : accounts, offres, candidatures, entretiens, rapports
- RBAC : 4 rôles actifs (Admin, RH, Recruteur, Candidat)

---

### 2. Authentification & Rôles
- [ ] S'inscrire en tant que Candidat
- [ ] Se connecter (email ou username)
- [ ] Voir et modifier son profil
- [ ] Changer de compte pour montrer le rôle RH/Admin

---

### 3. Gestion des offres (côté RH)
- [ ] Créer une offre (titre, description, compétences requises, type contrat : CDI/CDD/Stage/Freelance, salaire)
- [ ] Modifier une offre
- [ ] Fermer/rouvrir une offre (toggle statut)
- [ ] Supprimer une offre

---

### 4. Dépôt de candidature (côté Candidat)
- [ ] Parcourir les offres ouvertes (les candidats ne voient que les offres ouvertes)
- [ ] Voir le détail d'une offre
- [ ] Postuler : uploader un CV (PDF/DOC/DOCX), lettre de motivation, URL LinkedIn, années d'expérience
- [ ] "Mes candidatures" : suivre ses statuts avec un stepper de progression

---

### 5. Analyse automatique du CV — point fort à mettre en avant
> Ce n'est pas un LLM externe — c'est un algorithme de matching par mots-clés intégré.

Dès qu'une candidature est soumise :
- [ ] Extraction du texte brut du CV (PDF via pypdf, DOCX via zipfile/XML)
- [ ] Calcul d'un **score de matching** (0-100) : compétences de l'offre détectées dans le texte du CV
- [ ] Extraction automatique de l'email et du téléphone par regex
- [ ] Liste des compétences trouvées dans le CV
- [ ] Ouvrir le modal **Analyse CV** depuis la liste des candidatures pour montrer tout ça

---

### 6. Gestion des candidatures (côté RH)
- [ ] Vue split : liste des postes à gauche, candidatures du poste à droite
- [ ] Recherche et filtre des postes (y compris clôturés)
- [ ] **Vue tableau** : score de matching cliquable → ouvre le modal d'analyse, lien CV, bouton "Gérer"
- [ ] **Sélection multiple** + actions groupées (bulk) : En cours / Présélection / Rejeter
- [ ] **Vue Kanban** (toggle) : drag & drop entre 5 colonnes (En attente → En cours → Présélectionné → Accepté → Rejeté)
- [ ] Depuis le modal "Gérer" → statut Présélectionné → bouton "Planifier un entretien"

---

### 7. Entretiens
- [ ] Liste des entretiens avec date, heure, durée, lieu, recruteur assigné
- [ ] Filtre par statut : Tous / Planifiés / Terminés / Annulés
- [ ] Modifier le statut via un select inline (Planifié → Terminé ou Annulé)
- [ ] Bouton **Notes** : modal avec auto-save (1.5s de délai)
- [ ] Bouton **Évaluer** (apparaît uniquement quand statut = Terminé)

---

### 8. Évaluations
- [ ] Créer une évaluation post-entretien via le modal
- [ ] Notation 5 étoiles sur 5 dimensions : Compétences, Communication, Motivation, Adaptabilité, Culture fit
- [ ] Champ commentaires
- [ ] Recommandation : Retenu / À reconsidérer / Non retenu
- [ ] Page Évaluations : cartes récapitulatives avec les étoiles et le badge de recommandation

---

### 9. Tableau de bord & Statistiques (RH)

**Dashboard (/dashboard)**
- [ ] 4 KPI cards : Offres actives, Candidatures, Entretiens, Recrutements réussis
- [ ] Top 5 candidats par score de matching

**Statistiques (/statistiques)**
- [ ] Filtre par période : 7j / 30j / 90j / 1 an
- [ ] 3 KPIs : Taux de conversion, Délai moyen, Score IA moyen
- [ ] Graphique : Entonnoir de recrutement (barre horizontale)
- [ ] Graphique : Top compétences demandées (barre verticale)
- [ ] **Export CSV** (un clic → téléchargement direct)

---

### 10. Administration (Admin uniquement)
- [ ] Gestion des utilisateurs : liste, changer le rôle, activer/désactiver
- [ ] **Audit Log** : traçabilité complète de toutes les actions (utilisateur, action, données avant/après, IP, endpoint, timestamp)

---

### 11. UX / Design
- [ ] Mode sombre / clair / système (toggle en haut à droite)
- [ ] Design responsive (mobile-friendly, Kanban scroll horizontal)
- [ ] Animations Framer Motion sur les cartes Kanban
- [ ] Notifications toast (succès / erreur)
- [ ] États de chargement, vide, erreur sur toutes les pages

---

## Ce qu'il ne faut absolument pas oublier
1. **L'analyse automatique du CV avec score de matching** — montrer le modal avec le score coloré + compétences détectées
2. **Le Kanban drag & drop** — très visuel, montrer le glisser-déposer entre colonnes
3. **L'Audit Log** — montre la rigueur sécurité/traçabilité
4. **La sélection multiple + actions groupées** dans la liste des candidatures
5. **Les 4 rôles distincts** avec des accès complètement différents (RBAC)
