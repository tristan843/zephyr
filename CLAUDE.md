# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Vite dev server at http://localhost:5173
npm run build      # Production build to /dist
npm run preview    # Preview production build locally
```

No test or lint commands are configured.

Local development requires a `.env` file (copy from `.env.example`) with `ANTHROPIC_API_KEY` set.

## Architecture

**EQUITY** is a French-language real estate portfolio management SPA (React 18 + Vite 5) with an AI assistant powered by the Anthropic Claude API. The API key is kept server-side via a Vercel serverless proxy (`/api/claude.js`) — the browser never touches the key directly.

### File structure

```
api/claude.js     # Vercel serverless function: proxies POST requests to Anthropic API
src/main.jsx      # React 18 entry point (StrictMode)
src/App.jsx       # Entire application (~9 900 lines), one file
index.html        # HTML template, loads Google Fonts (Outfit, JetBrains Mono)
vite.config.js    # Dev proxy: /api/claude → https://api.anthropic.com/v1/messages
vercel.json       # SPA rewrite rule + Vite build settings
```

### App.jsx internal layout

| Area | Approx. lines | Contents |
|---|---|---|
| Design tokens | 15–40 | `C` object — full color palette (dark theme only) |
| Icon system | 45–108 | `I` object — 80+ inline SVG icons |
| Micro-components | 142–500+ | `Sparkline`, `Gauge`, `DataTile`, `DpeBadge`, form atoms, etc. |
| Address component | 2040–2160 | `NbFieldAddress` with autocomplete (api-adresse.data.gouv.fr + FR_CITIES fallback) |
| Feature panels | scattered | `Dashboard`, `PatrimoinePage`, `LocatairesPage`, `SimulateurPage`, `PropertyDetail`, `FranceMapView`, `LoginScreen`, `OnboardingFlow`, etc. |
| Root state & render | 9636+ | `EquityApp` — all `useState`/`useEffect` hooks, navigation, modal control |

### State management

All state lives in the root `EquityApp` component and flows down via props. There is no external state library (no Redux, no Zustand). Key state buckets: `user`, `assets` (properties), `tenants`, `kycData` (investor profile), and various UI modal flags.

### Styling convention

All styles are inline JS objects — there are no `.css` files. Reference the `C` design-token object for every color value. Animation keyframes are defined inline as well (`fadeUp`, `slideIn`, `shimmer`, etc.).

### Navigation

A sidebar drives six main sections: Pilotage, Mes biens, Locataires, Finances, Coffre, Simulateurs. Detail views open as slide-over panels layered on top of the current section.

### Language

All UI text, labels, and in-code comments are in French. Keep this consistent when adding features.

### Claude API calls

Frontend fetches `POST /api/claude` with an Anthropic-format body. The serverless function in `api/claude.js` injects the `x-api-key` header and forwards to `https://api.anthropic.com/v1/messages`. In local dev, Vite proxies `/api/claude` to the same endpoint (see `vite.config.js`).

## Refactoring strategy

The app is being refactored in two phases. Always check the current phase before touching any file.

### PHASE 1 (active)
- Extract components from App.jsx into separate files under src/components/
- Keep existing JSX syntax strictly identical — no behavior changes
- Keep all inline styles as-is, reference the C token object
- One component per session, run `npm run dev` to verify after each extraction
- Do not introduce new dependencies

### PHASE 2 (locked — do not start)
- Migrate to proper React patterns (hooks, lifted state, context)
- Only begins after explicit instruction: "start phase 2"

### Extraction order (suggested)
1. Design tokens → src/tokens/colors.js (C object)
2. Icon system → src/components/Icons.jsx (I object)
3. Micro-components → src/components/ui/ (Sparkline, Gauge, DataTile, DpeBadge...)
4. NbFieldAddress → src/components/NbFieldAddress.jsx
5. Feature panels one by one (Dashboard, PatrimoinePage, etc.)
6. EquityApp root → last
