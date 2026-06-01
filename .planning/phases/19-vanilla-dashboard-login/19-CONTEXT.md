# Phase 19: Vanilla Dashboard Login - Context

**Gathered:** 2026-06-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Add **login and logout UI** to the primary vanilla dashboard (`dashboard/`) so learners can operate protected `/users` CRUD with the **httpOnly cookie** session from Phase 18. Refactor `fetchJson` to send **`credentials: 'include'`** on every API call, parse API error bodies, and surface **401/403** in Spanish consistent with the backend. Satisfy **AUTH-10**, **AUTH-11**, **AUTH-12**.

**Not in this phase:** React/Vue login UI (doc appendix only), production `.env` hardening (Phase 20), full `docs/17-authentication.md` / Mission 14 (Phase 21), API auth implementation changes (Phase 18 — locked).

</domain>

<decisions>
## Implementation Decisions

### Milestone baseline (locked — do not re-litigate)

- **D-00a:** Session is **httpOnly cookie** `edf_session` — dashboard must use `credentials: 'include'`, never `localStorage`.
- **D-00b:** Login API: `POST /auth/login` → **403** + `{ error: 'Credenciales inválidas' }` on bad password; protected routes → **401** + `{ error: 'Sesión no válida o expirada. Inicia sesión.' }` (Phase 18).
- **D-00c:** Lab operator defaults documented in `api/.env.example`: `admin@lab.local` / `changeme`.
- **D-00d:** CORS already allows dashboard origins with `credentials: true` (Phase 18).

### Login gate & layout

- **D-01:** **Full-screen login gate** — the main dashboard shell (`app-shell`, toolbar, cards, CRUD) stays **hidden** until the learner has a valid session. No partial “preview” of protected data before login.
- **D-02:** Login form fields: **email** + **password**; submit via `POST /auth/login` with `Content-Type: application/json` and **`credentials: 'include'`**.
- **D-03:** **Logout** control in the **toolbar**, beside **«Recargar datos»** (same row / `toolbar` section).
- **D-04:** Logout calls `POST /auth/logout` with `credentials: 'include'`, then returns to the login gate and clears rendered user data.

### Startup & data load flow

- **D-05 (before login):** On page load, **`GET /health` first** (public). If health fails → keep existing **connection `error-box`** UX (API down / CORS). If health succeeds → show login gate (do not flash the full panel).
- **D-06 (session probe):** After health OK, **`GET /users` with credentials** once. **200** → user already has cookie → show dashboard and run full data load (**D-07**). **401** → stay on login gate (expected for first visit).
- **D-07 (after login):** On successful login (or resumed session), load dashboard with **`Promise.all`** of `/health`, `/`, `/users` — same parallel pattern as today, all via updated `fetchJson`.
- **D-08:** **«Recargar datos»** reuses the post-login parallel load (not the pre-login health-only path).

### Error UX

- **D-09 (login failure 403):** Show API message **inline under the login form** — do **not** use the global `error-box` (reserved for connectivity/CORS).
- **D-10 (401 on protected data):** Use **`body.error` from JSON** when present; fallback: **«Inicia sesión para ver y gestionar usuarios»**. Re-show the **login gate** (not only a table empty state).
- **D-11 (401 mid-session, e.g. expired cookie):** Same as D-10 — return to login gate with API or fallback message; hide CRUD shell again.
- **D-12:** Network / fetch failures on login still distinguishable from auth failures (login form shows request error; connection card reflects health state).

### `fetchJson` refactor

- **D-13:** **Every** dashboard `fetch()` goes through **`fetchJson`** with default **`credentials: 'include'`** (merge into options so callers can override only if needed).
- **D-14:** Align error parsing with **`dashboard-react/src/api.js`**: on `!response.ok`, try `response.json()` for `body.error`; attach **`error.status = response.status`** on the thrown `Error`; message prefix remains Spanish lab style (`La petición a … ha fallado: …`).
- **D-15:** Callers that care about auth (`loadDashboardData`, login handler) branch on **`error.status === 401`** (and optionally **403** on login) per D-09–D-11.

### AUTH-12 (documentation)

- **D-16:** Add a short **«Clientes frontend»** subsection to **`api/README.md`** (auth section): vanilla `dashboard/app.js` and optional **`dashboard-react`** / **`dashboard-vue`** must use **`credentials: 'include'`** on all API `fetch` calls. Full narrative doc remains **Phase 21** (`docs/17-authentication.md`).

### Claude's Discretion

- HTML structure: dedicated `#login-gate` section vs overlay — keep markup readable for learners; match existing BEM-ish classes in `styles.css`.
- Subtle lab hint on login form (e.g. «Credenciales por defecto del lab: admin@lab.local / changeme») — optional, non-blocking helper text.
- Whether logout clears inline login error on success — yes, reset form state.
- Exact CSS for login gate (minimal new rules; reuse `card`, `toolbar` tokens).
- No automated browser tests in this phase unless planner ties to manual UAT checklist (no `npm test` in dashboard today).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone & requirements
- `.planning/ROADMAP.md` — Phase 19 goal and success criteria
- `.planning/REQUIREMENTS.md` — AUTH-10, AUTH-11, AUTH-12
- `.planning/PROJECT.md` — v1.5 milestone intent
- `.planning/phases/18-auth-api-protected-routes/18-CONTEXT.md` — cookie name, status codes, CORS, public vs protected routes
- `.planning/phases/18-auth-api-protected-routes/18-VERIFICATION.md` — API auth verification baseline
- `.planning/research/PITFALLS.md` — CORS + credentialed fetch pitfalls

### API contract
- `api/auth.js` — login/logout handlers, `requireAuth`, error strings
- `api/index.js` — route mounting, CORS config
- `api/README.md` — auth curl examples (extend for AUTH-12)
- `api/.env.example` — default operator credentials (reference only in UI hint)
- `api/openapi.yaml` — `cookieAuth`, 401 on `/users`

### Vanilla dashboard (primary implementation)
- `dashboard/index.html` — shell, toolbar, `error-box`, users table/form
- `dashboard/app.js` — `fetchJson`, `loadDashboardData`, render helpers, CRUD handlers
- `dashboard/styles.css` — visual tokens for new login gate

### Reference implementation (error parsing only — do not change in this phase)
- `dashboard-react/src/api.js` — target pattern for `fetchJson` errors + `error.status`

### Pedagogy & ports
- `CLAUDE.md` — ports 3100 / 5173, API ↔ dashboard contract
- `README.md` — learner entry (cross-link if planner updates root README)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`elements` object** — extend with login gate, form inputs, login error region, logout button refs.
- **`setOnlineState` / `setOfflineState` / `setLoadingState` / `showError`** — reuse; auth errors must not hijack `error-box` for login 403 (D-09).
- **`renderHealth` / `renderApiInfo` / `renderUsers`** — unchanged contract once data is fetched.
- **`dashboard-react/src/api.js`** — copy error-parsing behavior into vanilla `fetchJson` (D-14).

### Established Patterns
- Initial load calls `loadDashboardData()` at bottom of `app.js` — replace with **auth-aware bootstrap** (D-05–D-07).
- Spanish user-facing strings; API already returns Spanish `error` fields.
- CRUD mutations use `showMutationFeedback` — keep for POST/PUT/DELETE; 401 on mutation should trigger login gate (D-11).

### Integration Points
- `index.html`: add login gate markup (hidden by default or shown based on bootstrap); add logout button in toolbar.
- `app.js`: split **bootstrap** vs **loadDashboardData**; login submit handler; logout handler; gate visibility toggles.
- `api/README.md`: AUTH-12 paragraph for React/Vue + vanilla.
- **No changes** to `api/index.js` auth logic unless a bug is found — out of scope.

</code_context>

<specifics>
## Specific Ideas

- User wants the **Network tab lesson**: after login, learners should see **`Cookie`** on requests to `:3100` — plan UAT step explicitly.
- Login gate should feel like a **deliberate lab step**, not an error page — health card can still reflect API alive while login is shown.
- Keep **403 vs 401** semantics visible: wrong password (403, inline form) vs missing session (401, gate + API text).

</specifics>

<deferred>
## Deferred Ideas

- React/Vue login screens — not in v1.5; AUTH-12 is documentation cross-reference only.
- `docs/17-authentication.md`, Mission 14, NOTEBOOK auth narrative — **Phase 21**
- `JWT_SECRET` production fail-fast, Compose secrets, TLS nginx — **Phase 20**
- Remember-me, password reset, role-based UI — future milestone

</deferred>

---

*Phase: 19-Vanilla Dashboard Login*
*Context gathered: 2026-06-01*
