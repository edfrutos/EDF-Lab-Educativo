# Phase 15 Pattern Map

**Phase:** 15 — React Dashboard Parity  
**Mapped:** 2026-06-01

## Closest analogs

| New artifact | Closest existing | Pattern to reuse |
|--------------|------------------|------------------|
| `dashboard-react/src/api.js` | `dashboard/app.js` `fetchJson`, `API_BASE_URL` | Same paths, same error tone in Spanish |
| `dashboard-react/src/App.jsx` | `dashboard/app.js` `loadDashboardData` | `Promise.all` for health, `/`, `/users` |
| CRUD handlers | `handleUserFormSubmit`, `deleteUser`, `startEditingUser` | POST/PUT/DELETE + reload after success |
| Loading/offline UI | `setLoadingState`, `setOnlineState`, `showError` | Boolean flags → conditional render |
| Mutation feedback | `showMutationFeedback`, `clearMutationFeedback` | Success/error strings visible to learner |
| Dev tooling | `dashboard/` + `python3 -m http.server` | Separate folder README with port + API env |

## Conventions to match

- Spanish UI strings from `dashboard/index.html`
- HTTP method visible in success feedback (`POST /users -> usuario creado`)
- `confirm()` before DELETE
- No axios — raw `fetch` only
- Do not modify `api/` or `dashboard/` in this phase

## New patterns introduced

- `import.meta.env.VITE_API_BASE_URL` (document in `.env.example`)
- React lifted state + props instead of `elements` object
- Tailwind utility classes instead of `styles.css`
