# Résumé de session — Gestionnaire de tâches serverless

**Date :** 1er mai 2026

---

## Objectif

Déployer une application fullstack de gestion de tâches avec un backend AWS serverless (Lambda + DynamoDB) piloté par Terraform, et un frontend Vite/React déployé sur Vercel.

---

## Ce qui a été réalisé

### 1. Spécifications (CLAUDE.md)

Réécriture complète des spécifications initiales (7 lignes vagues) en un document technique structuré couvrant :
- Architecture globale (diagramme)
- Infrastructure Terraform avec contraintes IAM précises
- Modèle de données DynamoDB complet
- Routes HTTP de l'API
- Stack frontend et structure des fichiers
- Procédure de déploiement et tests

---

### 2. Backend — AWS Lambda

**Fichiers créés :** `lambda/index.js`, `lambda/handlers/tasks.js`, `lambda/handlers/health.js`

- Runtime : Node.js 20.x, modules ES (`type: module`)
- SDK AWS v3 (`@aws-sdk/client-dynamodb`, `@aws-sdk/lib-dynamodb`)
- Routing interne dans le handler (sans framework)
- CORS configuré sur toutes les réponses
- 6 endpoints opérationnels :

| Méthode | Route | Action |
|---------|-------|--------|
| GET | `/health` | Santé du service |
| GET | `/tasks` | Lister les tâches (tri par date) |
| POST | `/tasks` | Créer une tâche (UUID v4) |
| GET | `/tasks/{id}` | Obtenir une tâche |
| PUT | `/tasks/{id}` | Mettre à jour une tâche |
| DELETE | `/tasks/{id}` | Supprimer une tâche |

---

### 3. Infrastructure — Terraform

**Fichiers créés :** `terraform/main.tf`, `variables.tf`, `dynamodb.tf`, `lambda.tf`, `api_gateway.tf`, `outputs.tf`

**Ressources déployées (11 au total) :**
- `aws_dynamodb_table` — table `tasks-dev`, billing on-demand, GSI `status-createdAt-index`
- `aws_lambda_function` — `task-manager-dev-api`, 256 MB, timeout 10s
- `aws_iam_role` + policies — permissions DynamoDB minimales + CloudWatch logs
- `aws_apigatewayv2_api` — HTTP API avec CORS `*`
- `aws_apigatewayv2_stage` / `integration` / `route` — route `$default` sans authentification
- `aws_lambda_permission` — autorisation invocation depuis API Gateway
- `null_resource` — installation des dépendances npm avant packaging

**Commande utilisée :**
```bash
terraform apply -auto-approve   # déploiement
terraform destroy -auto-approve # nettoyage en fin de session
```

**API URL déployée :** `https://ygvbe02qzl.execute-api.eu-west-1.amazonaws.com`

---

### 4. Tests de l'API

Tous les endpoints testés avec `curl` après déploiement Terraform — résultats corrects sur les 5 opérations (health, create, list, get, update, delete).

---

### 5. Frontend — Vite / React / TypeScript

**Stack :** Vite 8, React 18, TypeScript, TailwindCSS v4, TanStack Query, React Hook Form, Zod, Lucide React

**Fichiers créés :**
- `src/types/task.ts` — types TypeScript (`Task`, `TaskStatus`, `TaskPriority`)
- `src/api/tasks.ts` — client fetch vers l'API Lambda
- `src/hooks/useTasks.ts` — hooks TanStack Query (list, create, update, delete)
- `src/components/StatusBadge.tsx` — badge coloré par statut
- `src/components/PriorityDot.tsx` — indicateur de priorité
- `src/components/TaskCard.tsx` — carte avec édition inline et suppression
- `src/components/TaskForm.tsx` — formulaire modal (création/édition) avec validation Zod
- `src/components/TaskFilters.tsx` — filtres par statut, priorité et recherche texte
- `src/components/TaskList.tsx` — grille responsive avec skeleton loading
- `src/App.tsx` — dashboard complet avec stats, filtres et header

**Fonctionnalités :**
- Tableau de bord avec 4 compteurs (total, à faire, en cours, terminées)
- Grille responsive (1 / 2 / 3 colonnes)
- Création via modal avec validation
- Édition et suppression par carte
- Alerte visuelle si tâche en retard
- Recherche textuelle côté client
- Skeleton loading pendant le fetch
- Bouton actualisation avec icône animée

**Build :** `tsc -b && vite build` — 0 erreur TypeScript, bundle 328 KB

---

### 6. Déploiement GitHub + Vercel

**GitHub :**
- Repo créé : [github.com/ljacques99/task-manager-serverless](https://github.com/ljacques99/task-manager-serverless)
- `.gitignore` configuré (exclusion node_modules, tfstate, .env.local, lambda-bundle.zip)
- Commit initial : 42 fichiers

**Vercel :**
- Authentification via token Full Account (révocable après déploiement)
- Projet lié : `ljacques99s-projects/task-manager-serverless`
- Variable d'environnement `VITE_API_URL` configurée en production
- **URL de production :** [task-manager-serverless-gamma.vercel.app](https://task-manager-serverless-gamma.vercel.app)
- Build Vercel : Node.js, Vite détecté automatiquement, `dist/` déployé

---

### 7. Nettoyage

`terraform destroy -auto-approve` — 11 ressources AWS supprimées.  
Le frontend Vercel reste actif (statique, gratuit). L'API ne répond plus jusqu'au prochain `terraform apply`.

---

## Points techniques notables

- **Modules ES dans Lambda** : `"type": "module"` dans `package.json` + handler `index.handler` — compatible Node.js 20.x
- **Packaging Terraform** : `null_resource` + `local-exec` pour `npm install` avant le `archive_file`, évite d'inclure `node_modules` en dev
- **TailwindCSS v4** : plugin `@tailwindcss/vite` à la place de PostCSS — pas de `tailwind.config.js` nécessaire
- **Token Vercel** : le plugin OAuth Claude ≠ CLI Vercel. Le token a été fourni manuellement via `--token` sur chaque commande CLI

---

## Pour relancer l'infrastructure

```bash
cd terraform
terraform apply -auto-approve
# Mettre à jour VITE_API_URL sur Vercel avec le nouvel api_url si l'URL change
```
