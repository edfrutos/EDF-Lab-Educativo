# Phase 35: Visual multi-dashboard - Context

**Gathered:** 2026-06-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Extend Playwright visual regression to React (`:5174`) and Vue (`:5175`) using the same post-login snapshot contract as phase 34, without duplicating preparation logic. Each dashboard gets its own committed baseline; CI visual job and Mission 18 remain in later phases.

</domain>

<decisions>
## Implementation Decisions

### Paridad DOM (React/Vue)
- **D-01:** **Add minimal visual IDs** to React and Vue dashboards — same three selectors used by `visual-flow.js`: `#dashboard-panel`, `#login-gate`, `#health-timestamp`. Pattern mirrors phase 31 CRUD ID parity (educational, reusable helper).
- **D-02:** **Minimal scope only** — do not replicate every vanilla `index.html` ID; only the three required for visual snapshots and existing masks.
- **D-03:** **Placement targets:**
  - `#login-gate` → root wrapper of `LoginGate` component (React/Vue).
  - `#dashboard-panel` → authenticated main content container in `App.jsx` / `App.vue` (post-login branch, equivalent to vanilla panel excluding pre-login gate).
  - `#health-timestamp` → element rendering health timestamp in `HealthCard` (React/Vue).

### Heredado de fase 34 (no re-discutir)
- **D-04:** Reuse **`visual-flow.js` unchanged** — `prepareVisualState` + `getVisualScreenshotOptions` (login, masks, threshold, viewport).
- **D-05:** Same snapshot state: **`dashboard-post-login.png`** on `#dashboard-panel` locator, one test per dashboard.
- **D-06:** Same anti-flake policy: mask `#health-timestamp` + `#users-table-body`, `maxDiffPixelRatio: 0.01`, animations disabled, viewport **1280×720**.
- **D-07:** Specs: **`visual.react.spec.js`** and **`visual.vue.spec.js`** — thin wrappers like `visual.vanilla.spec.js`.
- **D-08:** Playwright projects **`react-chromium-visual`** and **`vue-chromium-visual`** (mirror `vanilla-chromium-visual`); extend `test:visual` to run **all three** projects (3 tests total).
- **D-09:** **Separate baselines per dashboard** under `e2e/__snapshots__/{spec-file}/` — snapshots are comparable in *state* (post-login panel), not pixel-identical across frameworks (React/Vue styling differs from vanilla).
- **D-10:** Keep **quad `webServer`**; no separate visual config file; do not include visual projects in `test:e2e` / `test:e2e:ci`.

### Claude's Discretion
- Exact JSX/Vue markup for `#dashboard-panel` wrapper (single `main` vs inner `div`) as long as locator captures authenticated panel content and excludes login gate.
- Whether `#login-gate` is hidden via conditional render (React/Vue) vs `hidden` attribute — assertions use `toBeHidden()` / not visible after login.
- Order of plan waves: UI ID changes may land in 35-01 alongside specs or as prerequisite task within wave 1.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone & requirements
- `.planning/ROADMAP.md` — Phase 35 goal, success criteria, plans 35-01/35-02
- `.planning/REQUIREMENTS.md` — QA-VIS-02
- `.planning/phases/34-fundaci-n-visual-vanilla/34-CONTEXT.md` — visual contract (masks, threshold, snapshot naming)
- `.planning/phases/34-fundaci-n-visual-vanilla/34-VERIFICATION.md` — verified vanilla baseline

### Visual harness (extend, do not break)
- `e2e/helpers/visual-flow.js` — shared prepare + screenshot options
- `e2e/tests/visual.vanilla.spec.js` — pattern for react/vue specs
- `e2e/playwright.config.js` — `vanilla-chromium-visual`, `snapshotPathTemplate`, quad `webServer`
- `package.json` — `test:visual` (extend to 3 dashboards)

### Dashboard DOM (add IDs in this phase)
- `dashboard/index.html` — reference for `#dashboard-panel`, `#login-gate`, `#health-timestamp`
- `dashboard-react/src/App.jsx`, `dashboard-react/src/components/LoginGate.jsx`, `dashboard-react/src/components/HealthCard.jsx`
- `dashboard-vue/src/App.vue`, `dashboard-vue/src/components/LoginGate.vue`, `dashboard-vue/src/components/HealthCard.vue`

### Prior CRUD parity precedent
- `e2e/helpers/crud-flow.js` — shared helper across three dashboards after ID alignment (phase 31)

### Documentation
- `docs/10-tests.md` — extend visual section for React/Vue in plan 35-02

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `visual-flow.js` already documents fase 35 reuse; expects `#dashboard-panel`, `#login-gate`, `#health-timestamp`.
- `visual.vanilla.spec.js` is the template for react/vue specs (credentials, describe in Spanish).
- React/Vue already share `#login-email`, `#login-password`, `#users-table-body` from CRUD work.

### Gap to close
- React/Vue **lack** `#dashboard-panel`, `#login-gate`, `#health-timestamp` — phase 35 adds them before or with first visual specs.

### Established Patterns
- Playwright visual project per dashboard: `vanilla-chromium-visual` with isolated `testMatch`.
- Baselines committed per spec file path via `snapshotPathTemplate`.

### Integration Points
- `dashboard-react/` and `dashboard-vue/` — minimal ID additions in App + LoginGate + HealthCard.
- `e2e/playwright.config.js` — two new visual projects, update `package.json` `test:visual`.

</code_context>

<specifics>
## Specific Ideas

- User chose **add IDs in React/Vue** over extending helper or per-spec selectors — keeps one visual contract across three dashboards (same didactic line as CRUD).
- User chose **minimal visual IDs** (3) over full vanilla HTML parity.

</specifics>

<deferred>
## Deferred Ideas

- Cross-dashboard pixel diff (vanilla vs React vs Vue) — out of scope; each framework has own baseline.
- CI visual job — phase 36.
- `storageState` auth shortcut — phase 36 if needed.
- Mission 18 / NOTEBOOK v2.2 — phase 37.

</deferred>

---

*Phase: 35-Visual multi-dashboard*
*Context gathered: 2026-06-16*
