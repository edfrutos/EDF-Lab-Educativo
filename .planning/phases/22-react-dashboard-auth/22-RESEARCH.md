# Phase 22: React Dashboard Auth — Research

**Researched:** 2026-06-02  
**Status:** Complete

## Summary

Phase 22 ports Phase 19 vanilla auth behavior into `dashboard-react/` on port **5174**. API contract is **locked** (Phase 18). `fetchJson` already sends `credentials: 'include'` — work focuses on **`LoginGate.jsx`**, **`login()`/`logout()` in `api.js`**, and **auth-aware `App.jsx`** bootstrap with conditional shell rendering.

## API contract (locked — Phase 18)

| Route | Auth | Success | Failure |
|-------|------|---------|---------|
| `GET /health` | Public | 200 JSON | — |
| `POST /auth/login` | Public | 200 + Set-Cookie `edf_session` | 403 `{ error: 'Credenciales inválidas' }` |
| `POST /auth/logout` | Public | 200 + clear cookie | — |
| `GET/POST/PUT/DELETE /users*` | Cookie JWT | 200/201/… | 401 `{ error: 'Sesión no válida o expirada. Inicia sesión.' }` |

CORS: `credentials: true`, origins include `http://localhost:5174`.

## Current React state

- `dashboard-react/src/api.js` — `fetchJson` already has `credentials: 'include'` and `error.status` (FRWK-AUTH-02 partially done).
- `dashboard-react/src/App.jsx` — calls `loadDashboardData()` on mount without auth gate; 401 surfaces as global `loadError` rose panel (wrong UX for auth).
- `dashboard-react/README.md` — still says "no login"; must update in plan 22-02.

## Bootstrap state machine (mirror Phase 19)

```
useEffect on mount
  → bootstrapAuth()
    → setIsBootstrapping(true)
    → fetchJson('/health')
      fail → setIsOnline false, setLoadError (rose panel), setIsBootstrapping(false) — stop
      ok → setIsOnline true
    → fetchJson('/users')  // session probe
      200 → setIsAuthenticated(true); loadDashboardData()
      401 → setIsAuthenticated(false); setLoginError(api message or fallback)
      other → gate + loginError
    → setIsBootstrapping(false)
```

**Replace** `useEffect(() => loadDashboardData(), …)` with `bootstrapAuth()`.

When `!isAuthenticated && !isBootstrapping`: render only `<LoginGate />` (+ optional bootstrap loading text).

When `isAuthenticated`: render existing dashboard shell (hero, toolbar, CRUD, pedagogy).

## Error UX matrix

| Situation | UI surface | Message source |
|-----------|------------|----------------|
| Health/CORS down during bootstrap | Rose `loadError` panel | Existing connection error |
| Wrong password (403) | `loginError` on LoginGate | `body.error` via fetchJson |
| No session (401) on probe/load/CRUD | LoginGate + `loginError` | `error.message` or fallback D-15 |
| Network on login POST | `loginError` | `error.message` |

Do **not** route login 403 or session 401 through global `loadError` (D-13, D-14).

## LoginGate.jsx sketch

Props (planner discretion on exact names):

- `onSubmit(email, password)` — async handler from App
- `error` — inline login error string
- `isSubmitting` — disable form during POST
- Lab hint static text: `admin@lab.local` / `changeme`

Tailwind: `rounded-xl border border-slate-200 bg-white p-6 shadow-sm max-w-md mx-auto`.

## api.js additions

```javascript
export async function login(email, password) {
  return fetchJson('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

export async function logout() {
  return fetchJson('/auth/logout', { method: 'POST' });
}
```

Both inherit `credentials: 'include'` from `fetchJson`.

## Manual UAT (port 5174)

1. API on 3100 (no `AUTH_DISABLED`), React on 5174 — first visit shows login gate only.
2. Wrong password → inline «Credenciales inválidas», no rose error panel.
3. Valid `admin@lab.local` / `changeme` → full dashboard loads; Network tab shows `Cookie` on `/users`.
4. Logout in toolbar → gate returns; refresh stays on gate.
5. Delete `edf_session` cookie → Recargar datos → gate with Spanish 401 message.
6. POST user with expired cookie → gate, not only mutation feedback.

## Risks / pitfalls

- **Flash of dashboard:** Use `isBootstrapping` + `isAuthenticated` gating — never render CRUD until probe succeeds.
- **401 treated as connection error:** Branch `error.status === 401` before setting `loadError`.
- **README stale:** Update auth paragraph so learners stop using `AUTH_DISABLED` as primary path.

## Plan suggestions

| Plan | Wave | Focus |
|------|------|-------|
| 22-01 | 1 | `LoginGate.jsx` + `api.js` login/logout |
| 22-02 | 2 | `App.jsx` bootstrap, gating, 401, logout, README, UAT |
