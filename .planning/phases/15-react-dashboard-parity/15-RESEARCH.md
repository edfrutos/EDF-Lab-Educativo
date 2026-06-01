# Phase 15 Research: React Dashboard Parity

**Phase:** 15-react-dashboard-parity  
**Researched:** 2026-06-01  
**Status:** Ready for planning

## Summary

Phase 15 adds `dashboard-react/` with Vite, React 18, and Tailwind CSS v4 (`@tailwindcss/vite`). Behavior must mirror `dashboard/app.js` without modifying `api/` except optional CORS documentation (D-16: no API change; `cors()` is open).

## Technical recommendations

### Scaffold

```bash
cd /path/to/repo
npm create vite@latest dashboard-react -- --template react
cd dashboard-react
npm install
npm install -D tailwindcss @tailwindcss/vite
```

Configure `vite.config.js`:

- Plugin `@tailwindcss/vite`
- `server.port: 5174`, `server.strictPort: true`

### `src/api.js`

Mirror vanilla `fetchJson` but parse error body on non-OK:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3100';

export async function fetchJson(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, options);
  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      if (body?.error) detail = body.error;
    } catch { /* ignore */ }
    const err = new Error(`La petición a ${url} ha fallado: ${detail}`);
    err.status = response.status;
    throw err;
  }
  return response.json();
}
```

Enables D-11: show `err.message` in mutation-feedback and inline email error when `err.status === 409`.

### Component map

| Vanilla | React component |
|---------|-----------------|
| connection-card | `ConnectionStatus` |
| health + api cards | `HealthCard`, `ApiInfoCard` |
| users table | `UsersTable` |
| user form | `UserForm` |
| orchestration | `App.jsx` |

### State in App.jsx

- `currentUsers`, `editingUserId`, `isLoading`, `isOnline`, `errorMessage`, `mutationFeedback`, `emailFieldError`
- `loadDashboardData` on mount + after successful mutations (D-08 default)
- Edit flow: `startEditingUser` / `resetUserForm` parity (D-09 default)

### Tailwind layout

Reuse copy from `dashboard/index.html`. Approximate vanilla sections with Tailwind utilities (`app-shell`, cards, grid) — no need to pixel-match `styles.css`.

### CORS verification (FRWK-07)

1. `cd api && PORT=3100 npm start`
2. `cd dashboard-react && npm run dev`
3. Open `http://localhost:5174` — CRUD works
4. Vanilla `http://localhost:5173` still works

No `api/index.js` edit expected.

### Files to create

```
dashboard-react/
  package.json
  vite.config.js
  index.html
  .env.example
  README.md
  src/
    main.jsx
    index.css          # @import "tailwindcss"
    api.js
    App.jsx
    components/
      ConnectionStatus.jsx
      HealthCard.jsx
      ApiInfoCard.jsx
      UsersTable.jsx
      UserForm.jsx
```

### Out of scope (phase 15)

- Vue, comparison doc, NOTEBOOK bulk pass (phases 16–17)
- React Router, tests, Compose for Vite
- Changing `dashboard/` vanilla files

## Risks

| Risk | Mitigation |
|------|------------|
| Port 5174 in use | Document in README; `strictPort` fails fast |
| fetchJson loses 409 message | Attach `status` + parse JSON error (above) |
| Tailwind v4 config drift | Pin versions in package.json; link Tailwind Vite docs in README |

## Confidence

HIGH for stack and parity approach; MEDIUM for exact Tailwind class choices (executor discretion per D-02).
