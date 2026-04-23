# EQUITY — Gestion Patrimoniale Intelligente

## Démarrage rapide

```bash
npm install
cp .env.example .env   # Ajoutez votre clé API Anthropic
npm run dev             # → http://localhost:5173
```

## Déploiement Vercel

```bash
git init && git add . && git commit -m "EQUITY v1.0"
git remote add origin https://github.com/VOTRE_USER/equity.git
git branch -M main && git push -u origin main
```

Sur vercel.com : importez le repo, ajoutez `ANTHROPIC_API_KEY` dans les variables d'environnement.

## Structure

```
equity-deploy/
├── api/claude.js        ← Proxy API Anthropic (serverless)
├── src/App.jsx          ← Application React (~9900 lignes)
├── src/main.jsx         ← Point d'entrée
├── index.html           ← Page racine
├── package.json         ← React 18 + Vite 5
├── vite.config.js       ← Config + proxy dev
├── vercel.json          ← Config déploiement
└── .env.example         ← Template clé API
```

© 2026 EQUITY
