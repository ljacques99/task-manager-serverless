# Projet : Gestionnaire de Tâches Serverless

Application fullstack de gestion de tâches avec backend AWS serverless et frontend Vite déployé sur Vercel.

---

## Architecture globale

```
[Navigateur] → Vercel (Vite/React)
                    ↓ HTTPS
             [API Gateway HTTP API]
                    ↓
             [AWS Lambda (Node.js)]
                    ↓
             [DynamoDB Table]
```

---

## 1. Infrastructure Terraform

### Fichiers attendus

```
terraform/
├── main.tf           # Provider AWS, backend S3 optionnel
├── lambda.tf         # Ressource Lambda + IAM role
├── dynamodb.tf       # Table DynamoDB
├── api_gateway.tf    # HTTP API Gateway avec route publique
├── outputs.tf        # URL de l'API exposée
└── variables.tf      # Région, nom du projet, environnement
```

### Contraintes

- Région : `eu-west-1` (modifiable via variable)
- Accès public : aucune authentification Cognito/IAM sur les routes (authorization = `NONE`)
- CORS configuré sur l'API Gateway pour autoriser l'origine Vercel
- Le rôle IAM de la Lambda doit avoir les permissions `dynamodb:GetItem`, `dynamodb:PutItem`, `dynamodb:UpdateItem`, `dynamodb:DeleteItem`, `dynamodb:Scan`, `dynamodb:Query` sur la table

### Commandes Terraform

```bash
terraform init
terraform plan
terraform apply -auto-approve
terraform destroy -auto-approve   # uniquement pour nettoyage
```

### Outputs requis

- `api_url` : URL publique de l'API Gateway (utilisée par le frontend)

---

## 2. AWS Lambda

### Runtime

- **Node.js 20.x**
- Handler : `index.handler`
- Timeout : 10 secondes
- Mémoire : 256 MB

### Structure du code

```
lambda/
├── index.js          # Handler principal (routing interne)
├── handlers/
│   ├── tasks.js      # CRUD tâches
│   └── health.js     # GET /health
└── package.json
```

### Routes HTTP (via API Gateway)

| Méthode | Chemin          | Description               |
|---------|-----------------|---------------------------|
| GET     | /health         | Vérification du service   |
| GET     | /tasks          | Lister toutes les tâches  |
| POST    | /tasks          | Créer une tâche           |
| GET     | /tasks/{id}     | Obtenir une tâche         |
| PUT     | /tasks/{id}     | Mettre à jour une tâche   |
| DELETE  | /tasks/{id}     | Supprimer une tâche       |

### Format de réponse standard

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

---

## 3. DynamoDB

### Table

- **Nom** : `tasks-{environment}` (ex: `tasks-dev`)
- **Billing** : `PAY_PER_REQUEST` (on-demand)
- **Clé primaire** : `id` (String) — UUID v4 généré par la Lambda

### Modèle de données — Item Tâche

```json
{
  "id":          "uuid-v4",
  "title":       "Titre de la tâche",
  "description": "Description optionnelle",
  "status":      "pending | in_progress | done",
  "priority":    "low | medium | high",
  "dueDate":     "2026-05-15",
  "createdAt":   "2026-05-01T10:00:00Z",
  "updatedAt":   "2026-05-01T12:00:00Z"
}
```

### Index secondaire global (GSI)

- **Nom** : `status-createdAt-index`
- **Partition key** : `status`
- **Sort key** : `createdAt`
- Permet de filtrer les tâches par statut

---

## 4. Frontend Vite (React + TypeScript)

### Stack technique

- **Vite** + **React 18** + **TypeScript**
- **TailwindCSS** pour le style
- **TanStack Query** pour la gestion des données asynchrones
- **React Hook Form** + **Zod** pour les formulaires et la validation
- **Lucide React** pour les icônes

### Structure du projet

```
frontend/
├── public/
├── src/
│   ├── api/
│   │   └── tasks.ts          # Fonctions fetch vers l'API Lambda
│   ├── components/
│   │   ├── TaskCard.tsx
│   │   ├── TaskForm.tsx
│   │   ├── TaskList.tsx
│   │   ├── TaskFilters.tsx
│   │   └── StatusBadge.tsx
│   ├── hooks/
│   │   └── useTasks.ts       # Hooks TanStack Query
│   ├── types/
│   │   └── task.ts           # Types TypeScript
│   ├── App.tsx
│   └── main.tsx
├── .env.example              # VITE_API_URL=https://...
├── .env.local                # Non commité, contient l'URL réelle
├── index.html
└── vite.config.ts
```

### Fonctionnalités de l'interface

- Vue Kanban ou liste avec filtres par statut et priorité
- Création de tâche via modal ou panneau latéral
- Édition en ligne du titre
- Changement de statut par drag-and-drop ou bouton
- Indicateur de priorité coloré
- Date d'échéance avec alerte si dépassée
- Recherche textuelle côté client
- Toasts de confirmation (succès / erreur)
- Design responsive (mobile + desktop)
- Thème professionnel : couleurs neutres, typographie claire

---

## 5. Déploiement

### GitHub

```bash
git init
git add .
git commit -m "feat: initial project setup"
git remote add origin https://github.com/<username>/task-manager-serverless.git
git push -u origin main
```

### Vercel

- Connecter le dépôt GitHub à Vercel via l'interface ou `vercel` CLI
- Répertoire racine : `frontend/`
- Variable d'environnement Vercel : `VITE_API_URL` = valeur de l'output Terraform `api_url`
- Framework preset : **Vite**
- Build command : `npm run build`
- Output directory : `dist`

---

## 6. Tests

### Tests Lambda (après `terraform apply`)

```bash
# Santé
curl -s <api_url>/health | jq .

# Créer une tâche
curl -s -X POST <api_url>/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Ma première tâche","priority":"high","status":"pending"}' | jq .

# Lister les tâches
curl -s <api_url>/tasks | jq .

# Mettre à jour
curl -s -X PUT <api_url>/tasks/<id> \
  -H "Content-Type: application/json" \
  -d '{"status":"done"}' | jq .

# Supprimer
curl -s -X DELETE <api_url>/tasks/<id> | jq .
```

### Vérifications attendues

- Code HTTP 200 sur tous les endpoints
- Réponse JSON valide avec champ `success: true`
- L'item créé est visible dans la console DynamoDB
- Le frontend Vercel affiche les tâches en temps réel

---

## 7. Ordre d'exécution

1. Écrire le code Lambda (`lambda/`)
2. Écrire les fichiers Terraform (`terraform/`)
3. `terraform apply -auto-approve` → noter l'`api_url`
4. Tester l'API avec `curl`
5. Créer le frontend Vite (`frontend/`)
6. Configurer `.env.local` avec l'`api_url`
7. Tester le frontend localement (`npm run dev`)
8. Pousser sur GitHub
9. Déployer sur Vercel avec la variable `VITE_API_URL`
