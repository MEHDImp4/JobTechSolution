# Tests E2E Playwright - JobTech

Cette suite de tests automatise la vérification de bout en bout (End-to-End) de l'application JobTech.

## Prérequis

1. Node.js 18+
2. Un backend JobTech fonctionnel et accessible.
3. Les navigateurs Playwright installés.

## Installation

Dans le dossier `app/frontend/` :
```bash
npm install
npx playwright install
```

## Configuration

Par défaut, les tests pointent vers `http://localhost:5173`.
Vous pouvez surcharger l'URL via `.env.test` dans `app/frontend/` :
```env
E2E_BASE_URL=http://localhost:5173
```

## Comptes de Test

Les tests s'attendent à ce que certains comptes existent en base de données.
Vous pouvez utiliser le script de seed du backend :
```bash
python manage.py seed_data
```
Comptes utilisés par défaut :
- Candidat : `candidat@jobtech.com` / `password123`
- RH : `rh@jobtech.com` / `password123`

## Lancer les tests

```bash
# Lancer tous les tests en mode headless
npm run test:e2e

# Lancer les tests avec l'interface graphique (UI Mode)
npm run test:e2e:ui

# Voir le rapport HTML du dernier run
npm run test:e2e:report

# Générer des tests via l'enregistreur
npx playwright codegen http://localhost:5173
```
