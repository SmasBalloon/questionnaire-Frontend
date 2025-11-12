# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

# Questionnaire Frontend - Documentation Complète

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Configuration initiale](#configuration-initiale)
3. [Architecture](#architecture)
4. [Commandes principales](#commandes-principales)
5. [Structure du projet](#structure-du-projet)
6. [Guide de développement](#guide-de-développement)
7. [Déploiement](#déploiement)
8. [Dépannage](#dépannage)

---

## 🎯 Vue d'ensemble

**Questionnaire** est une application web interactive pour créer et jouer des quiz en temps réel.

### Technologies

- **Frontend:** React 19 + TypeScript
- **Build:** Vite (Rolldown)
- **Routing:** React Router 7
- **Temps réel:** Socket.IO client
- **Styling:** Tailwind CSS 4
- **Linting:** ESLint 9

### Fonctionnalités principales

✅ Authentification (Login/Register)  
✅ Création et édition de quiz  
✅ 4 types de questions (Vrai/Faux, Choix simple, Choix multiple, Réponse courte)  
✅ Mode hôte (quiz en direct avec points)  
✅ Mode joueur (rejoindre un quiz avec code)  
✅ Socket.IO pour temps réel  

---

## ⚙️ Configuration initiale

### 1. Installation des dépendances

```bash
cd /root/questionnaire-Frontend
npm install
```

### 2. Créer les fichiers d'environnement

**`.env` (développement)**
```bash
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

**`.env.production` (production)**
```bash
VITE_API_URL=/api
VITE_SOCKET_URL=http://172.17.30.14:5000
```

### 3. Vérifier la configuration

```bash
npm run lint      # Vérifier le code
npm run build     # Tester la compilation
```

---

## 🏗️ Architecture

### Flux d'application

```
main.tsx
  ↓
App.tsx (Routing)
  ↓
AuthProvider (Context)
  ↓
BrowserRouter
  ├── Routes publiques (/, /login, /register, /join, /play/:code)
  └── Routes protégées (ProtectedRoutes)
      ├── /dashboard
      ├── /quiz/create
      ├── /quiz/:id/edit
      ├── /quiz/:id/play (mode hôte)
      └── /create/question/:id
```

### Layers

```
pages/           → Components full page (Dashboard, Login, etc)
components/      → Composants réutilisables
layout/          → Layout components (navbar, etc)
contexts/        → Context API (AuthContext)
utils/           → Helpers (api.ts, socket.ts, types.ts)
middlewares/     → Route guards (ProtectedRoutes)
```

---

## 🚀 Commandes principales

### Développement

```bash
# Lancer le serveur de dev (port 5173)
npm run dev

# Lancer avec accès réseau
npm run dev -- --host
```

Accès : `http://localhost:5173`

### Build & Production

```bash
# Compiler TypeScript et builder avec Vite
npm run build

# Prévisualiser le build en local
npm run preview
```

### Linting

```bash
# Vérifier les erreurs ESLint
npm run lint

# Corriger automatiquement
npm run lint -- --fix
```

---

## 📁 Structure du projet

```
questionnaire-Frontend/
├── src/
│   ├── pages/                    # Page components
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Dashboard.tsx         # Mes quiz
│   │   ├── CreateQuiz.tsx
│   │   ├── ModifQuiz.tsx
│   │   ├── CreateQuestion.tsx
│   │   ├── ModifQuestion*.tsx    # 4 types
│   │   ├── JoinQuiz.tsx
│   │   ├── PlayQuiz.tsx          # Mode joueur
│   │   └── PlayQuizHost.tsx      # Mode hôte
│   ├── components/               # Composants réutilisables
│   │   ├── Question*.tsx         # Question components
│   │   ├── Loading.tsx
│   │   ├── FormInput.tsx
│   │   └── ...
│   ├── layout/
│   │   └── layout.tsx            # Nav/Header
│   ├── middlewares/
│   │   └── ProtectedRoutes.tsx   # Route guard
│   ├── contexts/
│   │   └── AuthContext.tsx       # Auth state management
│   ├── utils/
│   │   ├── api.ts                # API wrapper
│   │   ├── socket.ts             # Socket.IO setup
│   │   ├── types.ts              # TypeScript interfaces
│   │   └── ...
│   ├── App.tsx                   # Main routing
│   ├── main.tsx                  # Entry point
│   ├── App.css
│   └── index.css
├── public/
├── index.html
├── vite.config.ts                # Config Vite
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── eslint.config.js
└── package.json
```

---

## 👨‍💻 Guide de développement

### Créer un nouveau composant

**Règle :** Utiliser functional components avec hooks

```typescript
import { useState } from 'react';

interface MyComponentProps {
  title: string;
  onSubmit: (data: any) => void;
}

export function MyComponent({ title, onSubmit }: MyComponentProps) {
  const [state, setState] = useState('');

  return <div>{title}</div>;
}
```

### Appeler l'API

**Toujours utiliser le wrapper `api.ts`**

```typescript
import { api, ApiError } from '../utils/api';
import type { Quiz } from '../utils/types';

try {
  const quiz = await api.post<Quiz>('/quiz/create', {
    name: 'Mon quiz',
    description: 'Description'
  });
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`Erreur ${error.status}: ${error.message}`);
  }
}
```

---

## 📦 Déploiement

### Build pour production

```bash
npm run build
# Crée : dist/
```

### Servir avec Nginx

**Config Nginx déjà en place : `/etc/nginx/sites-available/questionnaire`**

Le build `dist/` est servi depuis `/root/questionnaire-Frontend/dist`

---

## 🐛 Dépannage

### "Cannot find module..."

```bash
rm -rf node_modules package-lock.json
npm install
```

### Socket.IO ne se connecte pas

1. Vérifier `VITE_SOCKET_URL` dans `.env`
2. Vérifier que le backend tourne sur le port 5000
3. Vérifier les logs console du navigateur

---

## 📚 Fichiers importants

- **`REVIEW.md`** — Revue de code détaillée et problèmes
- **`FIX_PLAN.md`** — Plan d'action avec solutions
- **`TYPES_GUIDE.md`** — Guide des types TypeScript

---

**Dernière mise à jour :** 12 novembre 2025

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
