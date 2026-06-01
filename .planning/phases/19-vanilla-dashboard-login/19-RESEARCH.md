# Phase 19: Vanilla Dashboard Login — Research

**Researched:** 2026-06-01  
**Status:** Complete

## Summary

Phase 19 wires the existing vanilla `dashboard/` to Phase 18 cookie auth. The API contract is **locked**; work is entirely in `dashboard/*` plus a short `api/README.md` subsection for AUTH-12. The critical technical move is defaulting **`credentials: 'include'`** on every `fetchJson` call so the browser sends `edf_session` on cross-origin requests to `:3100`.

## API contract (locked — Phase 18)

| Route | Auth | Success | Failure |
|-------|------|---------|---------|
| `GET /health` | Public | 200 JSON | — |
| `POST /auth/login` | Public | 200 + Set-Cookie `edf_session` | 403 `{ error: 'Credenciales inválidas' }` |
| `POST /auth/logout` | Public | 200 + clear cookie | — |
| `GET/POST/PUT/DELETE /users*` | Cookie JWT | 200/201/… | 401 `{ error: 'Sesión no válida o expirada. Inicia sesión.' }` |

CORS on API: `credentials: true`, origins include `http://localhost:5173`.

## fetchJson pattern

Mirror `dashboard-react/src/api.js`:

```javascript
async function fetchJson(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    credentials: 'include',
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  if (!response.ok) {
    let detail = `estado HTTP ${response.status}`;
    try {
      const body = await response.json();
      if (body?.error) detail = body.error;
    } catch { /* ignore */ }
    const error = new Error(`La petición a ${url} ha fallado: ${detail}`);
    error.status = response.status;
    throw error;
  }
  return response.json();
}
```

Callers branch on `error.status === 401` for session loss; login handler catches `403` for inline form error.

## Bootstrap state machine

```
DOMContentLoaded
  → bootstrapAuth()
    → fetchJson('/health')  // no auth required
      fail → setOfflineState + showError (error-box) — stop
      ok → renderHealth + setOnlineState on connection card
    → fetchJson('/users')   // session probe
      200 → showDashboardPanel(); loadDashboardData()
      401 → showLoginGate()
      other → showLoginGate() + optional message
```

**Replace** bottom-of-file `loadDashboardData()` call with `bootstrapAuth()`.

`loadDashboardData()` unchanged internally except all fetches inherit credentials via `fetchJson`.

## Error UX matrix

| Situation | UI surface | Message source |
|-----------|------------|----------------|
| Health/CORS down | `#error-box` | Existing `showError` |
| Wrong password (403) | `#login-error` | `body.error` |
| No session (401) on probe/load/CRUD | Login gate + `#login-error` | `body.error` or fallback D-10 |
| Network on login POST | `#login-error` | `error.message` |

Do **not** route login 403 through `showError` / `error-box` (D-09).

## HTML/CSS recommendations

- Wrap toolbar + grid + users in `<div class="dashboard-panel" hidden>` (or `aria-hidden` + CSS).
- Add `#login-gate` as sibling after `hero`, before panel.
- Reuse `.card`, `.small-label`, primary button styles from `styles.css`.
- Add `.login-gate` layout: flex center, max-width 420px.

## Manual UAT (no dashboard test runner)

1. API on 3100, dashboard on 5173 — first visit shows login gate, no users table.
2. Wrong password → inline «Credenciales inválidas», no global error box.
3. Valid `admin@lab.local` / `changeme` → dashboard loads, Network tab shows `Cookie` on `/users`.
4. Logout → gate returns; `GET /users` without re-login stays on gate.
5. Delete cookie in DevTools → reload → 401 path back to gate.

## Risks / pitfalls

- **Missing credentials:** Cookie never sent → perpetual 401 (see PITFALLS.md).
- **Flash of dashboard:** Hide `.dashboard-panel` in HTML default `hidden` until session confirmed.
- **Double Content-Type:** Merge headers in `fetchJson` for POST login body.

## Plan suggestions

| Plan | Wave | Scope |
|------|------|-------|
| 19-01 | 1 | `index.html`, `styles.css`, `app.js` — gate, fetchJson, bootstrap, login/logout, 401 UX (AUTH-10, AUTH-11) |
| 19-02 | 2 | `api/README.md` — Clientes frontend subsection (AUTH-12) |

## RESEARCH COMPLETE
