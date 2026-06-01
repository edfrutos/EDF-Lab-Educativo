# Phase 16: Vue Dashboard Parity - Context

**Gathered:** 2026-06-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver `dashboard-vue/`: a Vite + Vue 3 app that reproduces the same dashboard behavior as vanilla and `dashboard-react/` (parallel load of `/health`, `/`, `/users`; full CRUD; loading/offline/error states; duplicate-email 409 UX) against `http://localhost:3100` without changing API JSON contracts.

Framework comparison documentation (`docs/16-frameworks.md`), Mission 13, and unified three-dashboard UAT belong to Phase 17 — not Phase 16.

</domain>

<decisions>
## Implementation Decisions

### Visual & UX
- **D-01:** Use **Tailwind CSS v4** with `@tailwindcss/vite` in `dashboard-vue/` — same stack and similar utility classes as `dashboard-react/` (vanilla `styles.css` unchanged).
- **D-02:** Section layout **matches `dashboard-react/`** visual structure (hero, toolbar, health, API info, users + form, explanation, error panel).
- **D-03:** Reuse **same Spanish copy** as `dashboard/index.html` (titles, labels, button text) — same rule as Phase 15.
- **D-04:** Global styles in **`src/index.css`** with `@import 'tailwindcss'` (mirror React).

### Vue structure & pedagogy
- **D-05:** Use **`<script setup>`** with **Composition API** (not Options API).
- **D-06:** **Single File Components (`.vue`) only** for UI; shared HTTP in **`src/api.js`** (no separate composable file required for state — see D-08).
- **D-07:** Component split and names **mirror React**: `App.vue`, `ConnectionStatus`, `HealthCard`, `ApiInfoCard`, `UsersTable`, `UserForm` (`.vue` filenames).
- **D-08:** **Lifted state in `App.vue`** with `ref()` primitives — parallel to React `App.jsx` + `useState` (user preference: explicit loose `ref()` values, not one big `reactive()` blob).
- **D-09:** Child communication via **props down / emits up** (no Pinia, no provide/inject in v1.4).
- **D-10:** Didactic emphasis: README or brief comments should support **contrasting Vue (`ref`/reactivity) with both React (`useState`) and vanilla** (top-level variables) — detailed comparison doc stays Phase 17.

### Parity & HTTP
- **D-11:** Primary implementation reference: **`dashboard-react/`** (proven parity); **`dashboard/app.js`** as behavioral ground truth if React and vanilla diverge.
- **D-12:** **`src/api.js`** — same logic as React: `API_BASE_URL` from `import.meta.env.VITE_API_BASE_URL`, `fetchJson()` with `error.status` on failure (no axios).
- **D-13:** After successful mutations — **reload full dashboard data** (`loadDashboardData` equivalent), matching vanilla/React.
- **D-14:** Edit flow — same as vanilla/React: Edit fills form, Cancel resets, `editingUserId` tracked in `App.vue`.
- **D-15:** Dev server port **5175** with **`strictPort: true`** in `vite.config.js`.
- **D-16:** Provide **`.env.example`** with `VITE_API_BASE_URL=http://localhost:3100`.

### Errors & feedback
- **D-17:** Duplicate email **409** — show **both** global mutation feedback **and** inline hint under the email field (same as Phase 15 / React).
- **D-18:** Initial load failure — **global error panel** and cleared placeholder data (vanilla `error-box` / React pattern).
- **D-19:** Delete — native **`confirm()`** before DELETE (vanilla/React parity).
- **D-20:** Success feedback strings — same as React: `POST /users -> usuario creado`, `PUT /users/:id -> usuario actualizado`, `DELETE /users/:id -> usuario eliminado`.

### API / CORS
- **D-21:** **No change** to `api/index.js` for CORS in phase 16 unless verification fails (`cors()` already permissive); **verify** CRUD from `:5175` and document in plan/UAT.

### Documentation (phase 16 scope)
- **D-22:** **`dashboard-vue/README.md`** plus **optional pointer in root `README.md`** (advanced optional path; vanilla `:5173` remains primary).
- **D-23:** Create **`16-UAT.md`** manual checklist for Vue on `:5175` (mirror Phase 15 structure).
- **D-24:** Do **not** write `docs/16-frameworks.md` or Mission 13 in this phase — Phase 17 (FRWK-09, FRWK-10).
- **D-25:** **NOTEBOOK.md** entries for Vue setup errors — only if real errors occur during implementation; systematic framework NOTEBOOK section is Phase 17 (FRWK-12).

### Claude's Discretion
- Exact Tailwind class mapping tweaks in `.vue` files.
- Whether `npm run vue:dev` alias exists at repo root (prefer `cd dashboard-vue && npm run dev` unless trivial).
- Minor layout polish that does not change API contract or CRUD parity.
- Default planner choices where user selected "planner discretion" above.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone & requirements
- `.planning/REQUIREMENTS.md` — FRWK-04, FRWK-05
- `.planning/ROADMAP.md` — Phase 16 success criteria
- `.planning/research/SUMMARY.md` — v1.4 architecture defaults
- `.planning/research/STACK.md` — Vite, Vue 3, ports 5174/5175
- `.planning/research/PITFALLS.md` — CORS, ports, visible `fetch`

### Phase 15 (React reference implementation)
- `.planning/phases/15-react-dashboard-parity/15-CONTEXT.md` — locked UX/error decisions
- `.planning/phases/15-react-dashboard-parity/15-UAT.md` — UAT pattern to mirror
- `dashboard-react/` — primary scaffold/parity template
- `dashboard-react/src/api.js`, `dashboard-react/src/App.jsx`, `dashboard-react/src/components/`

### Vanilla & API contract
- `dashboard/app.js` — behavioral ground truth
- `dashboard/index.html` — Spanish copy and section structure
- `CLAUDE.md` — API ↔ dashboard contract
- `api/index.js` — endpoints, 409 responses, CORS
- `docs/04-dashboard-fetch.md`, `docs/05-cors-explicado.md`

### Project rules
- `AGENTS.md` — didactic restraint (no Pinia/router in v1.4)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `dashboard-react/` — full working parity: `api.js`, component split, Tailwind layout, 409 dual feedback, port 5174.
- `dashboard/app.js` — canonical `loadDashboardData`, CRUD, `getMutationErrorMessage` behavior.
- `dashboard-react/vite.config.js` — pattern for `strictPort` and Tailwind plugin.

### Established Patterns
- `VITE_API_BASE_URL` with default `http://localhost:3100`.
- Framework apps are sibling folders; vanilla on `:5173` stays primary narrative.
- No Redux/Pinia/router/axios in v1.4 milestone.

### Integration Points
- New folder `dashboard-vue/` at repo root.
- Root `README.md` optional advanced section (React already documented).
- Phase 17 will consume all three dashboards for comparison doc and mission.

</code_context>

<specifics>
## Specific Ideas

- User wants **explicit `ref()`** teaching (not a single opaque `reactive()` state object).
- User locked **409 dual feedback** and **16-UAT.md** for Vue.
- User chose **mirror React** for structure, api.js, and component names — fastest path to FRWK-05.
- Comparison doc and NOTEBOOK framework section explicitly **deferred to Phase 17**.

</specifics>

<deferred>
## Deferred Ideas

- **`docs/16-frameworks.md`** — Phase 17 (FRWK-09)
- **Mission 13** (three-dashboard guided exercise) — Phase 17 (FRWK-10)
- **Unified FRWK-13 UAT across all three dashboards** — Phase 17 (Vue gets `16-UAT.md` only in this phase)
- **Systematic NOTEBOOK framework section** — Phase 17 unless real errors during Phase 16 implementation (D-25)
- **Pinia / Vue Router** — out of scope v1.4
- **Explicit CORS origin whitelist** — only if `:5175` verification fails (D-21)

</deferred>

---

*Phase: 16-vue-dashboard-parity*
*Context gathered: 2026-06-01*
