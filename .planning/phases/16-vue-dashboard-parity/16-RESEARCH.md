# Phase 16 Research: Vue Dashboard Parity

**Phase:** 16-vue-dashboard-parity  
**Researched:** 2026-06-01  
**Status:** Ready for planning

## Summary

Phase 16 adds `dashboard-vue/` with Vite, Vue 3 (`<script setup>`), and Tailwind CSS v4 (`@tailwindcss/vite`). Behavior must match `dashboard-react/` and `dashboard/app.js` without modifying `api/` unless CORS verification fails (D-21: default no API change).

## Technical recommendations

### Scaffold

```bash
cd /path/to/repo
npm create vite@latest dashboard-vue -- --template vue
cd dashboard-vue
npm install
npm install -D tailwindcss @tailwindcss/vite
```

Configure `vite.config.js`:

- Plugins: `@vitejs/plugin-vue`, `@tailwindcss/vite`
- `server.port: 5175`, `server.strictPort: true`

### `src/api.js`

Copy logic from `dashboard-react/src/api.js` (identical `fetchJson`, `API_BASE_URL`, `err.status` for 409).

### Component map

| React (`dashboard-react/`) | Vue SFC |
|----------------------------|---------|
| `App.jsx` | `App.vue` |
| `ConnectionStatus.jsx` | `ConnectionStatus.vue` |
| `HealthCard.jsx` | `HealthCard.vue` |
| `ApiInfoCard.jsx` | `ApiInfoCard.vue` |
| `UsersTable.jsx` | `UsersTable.vue` |
| `UserForm.jsx` | `UserForm.vue` |

### State in App.vue (`<script setup>`)

Use explicit **`ref()`** per field (D-08), not one opaque `reactive()` blob:

- `users`, `healthStatus`, `healthTimestamp`, `apiMessage`, `apiVersion`, `endpoints`
- `isOnline`, `connectionText`, `isLoading`, `loadError`
- `editingUserId`, `name`, `email`, `formModeMessage`, `isFormBusy`
- `mutationFeedback`, `mutationFeedbackType`, `emailFieldError`

Functions: `loadDashboardData`, `handleSubmit`, `handleEdit`, `handleDelete`, `resetUserForm`, `handleMutationError` — mirror `dashboard-react/src/App.jsx`.

### Child components (props / emits)

- **ConnectionStatus:** props `isOnline`, `connectionText`
- **HealthCard:** props `healthStatus`, `healthTimestamp`
- **ApiInfoCard:** props `apiMessage`, `apiVersion`, `endpoints`
- **UsersTable:** props `users`, `isFormBusy`; emits `edit`, `delete`
- **UserForm:** props for values + feedback; emits `submit`, `cancel`, `update:name`, `update:email`

No Pinia, no provide/inject (v1.4).

### Pedagogy (D-10)

In `dashboard-vue/README.md`, add a short section contrasting:

- Vanilla: top-level `let` / `elements` object
- React: `useState` in `App.jsx`
- Vue: `ref()` + template reactivity in `App.vue`

Full comparison doc remains Phase 17.

### CORS verification (FRWK-05 / D-21)

1. `cd api && PORT=3100 npm start`
2. `cd dashboard-vue && npm run dev`
3. Open `http://localhost:5175` — CRUD works
4. Confirm React `:5174` and vanilla `:5173` still work (16-UAT scenario 9 optional)

### Files to create

```
dashboard-vue/
  package.json
  vite.config.js
  index.html
  .env.example
  .gitignore
  README.md
  src/
    main.js
    index.css          # @import "tailwindcss"
    api.js
    App.vue
    components/
      ConnectionStatus.vue
      HealthCard.vue
      ApiInfoCard.vue
      UsersTable.vue
      UserForm.vue
```

### Out of scope (phase 16)

- `docs/16-frameworks.md`, Mission 13, unified three-dashboard UAT (phase 17)
- Pinia, Vue Router, axios, TypeScript (optional later)
- Changing `dashboard/` or `dashboard-react/`

## Risks

| Risk | Mitigation |
|------|------------|
| Port 5175 clash with other Vite apps | `strictPort`; document in README |
| v-model vs props/emits confusion | Keep form state in App.vue; children emit updates (teaching clarity) |
| Copy-paste drift from React | Use `dashboard-react/` as primary reference; verify against `dashboard/app.js` |

## Confidence

HIGH — Phase 15 proved the pattern; Vue swap is scaffold + SFC syntax.
