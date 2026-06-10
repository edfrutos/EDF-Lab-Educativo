# Phase 19: Dashboard Login Flow - Context

**Gathered:** 2026-06-10
**Status:** Ready for discussion / planning (blocked on Phase 18 API)

<domain>
## Phase Boundary

Update the **vanilla dashboard** (`dashboard/`) to support login/logout when the API requires authentication. Attach Bearer token to API calls; handle 401 gracefully.

**No changes** to `dashboard-react/` or `dashboard-vue/` in required scope (reto extra in Mission 14).

**Requirements:** AUTH-08 through AUTH-12.

</domain>

<decisions>
## Implementation Decisions (proposed)

### Login UI — AUTH-08, AUTH-09
- **D-01:** Login panel (username + password) shown when no valid token and API returns 401 on initial load, OR when user clicks logout.
- **D-02:** On successful `POST /auth/login`, store token in `sessionStorage` under a documented key (e.g. `edf_lab_token`).
- **D-03:** Logout button clears `sessionStorage` and resets UI to login state.
- **D-04:** Spanish copy for login errors (credenciales incorrectas, sesión expirada).

### Fetch integration — AUTH-10, AUTH-11
- **D-05:** Extend `fetchJson` (or wrapper) to add `Authorization: Bearer <token>` when token exists.
- **D-06:** On 401 from any API call: clear token, show login, preserve existing `showError` / offline patterns where possible.
- **D-07:** Initial `loadDashboardData`: if 401, show login instead of generic offline error (teach difference).

### Backward compatibility — AUTH-12
- **D-08:** When API has auth disabled, dashboard loads as today — no login gate.
- **D-09:** Do not require login UI elements in DOM when auth is off (or hide them).

### UX
- **D-10:** Reuse existing `elements` object pattern; add login form refs there.
- **D-11:** Loading state during login submit (disable button / show feedback).

### Claude's Discretion
- Whether login is a modal vs dedicated section above health card.
- Exact placement of logout control in header.

</decisions>

<constraints>
## Constraints

- `API_BASE_URL` remains `http://localhost:3100` unless env injection is added (out of scope — document manual auth testing).
- Maintain accessibility basics on login form (labels, focus).
- No new npm dependencies in dashboard (static JS).

</constraints>
