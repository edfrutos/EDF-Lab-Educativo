# Phase 23: Vue Dashboard Auth - Context

**Gathered:** 2026-06-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Add **login and logout UI** to `dashboard-vue/` (`:5175`) so learners can operate protected `/users` CRUD with the **httpOnly cookie** session from Phase 18, achieving **parity with React Phase 22** and vanilla Phase 19. Satisfy **FRWK-AUTH-05**, **FRWK-AUTH-06**.

**Not in this phase:** CI/rate limiting (Phase 24), framework auth docs/Mission 15 (Phase 25), API auth changes (Phase 18 — locked), React/vanilla changes.

</domain>

<decisions>
## Implementation Decisions

### Milestone baseline (locked — Phases 18–19)

- **D-00a:** Session is **httpOnly cookie** `edf_session` — `credentials: 'include'`, never `localStorage`.
- **D-00b:** `POST /auth/login` → **403** + `{ error: 'Credenciales inválidas' }`; protected routes → **401** + Spanish API error.
- **D-00c:** Lab defaults: `admin@lab.local` / `changeme`.
- **D-00d:** CORS allows `:5175` with `credentials: true` (Phase 18).
- **D-00e:** `dashboard-vue/src/api.js` already sets `credentials: 'include'` on `fetchJson` — add `login()` / `logout()` (FRWK-AUTH-06).

### Parity reference (Phase 22 — primary implementation template)

- **D-01:** Behavioral parity with **`dashboard-react/` Phase 22** — same bootstrap sequence, gate UX, 401/403 handling, toolbar logout.
- **D-02:** Plan split mirrors Phase 22: **23-01** (api.js + LoginGate.vue), **23-02** (App.vue + README + UAT).

### Vue component architecture

- **D-03:** Dedicated **`LoginGate.vue`** SFC — email/password form, inline error, lab hint (mirror `LoginGate.jsx`).
- **D-04:** **Lifted auth state in `App.vue`** with `ref()` — `isAuthenticated`, `isBootstrapping`, `loginError`, `isLoginSubmitting` (Phase 16 D-08; parallel to React `useState`).
- **D-05:** **Child communication via emits** — `LoginGate` emits **`login`** with `(email, password)`; parent `@login="handleLogin"`. Props: `error`, `isSubmitting` (Vue idiomatic; contrasts with React callback prop for Phase 17 doc).
- **D-06:** **`login()` and `logout()` in `api.js`** — same signatures as React `api.js`.

### Bootstrap & shell visibility

- **D-07:** **`bootstrapAuth` on `onMounted`** — `GET /health` → `GET /users` probe → gate or `loadDashboardData` (Phase 19 / 22).
- **D-08:** **Full shell hidden until authenticated** — no hero, toolbar, CRUD, pedagogy on gate (Phase 22 D-09).
- **D-09:** **`isBootstrapping`** — show «Comprobando sesión…» during probe.
- **D-10:** Post-auth **`loadDashboardData`** unchanged pattern; «Recargar datos» calls it only.

### Template rendering (Claude discretion — Vue idiomatic)

- **D-11:** Single **`<template>` with `v-if` / `v-else-if` / `v-else`** blocks for bootstrapping, unauthenticated (gate + optional connection error), and authenticated dashboard — equivalent to React early returns, readable for Vue learners.

### Login gate visuals

- **D-12:** **Tailwind card** matching React LoginGate (slate/indigo, `rounded-xl`, border, shadow).
- **D-13:** **Lab credentials hint** visible: `admin@lab.local` / `changeme`.
- **D-14:** **Logout** in toolbar beside «Recargar datos».

### Error UX (locked from Phase 22)

- **D-15:** Login **403** → inline `loginError` on LoginGate, not global `loadError` panel.
- **D-16:** **401** on load or mutation → immediate gate: `isAuthenticated = false`, `clearDashboardData()`, `loginError` from API message.
- **D-17:** **401 fallback:** «Inicia sesión para ver y gestionar usuarios».
- **D-18:** Health/CORS failure during bootstrap → rose connection panel + gate view.
- **D-19:** Logout clears `loginError` and form state.

### Claude's Discretion

- Exact emit name (`login` vs `submit-login`).
- Minor Tailwind class tweaks within D-12.
- `dashboard-vue/README.md` auth section wording.
- Manual UAT checklist in plan (no browser automation).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone & requirements
- `.planning/ROADMAP.md` — Phase 23 goal and success criteria
- `.planning/REQUIREMENTS.md` — FRWK-AUTH-05, FRWK-AUTH-06

### Primary implementation reference (parity target)
- `.planning/phases/22-react-dashboard-auth/22-CONTEXT.md`
- `dashboard-react/src/App.jsx`
- `dashboard-react/src/api.js`
- `dashboard-react/src/components/LoginGate.jsx`

### Prior phase context
- `.planning/phases/19-vanilla-dashboard-login/19-CONTEXT.md` — behavioral ground truth
- `.planning/phases/16-vue-dashboard-parity/16-CONTEXT.md` — Vue structure, ref(), SFC, port 5175

### API contract
- `api/auth.js` — login/logout, error strings
- `api/index.js` — CORS including 5175

### Vue dashboard (primary implementation)
- `dashboard-vue/src/App.vue`
- `dashboard-vue/src/api.js`
- `dashboard-vue/src/components/*.vue`
- `dashboard-vue/README.md`

### Pedagogy
- `docs/17-autenticacion.md` — credentialed fetch (full framework comparison Phase 25)
- `CLAUDE.md` — ports 5173 / 5174 / 5175

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`fetchJson` in `api.js`** — already has `credentials: 'include'` and `error.status`.
- **`App.vue`** — `<script setup>` + `ref()` pattern from Phase 16; extend with auth refs.
- **Child components** — unchanged post-auth; props/emits pattern established.

### Established Patterns
- `onMounted(() => loadDashboardData())` — **replace** with `bootstrapAuth()`.
- Global `loadError` rose panel — connectivity only after auth; 401 uses gate.
- `handleMutationError` — add 401 branch like React `App.jsx`.

### Integration Points
- New: `dashboard-vue/src/components/LoginGate.vue`
- Modify: `dashboard-vue/src/api.js` (`login`, `logout`)
- Modify: `dashboard-vue/src/App.vue` (v-if blocks, handlers, toolbar logout)
- Modify: `dashboard-vue/README.md` (remove AUTH_DISABLED-as-primary)

</code_context>

<specifics>
## Specific Ideas

- User wants **LoginGate.vue** as named SFC for component-boundary teaching (contrast React JSX and vanilla DOM).
- **`emit('login')`** chosen explicitly for Vue idiomatic parent/child flow — document in README for Phase 17/25 comparison.
- **Strict behavioral parity** with Phase 22; only Vue syntax differs (`ref`, `v-if`, `emit`).

</specifics>

<deferred>
## Deferred Ideas

- `docs/16-frameworks.md` auth section — Phase 25
- Mission 15 — Phase 25
- Pinia / composable `useAuth` — out of scope; keep refs visible in App.vue
- CI, rate limiting — Phase 24

</deferred>

---

*Phase: 23-vue-dashboard-auth*
*Context gathered: 2026-06-02*
