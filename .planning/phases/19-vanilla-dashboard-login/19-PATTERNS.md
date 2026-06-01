# Phase 19: Pattern Map

**Mapped:** 2026-06-01

## Files to modify

| File | Role | Closest analog |
|------|------|----------------|
| `dashboard/app.js` | Auth bootstrap, fetchJson, gate toggles | `dashboard-react/src/api.js` + current `app.js` render helpers |
| `dashboard/index.html` | Login gate markup, panel wrapper, logout btn | Existing `.card` / `.toolbar` sections |
| `dashboard/styles.css` | Login gate layout | Existing `.card`, `.hero` |
| `api/README.md` | AUTH-12 doc | Existing «Autenticación (fase 18)» section |

## Analog: fetchJson + error.status

**Source:** `dashboard-react/src/api.js`

```4:24:dashboard-react/src/api.js
export async function fetchJson(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, options);
  // ... parses body.error, sets error.status
}
```

**Target change in vanilla:** add `credentials: 'include'` default; keep Spanish message prefix pattern from current `dashboard/app.js`.

## Analog: render / state helpers

**Source:** `dashboard/app.js` — reuse without renaming:

- `setOnlineState`, `setOfflineState`, `setLoadingState`, `showError`, `hideError`
- `renderHealth`, `renderApiInfo`, `renderUsers`
- `clearDashboardData` — call on logout and 401

## New functions (expected)

- `bootstrapAuth()` — entry on load
- `showLoginGate()`, `showDashboardPanel()` — toggle `#login-gate` / `.dashboard-panel`
- `handleLoginSubmit(event)`, `handleLogoutClick()` — auth actions
- `showLoginError(message)`, `clearLoginError()` — D-09

## Integration points

- Remove line `loadDashboardData();` at file end → `bootstrapAuth();`
- `elements` object: add gate, form, loginError, logoutButton refs

## Do not change

- `api/auth.js`, `api/index.js` (unless bug found)
- `dashboard-react/`, `dashboard-vue/` (AUTH-12 mentions only)
