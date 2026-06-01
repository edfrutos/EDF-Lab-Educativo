# Phase 15: React Dashboard Parity - Context

**Gathered:** 2026-06-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver `dashboard-react/`: a Vite + React app that reproduces vanilla dashboard behavior (load health/API/users, CRUD, loading/offline/error states) against `http://localhost:3100` without changing API JSON contracts. Vue and comparison docs belong to phases 16–17.

</domain>

<decisions>
## Implementation Decisions

### Visual & UX
- **D-01:** Use **Tailwind CSS** in `dashboard-react/` (new dev dependency; vanilla keeps `styles.css` unchanged).
- **D-02:** Section layout — **planner discretion**; default target is functional parity with vanilla sections (hero, toolbar, health, API info, users table, user form).
- **D-03:** Reuse **same Spanish copy** as `dashboard/index.html` (titles, labels, button text).

### React structure
- **D-04:** Component split mirrors vanilla: `App`, connection status, API info, `UsersTable`, `UserForm` (names may vary; responsibilities fixed).
- **D-05:** Shared HTTP layer in **`src/api.js`** — exports `API_BASE_URL` (from `import.meta.env.VITE_API_BASE_URL`) and `fetchJson()`; keep `fetch` visible (no axios).
- **D-06:** **Lifted state in `App`** — props to children (parallel to vanilla `elements` + top-level variables).

### State & forms
- **D-07:** **`useState`** for `currentUsers`, `editingUserId`, loading/online flags — no `useReducer`, no Redux in phase 15.
- **D-08:** After mutations — **planner discretion**; default **reload full dashboard data** (`loadDashboardData` equivalent) to match vanilla.
- **D-09:** Edit flow — **planner discretion**; default **same as vanilla** (Edit fills form, Cancel resets).

### Errors & feedback
- **D-10:** Offline / failed fetch — **planner discretion**; default **global error panel** clearing data (vanilla `error-box` behavior).
- **D-11:** Duplicate email **409** — show **both** global `mutation-feedback` **and** inline hint under email field.

### Tooling & ports
- **D-12:** Dev server port **5174** (from v1.4 research); document alongside vanilla `:5173`.
- **D-13:** React version — **planner discretion**; default **React 18 LTS** unless Vite template strongly favors 19.
- **D-14:** npm scripts — **planner discretion**; default **`dashboard-react/package.json` only**; optional mention in root README without required root scripts.
- **D-15:** Provide **`.env.example`** with `VITE_API_BASE_URL=http://localhost:3100`.

### API / CORS
- **D-16:** **No change** to `api/index.js` for CORS in phase 15 (`cors()` already permissive); **verify** CRUD from `:5174` and document in plan/UAT.

### Claude's Discretion
- Tailwind setup (`@tailwindcss/vite` vs classic PostCSS) and exact class mapping to vanilla layout.
- Whether to add root-level `npm run react:dev` alias (prefer documenting `cd dashboard-react && npm run dev` unless trivial).
- Minor UX polish that does not change API contract or CRUD parity.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone & requirements
- `.planning/REQUIREMENTS.md` — FRWK-01, FRWK-02, FRWK-03, FRWK-06, FRWK-07, FRWK-08
- `.planning/ROADMAP.md` — Phase 15 success criteria
- `.planning/research/SUMMARY.md` — stack and architecture defaults
- `.planning/research/STACK.md` — Vite, ports, folder names
- `.planning/research/PITFALLS.md` — CORS, ports, fetch visibility

### Vanilla reference (parity target)
- `dashboard/app.js` — fetch, state, CRUD, error helpers
- `dashboard/index.html` — copy and section structure
- `dashboard/styles.css` — visual reference (React uses Tailwind instead)

### API contract
- `CLAUDE.md` — API ↔ dashboard contract table
- `api/index.js` — endpoints and CORS
- `docs/04-dashboard-fetch.md` — fetch flow pedagogy
- `docs/05-cors-explicado.md` — browser boundary

### Project rules
- `AGENTS.md` — didactic mission format, dependency restraint (Tailwind justified as framework styling lesson)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `dashboard/app.js` — canonical behavior: `loadDashboardData`, `fetchJson`, `renderUsers`, form submit, 409 handling pattern.
- `dashboard/index.html` — DOM sections to mirror in JSX.
- `api/index.js` — unchanged; `parseUserId`, 409 on duplicate email.

### Established Patterns
- `API_BASE_URL` hardcoded in vanilla → React uses `VITE_API_BASE_URL` with same default.
- `elements` object → React lifted state + props (educational parallel).
- Separate `api/` and `dashboard/` folders — `dashboard-react/` continues separation per CLAUDE.md.

### Integration Points
- New folder `dashboard-react/` at repo root sibling to `dashboard/`.
- Optional one-line README pointer; no dashboard/nginx changes in phase 15.

</code_context>

<specifics>
## Specific Ideas

- User chose **Tailwind** for React (not copying `styles.css`) — phase 17 comparison doc must call out styling stack difference vs vanilla.
- User wants **409 shown twice** (global + inline email) for clearer learning moment.
- User insisted on **area-by-area** discussion — all six areas covered in DISCUSSION-LOG.

</specifics>

<deferred>
## Deferred Ideas

- **Vue dashboard** — Phase 16
- **docs/16-frameworks.md` + Mission 13** — Phase 17
- **Explicit CORS origin whitelist** — optional hardening; not required if verification passes (D-16)
- **useReducer / React Query** — out of scope v1.4; may mention in phase 17 doc only
- **Containerizing Vite dev in Compose** — deferred per v1.4 research

</deferred>

---

*Phase: 15-react-dashboard-parity*
*Context gathered: 2026-06-01*
