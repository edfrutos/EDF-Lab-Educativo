# Phase 22: Pattern Map

**Mapped:** 2026-06-02

## Files to modify

| File | Role | Closest analog |
|------|------|----------------|
| `dashboard-react/src/components/LoginGate.jsx` | Login form UI | `dashboard/index.html` `#login-gate` + Phase 19 |
| `dashboard-react/src/api.js` | `login()`, `logout()` | `dashboard/app.js` `handleLoginSubmit` / `handleLogoutClick` |
| `dashboard-react/src/App.jsx` | Bootstrap, gating, 401 | `dashboard/app.js` `bootstrapAuth`, gate toggles |
| `dashboard-react/README.md` | Auth instructions | Phase 19 AUTH-12; remove AUTH_DISABLED primary path |

## Analog: vanilla auth bootstrap

**Source:** `dashboard/app.js`

- `bootstrapAuth()` — health → `/users` probe → gate or load
- `showLoginGate()` / `showDashboardPanel()` → React: `isAuthenticated` conditional render
- `handleLoginSubmit` / `handleLogoutClick` → App handlers calling `api.js`
- 401 branches in `loadDashboardData` and CRUD → same in React `loadDashboardData` / `handleMutationError`

## Analog: fetchJson (already aligned)

**Source:** `dashboard-react/src/api.js`

```4:27:dashboard-react/src/api.js
export async function fetchJson(path, options = {}) {
  const response = await fetch(url, {
    credentials: 'include',
    ...options
  });
  // error.status set on failure
}
```

**Action:** Add `login`/`logout` wrappers; verify no fetch bypasses `fetchJson`.

## React structure (Phase 15 locked)

- Lifted state in `App.jsx` — extend with `isAuthenticated`, `isBootstrapping`, `loginError`
- No `useAuth` hook — keep visible for teaching (Phase 22 CONTEXT D-02)
- CRUD components unchanged post-auth

## New component

- `LoginGate.jsx` — form + inline error + lab hint (CONTEXT D-01, D-05–D-07)

## Integration points

- Replace `useEffect(() => loadDashboardData(), …)` with `bootstrapAuth()`
- Toolbar: add «Cerrar sesión» before «Recargar datos» (CONTEXT D-08)
- `handleMutationError`: if `error.status === 401` → `setIsAuthenticated(false)`, `clearDashboardData()`, `setLoginError(message)`

## Do not change

- `api/auth.js`, `api/index.js`
- `dashboard/` vanilla
- `dashboard-vue/` (Phase 23)
