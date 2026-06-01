# Phase 16 Pattern Map

**Phase:** 16 — Vue Dashboard Parity  
**Mapped:** 2026-06-01

## Closest analogs

| New artifact | Closest existing | Pattern to reuse |
|--------------|------------------|------------------|
| `dashboard-vue/src/api.js` | `dashboard-react/src/api.js` | Identical `fetchJson` + `VITE_API_BASE_URL` |
| `dashboard-vue/src/App.vue` | `dashboard-react/src/App.jsx` | `Promise.all` load, same ref names/behavior |
| `*.vue` components | `dashboard-react/src/components/*.jsx` | Same props responsibilities, Vue emits instead of callbacks |
| CRUD | `dashboard/app.js` | POST/PUT/DELETE + reload + confirm delete |
| 409 UX | `dashboard-react/src/App.jsx` | `error.status === 409` → global + inline email |
| Dev tooling | `dashboard-react/` | Port 5175, README, `.env.example` |

## Conventions to match

- Spanish copy from `dashboard/index.html`
- Success strings: `POST /users -> usuario creado`, etc.
- `<script setup>` + Composition API only
- Loose `ref()` in App.vue (user preference from CONTEXT)
- No Pinia/router/axios

## New patterns introduced (pedagogical)

- Vue `ref()` + template auto-updates vs React `useState` vs vanilla globals
- `defineProps` / `defineEmits` in child `.vue` files
- Port **5175** documented alongside 5173 (vanilla) and 5174 (React)

## Do not modify

- `api/` (unless CORS verification fails — document in UAT)
- `dashboard/` vanilla
- `dashboard-react/` (reference only)
