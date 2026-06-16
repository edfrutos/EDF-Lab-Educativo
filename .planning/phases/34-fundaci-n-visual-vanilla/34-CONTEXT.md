# Phase 34: Fundación visual vanilla - Context

**Gathered:** 2026-06-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver the first stable Playwright visual regression baseline for the vanilla dashboard (`:5173`): one post-login snapshot with committed baselines, anti-flake masking policy, and a local `npm run test:visual` entry point. React/Vue snapshots, CI job, and Mission 18 belong to later phases.

</domain>

<decisions>
## Implementation Decisions

### Qué capturar
- **D-01:** Snapshot principal = **dashboard post-login** (login gate hidden, users area visible) — not the login gate screen.
- **D-02:** Capture region = **main authenticated content** (`#dashboard-panel`), excluding the pre-login gate.
- **D-03:** Auth preparation reuses **`auth-smoke-flow.js`** patterns (same `#login-email` / `#login-password` / `Entrar` selectors); visual helper orchestrates login only (no logout in visual spec).
- **D-04:** **One primary snapshot** in phase 34 (`dashboard-post-login` naming). Additional states deferred to later phases if needed.

### Estabilidad de datos (anti-flake)
- **D-05:** Apply **Playwright screenshot masks** on dynamic zones: health timestamp (`#health-timestamp`) and any other volatile status text identified during implementation.
- **D-06:** **Mask `tbody#users-table-body`** so CRUD E2E rows from other suites do not cause pixel drift.
- **D-07:** **Disable animations/transitions** before screenshot (inject CSS or equivalent) in addition to waiting for stable layout.
- **D-08:** Initial threshold **`maxDiffPixelRatio: 0.01`** (tunable in plan 34-02 if CI/local drift requires it).

### Granularidad del snapshot
- **D-09:** `toHaveScreenshot` targets **`#dashboard-panel`** locator (authenticated main panel), not full page.
- **D-10:** Fixed viewport **1280×720** for reproducibility (aligned with Desktop Chrome baseline).
- **D-11:** Baselines live under **`e2e/__snapshots__/visual.vanilla.spec.js/`** via `snapshotPathTemplate`.
- **D-12:** Baseline name by state: **`dashboard-post-login.png`** (explicit, didactic naming).

### Estructura de config y scripts
- **D-13:** **Extend `e2e/playwright.config.js`** with a dedicated project (e.g. `vanilla-chromium-visual`) matching `visual.*.spec.js` — no separate config file in phase 34.
- **D-14:** Add **`npm run test:visual`** for local Chromium vanilla visual run only in phase 34.
- **D-15:** Reuse existing **quad `webServer`** (API + three dashboards) for consistency with E2E harness even though only vanilla is tested.
- **D-16:** New helper **`e2e/helpers/visual-flow.js`** with `prepareVisualState(page)` + mask/animation utilities; do not extend `auth-smoke-flow.js` with screenshot logic.

### Claude's Discretion
- Exact CSS injection approach for animation disable (page.addStyleTag vs evaluate).
- Whether to mask additional minor dynamic fields inside `#dashboard-panel` beyond `#health-timestamp` and `#users-table-body` if flakes appear during verification.
- Precise `snapshotPathTemplate` string as long as baselines land under `e2e/__snapshots__/`.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone & requirements
- `.planning/ROADMAP.md` — Phase 34 goal, success criteria, plans 34-01/34-02
- `.planning/REQUIREMENTS.md` — QA-VIS-01, QA-VIS-03 (snapshot policy, vanilla baselines)
- `.planning/PROJECT.md` — v2.2 Visual Regression constraints (Playwright native, no external SaaS)

### E2E harness (reuse, do not break)
- `e2e/playwright.config.js` — quad `webServer`, project pattern, existing vanilla-chromium project
- `e2e/helpers/auth-smoke-flow.js` — login selectors and post-login expectations (`John Doe` visible)
- `e2e/helpers/crud-flow.js` — reference for helper structure; explains why table body must be masked
- `e2e/tests/auth-smoke.vanilla.spec.js` — vanilla auth smoke pattern

### Dashboard DOM (snapshot targets)
- `dashboard/index.html` — `#dashboard-panel`, `#health-timestamp`, `#users-table-body`, `#login-gate`

### Documentation (update in 34-02 draft, full in phase 37)
- `docs/10-tests.md` — existing E2E/CI matrix; add visual regression section draft in wave 2

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `auth-smoke-flow.js`: login flow and stable post-login assertions (`table` visible, `John Doe` text).
- `playwright.config.js`: `webServer` quad stack, `vanilla-chromium` project, `testMatch` pattern per dashboard.
- `dashboard/index.html`: `#dashboard-panel` wraps all post-login UI; clear mask targets for dynamic data.

### Established Patterns
- Helpers in `e2e/helpers/` exported as named functions; specs stay thin.
- E2E uses isolated `api/data/e2e.users.db` with seeded users — functional tests may add rows; visual must mask table body.
- Spanish role/label selectors (`Entrar`, `Cerrar sesión`) — keep consistent with smoke/CRUD specs.

### Integration Points
- New `visual.vanilla.spec.js` + `visual-flow.js` alongside existing smoke/CRUD specs.
- New Playwright project in same config; `package.json` script `test:visual`.
- Baselines committed under `e2e/__snapshots__/`.

</code_context>

<specifics>
## Specific Ideas

- User explicitly chose Playwright native `toHaveScreenshot` at milestone level — no Percy/Chromatic.
- Prefer didactic clarity: one named snapshot (`dashboard-post-login`) over auto-generated multi-state coverage in phase 34.
- Masking strategy chosen over relying solely on fixed seed — teaches real-world visual test stability.

</specifics>

<deferred>
## Deferred Ideas

- Login gate snapshot — useful but out of phase 34 scope (single post-login snapshot locked).
- `storageState` auth shortcut — evaluate in phase 36 if CI speed requires it.
- `test:visual:update` dedicated script — can be added in 34-02 or documented via `--update-snapshots` flag.
- Minimal webServer (API + vanilla only) — rejected for phase 34; quad reuse preferred.
- React/Vue visual specs — phase 35.
- CI visual job — phase 36.
- Mission 18 / NOTEBOOK v2.2 — phase 37.

</deferred>

---

*Phase: 34-Fundación visual vanilla*
*Context gathered: 2026-06-16*
