# Phase 22: React Dashboard Auth - Context

**Gathered:** 2026-06-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Add **login and logout UI** to `dashboard-react/` (`:5174`) so learners can operate protected `/users` CRUD with the **httpOnly cookie** session from Phase 18, mirroring vanilla Phase 19 behavior in React + Tailwind. Refactor bootstrap and error handling so **401** returns to the login gate with Spanish API messages. Satisfy **FRWK-AUTH-01**, **FRWK-AUTH-02**, **FRWK-AUTH-03**, **FRWK-AUTH-04**.

**Not in this phase:** Vue login (Phase 23), CI/rate limiting (Phase 24), docs/Mission 15 (Phase 25), API auth changes (Phase 18 — locked), vanilla dashboard changes.

</domain>

<decisions>
## Implementation Decisions

### Milestone baseline (locked — carry forward from Phase 18–19)

- **D-00a:** Session is **httpOnly cookie** `edf_session` — use `credentials: 'include'`, never `localStorage`.
- **D-00b:** `POST /auth/login` → **403** + `{ error: 'Credenciales inválidas' }`; protected routes → **401** + `{ error: 'Sesión no válida o expirada. Inicia sesión.' }`.
- **D-00c:** Lab defaults: `admin@lab.local` / `changeme` (from `api/.env.example`).
- **D-00d:** CORS allows `:5174` with `credentials: true` (Phase 18).
- **D-00e:** `dashboard-react/src/api.js` already sets `credentials: 'include'` on `fetchJson` — verify all paths use it; add `login()` / `logout()` here (FRWK-AUTH-02).

### Component architecture

- **D-01:** Dedicated **`LoginGate.jsx`** component — email/password form, inline login error, lab credentials hint. App.jsx orchestrates visibility.
- **D-02:** Auth session state as **`useState` in App.jsx** — e.g. `isAuthenticated`, `loginError`, `isBootstrapping` (no custom `useAuth` hook in this phase).
- **D-03:** **`login()` and `logout()` exported from `api.js`** alongside `fetchJson` — single HTTP module for React (and reference for Phase 23 Vue).
- **D-04:** **Bootstrap `useEffect` in App.jsx`** — same sequence as vanilla Phase 19: `GET /health` → `GET /users` probe with credentials → show gate or `loadDashboardData`.

### Login gate visuals (Tailwind)

- **D-05:** **Centered card layout** — `rounded-xl`, `border`, `shadow-sm` (parallel to vanilla `#login-gate` card, using existing React slate/indigo palette).
- **D-06:** **Show lab credentials hint** under the form: `admin@lab.local` / `changeme` (educational, non-secret defaults).
- **D-07:** **Use existing React Tailwind theme** (indigo accents, slate neutrals) — do not port vanilla `styles.css` colors.
- **D-08:** **Logout button in toolbar** — same row as «Recargar datos» (Phase 19 D-03 parity).

### Bootstrap & shell visibility

- **D-09:** **Full shell hidden until authenticated** — no hero, toolbar, CRUD, or pedagogy sections while on login gate (Phase 19 D-01).
- **D-10:** **`isBootstrapping` loading state** — show «Comprobando sesión…» (or equivalent) during health + `/users` probe; avoid flashing dashboard before 401.
- **D-11 (after login / resumed session):** `Promise.all` of `/health`, `/`, `/users` via `fetchJson` — same as current `loadDashboardData`.
- **D-12:** **«Recargar datos»** reuses post-auth `loadDashboardData` only (not pre-login probe path).

### Error UX

- **D-13 (login 403):** Show API `body.error` **inline under login form** (`loginError` state) — not the global `loadError` rose panel.
- **D-14 (401 on load or mutation):** **Immediately return to login gate** — set `isAuthenticated` false, `clearDashboardData()`, show gate with API message from `error.message` (fetchJson already embeds Spanish `body.error`).
- **D-15 (401 fallback):** If no API text, use **«Inicia sesión para ver y gestionar usuarios»**.
- **D-16:** Network/CORS failures during bootstrap use existing **connection error panel** semantics; distinguish from auth failures.
- **D-17:** On successful logout, reset login form state and clear `loginError`.

### Claude's Discretion

- Exact prop names for `LoginGate` (`onSubmit`, `error`, `isSubmitting`).
- Minor Tailwind spacing/typography within D-05/D-07 constraints.
- Whether bootstrap loading is a full-screen spinner vs text-only — keep minimal.
- `dashboard-react/README.md` one-paragraph auth note (optional if planner folds into implementation plan).
- No automated browser tests unless planner adds manual UAT checklist.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone & requirements
- `.planning/ROADMAP.md` — Phase 22 goal and success criteria
- `.planning/REQUIREMENTS.md` — FRWK-AUTH-01 … FRWK-AUTH-04
- `.planning/PROJECT.md` — v1.6 milestone intent

### Prior phase context (parity targets)
- `.planning/phases/19-vanilla-dashboard-login/19-CONTEXT.md` — bootstrap flow, gate, 401/403 UX (primary behavioral reference)
- `.planning/phases/15-react-dashboard-parity/15-CONTEXT.md` — React structure, Tailwind, lifted state in App
- `.planning/phases/18-auth-api-protected-routes/18-CONTEXT.md` — cookie name, status codes, CORS

### API contract
- `api/auth.js` — login/logout handlers, error strings
- `api/index.js` — route mounting, CORS origins including 5174
- `api/.env.example` — default operator credentials (hint text only)

### React dashboard (primary implementation)
- `dashboard-react/src/App.jsx` — bootstrap, auth gating, CRUD handlers
- `dashboard-react/src/api.js` — extend with `login()` / `logout()`; `fetchJson` already has credentials
- `dashboard-react/src/components/*.jsx` — existing CRUD components (unchanged contract post-auth)
- `dashboard-react/README.md` — port 5174, env setup

### Vanilla reference (behavioral parity)
- `dashboard/app.js` — auth bootstrap, gate toggles, 401 branches
- `dashboard/index.html` — login gate markup reference

### Pedagogy
- `docs/17-autenticacion.md` — credentialed fetch concepts (cross-link only; full framework comparison is Phase 25)
- `CLAUDE.md` — ports 3100 / 5173 / 5174

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`fetchJson` in `api.js`** — already includes `credentials: 'include'` and `error.status` parsing (aligned with vanilla Phase 19 D-14).
- **`App.jsx` lifted state** — extend with `isAuthenticated`, `isBootstrapping`, `loginError`; gate wraps existing main JSX.
- **CRUD components** — `UserForm`, `UsersTable`, `HealthCard`, etc. unchanged once authenticated.
- **`loadDashboardData` / `clearDashboardData`** — reuse; add 401 branch to flip `isAuthenticated` false.

### Established Patterns
- `useEffect` on mount calls `loadDashboardData` today — **replace** with auth-aware bootstrap (D-04).
- Global `loadError` rose panel for connectivity — keep for CORS/API down; auth 403 stays on login form (D-13).
- `handleMutationError` — extend: if `error.status === 401`, trigger gate (D-14) instead of only mutation feedback.

### Integration Points
- New file: `dashboard-react/src/components/LoginGate.jsx`
- Modify: `dashboard-react/src/api.js` (`login`, `logout`)
- Modify: `dashboard-react/src/App.jsx` (conditional render, bootstrap, logout handler, toolbar button)
- **No changes** to `api/index.js` unless auth bug found — out of scope.

</code_context>

<specifics>
## Specific Ideas

- User wants **educational parity with vanilla Phase 19** — React is the second teaching surface for the same auth flow; Phase 23 Vue should copy this structure.
- **LoginGate.jsx** as a named component so learners see framework component boundaries explicitly.
- Lab credentials hint on screen reduces friction during missions (user chose show hint).
- Network tab lesson: after login, requests to `:3100` should show **Cookie** header — plan UAT step.

</specifics>

<deferred>
## Deferred Ideas

- Vue login UI — **Phase 23**
- `docs/16-frameworks.md` auth section, Mission 15 — **Phase 25**
- GitHub Actions, rate limiting — **Phase 24**
- React Context / custom hooks for auth — out of scope; keep state visible in App for teaching
- Remember-me, password reset — v2+

</deferred>

---

*Phase: 22-react-dashboard-auth*
*Context gathered: 2026-06-02*
