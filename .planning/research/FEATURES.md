# Feature Landscape

**Domain:** E2E smoke auth + Postgres CI for educational full-stack lab (v2.0 Quality & CI)  
**Researched:** 2026-06-14  
**Overall confidence:** HIGH (Playwright official docs + verified project auth contract)

## Executive framing

For EDF Lab Educativo, **smoke auth E2E** is not a product-quality gate in the SaaS sense — it is a **confidence + teaching** gate. The milestone should prove that the three dashboards still complete the operator journey (login → protected data visible → logout) against a real browser, while **Postgres correctness stays in the API test suite** (`test:pg`). That split keeps CI fast enough for a beginner repo and avoids duplicating CRUD coverage already enforced by 24 SQLite + 16 Postgres API tests.

Industry smoke auth typically follows one of two patterns:

| Pattern | When used | Fit for this lab |
|---------|-----------|------------------|
| **UI login in test** | Few tests; auth flow is the subject | **Recommended for v2.0** — matches Mission 14/15 pedagogy |
| **`storageState` reuse** | Many tests; login is overhead | Defer — hides `credentials: 'include'` lesson |

This project uses **httpOnly cookie `edf_session`** (JWT, `sameSite: 'lax'`, cross-origin `localhost:5173|5174|5175` → `localhost:3100`). Playwright handles Set-Cookie from credentialed `fetch()` automatically; `document.cookie` will **not** show the session — inspect via `page.context().cookies()` when debugging.

---

## Table Stakes

Features users (and maintainers) expect. Missing any of these makes v2.0 feel incomplete.

| Feature | Why expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Smoke auth E2E — vanilla `:5173`** | Primary learner path; regression on login gate + table | Medium | One spec: unauthenticated gate → login → table rows → logout → gate returns |
| **Smoke auth E2E — React `:5174`** | v1.4/v1.6 promised framework parity | Medium | Same assertions; `LoginGate` component differs from vanilla DOM |
| **Smoke auth E2E — Vue `:5175`** | Same parity contract | Medium | Composition API state; same Spanish copy as React |
| **Postgres CI job on every PR** | QA-02; dual-DB teaching is core | Medium | Separate job from E2E; `test:db:prepare` + `npm run test:pg` |
| **SQLite CI job preserved** | Fast signal; host-dev default | Low | Already on `main`; keep on PRs |
| **Service orchestration for E2E** | Tests must not assume manually started servers | Medium | Playwright `webServer` (or GHA steps) for API + 3 frontends |
| **Stable selectors** | Flake-free CI | Low–Med | `getByRole` + `getByLabel`; optional shared `data-testid` hooks |
| **Auth via UI, not bypass** | Lab teaches real cookie flow | Low | Do **not** inject JWT manually in smoke specs |
| **`.gitignore` for Playwright artifacts** | Security + repo hygiene | Low | `playwright/.auth/`, `test-results/`, reports |
| **Doc + mission: run E2E locally** | Educational deliverable | Medium | Mirror `docs/10-tests.md` pattern; NOTEBOOK for real failures |
| **CI badge / README update** | Visibility of new gates | Low | Postgres + E2E status |

### Test scenarios per dashboard (minimum smoke)

Each dashboard gets **one focused spec** (or one parameterized project). Steps are identical in intent; locators may differ slightly.

```
1. Visit dashboard base URL (fresh context, no cookies)
   → expect: login gate visible ("Iniciar sesión")
   → expect: users table / dashboard panel NOT visible

2. Submit invalid credentials (optional but cheap)
   → expect: error message visible; still on gate

3. Submit valid operator credentials
   email: admin@lab.local
   password: changeme
   → expect: login gate hidden
   → expect: users table visible with ≥1 data row (not "Cargando…" / empty-state only)
   → expect: table header columns ID / Nombre / Email (or row containing seed email)

4. Click "Cerrar sesión"
   → expect: login gate visible again
   → expect: users table not visible

5. (Optional assertion) context cookies for localhost:3100
   → after login: edf_session present (httpOnly)
   → after logout: edf_session cleared or expired
```

**Vanilla-specific hooks:** `#login-gate`, `#dashboard-panel`, `#users-table-body`, `#logout-button`, `#login-email`, `#login-password`.

**React/Vue-specific hooks:** `LoginGate` with `#login-email` / `#login-password`; `UsersTable` as `getByRole('table')`; logout button `getByRole('button', { name: /cerrar sesión/i })`.

**Do not assert in smoke:** CRUD form submit, edit/delete buttons, health card values, API version strings, Network tab pedagogy (manual mission only).

---

## Differentiators

Valuable for an educational lab; not required for a minimal CI gate, but align with project values.

| Feature | Value proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Shared selector contract across 3 UIs** | Teaches testability as a cross-framework concern | Medium | Minimal `data-testid` on login fields + table wrapper |
| **Playwright projects per dashboard** | One config, three parallel smoke paths | Low | `vanilla`, `react`, `vue` projects with different `baseURL` |
| **NOTEBOOK entries for E2E failures** | Real errors → documented learning | Low | CORS, rate limit 429, webServer timeout, selector drift |
| **Mission 16 (E2E smoke)** | Executable practice mirroring CI | Medium | `npx playwright test` + optional UI mode |
| **Doc section: httpOnly + Playwright** | Bridges Mission 14/15 and automation | Low | Why `context.cookies()` beats `document.cookie` |
| **CI artifact on failure** | trace/screenshot for debugging PRs | Low | `retain-on-failure` only |
| **Parallel CI jobs** | Wall clock ≈ max(sqlite, pg, e2e) | Low | Three jobs, not one sequential pipeline |
| **Env-based test credentials** | Avoid hardcoding in specs | Low | `E2E_OPERATOR_EMAIL` / `E2E_OPERATOR_PASSWORD` with lab defaults |

---

## Anti-Features

Explicitly **not** building in v2.0. Document as deferred or out of scope.

| Anti-feature | Why avoid | What to do instead |
|--------------|-----------|-------------------|
| **Full CRUD E2E** | 24+16 API tests already cover mutations; 3× browsers × 4 operations = flake + CI cost | Keep CRUD in `index.test.js` / `index.pg.test.js`; manual Mission 14/15 for browser CRUD |
| **Visual regression / screenshot diff** | High maintenance; low teaching value for auth milestone | Defer to future QA milestone if ever needed |
| **`storageState` setup project as default** | Skips login UI; students never see automated auth flow | Use UI login in smoke; document `storageState` as advanced reto in doc |
| **Multi-browser matrix (firefox/webkit)** | 3× CI time for marginal gain in lab | Chromium only in CI; mention local `--project=firefox` as optional |
| **E2E against Postgres in v2.0** | Couples browser flake to DB service readiness; API `test:pg` already proves PG | E2E on SQLite API (`DB_FILE` isolated); PG mandatory in separate job |
| **Page Object abstraction layer** | Over-engineering for 3 one-minute tests | Plain specs + shared `loginAsOperator(page)` helper at most |
| **Mocking API in E2E** | Defeats purpose of integration smoke | Real API via `webServer` |
| **OAuth / refresh-token flows** | Out of scope per PROJECT.md | Stay on email/password + JWT cookie |
| **Rate-limit bypass in prod path** | Hides real 429 UX | Use single login per spec; avoid retry loops that hammer `/auth/login` |
| **Checking in `playwright/.auth/`** | Session impersonation risk | `.gitignore` + ephemeral CI contexts |
| **Cypress second runner** | Dependency sprawl | Playwright only (QA-01 allows either; pick one) |

---

## Cookie / session handling in Playwright

### How it works with this stack

1. User submits login form → browser `fetch('http://localhost:3100/auth/login', { credentials: 'include' })`.
2. API responds `Set-Cookie: edf_session=…; HttpOnly; SameSite=Lax`.
3. Browser stores cookie for API origin (`localhost:3100`).
4. Subsequent `fetch('/users', { credentials: 'include' })` sends cookie cross-origin (CORS allows origins `5173–5175`).
5. Playwright's default context **isolates cookies per test** — good for logout assertions.

### Recommended handling for smoke tests

| Concern | Recommendation | Confidence |
|---------|----------------|------------|
| Fresh unauthenticated start | Default — no `storageState` in smoke project | HIGH |
| Verify cookie set | `const cookies = await page.context().cookies('http://localhost:3100')` → find `edf_session` | HIGH |
| Verify cookie cleared | After logout, `edf_session` absent or empty value | HIGH |
| Cross-origin | No manual `addCookies` needed if UI login used | HIGH |
| JWT expiry (24h) | Irrelevant for CI smoke; single run << expiry | HIGH |
| `secure: true` in production | CI uses `NODE_ENV` ≠ production → `secure: false` on localhost | MEDIUM |

### `storageState` — document, don't default

Playwright's [authentication guide](https://playwright.dev/docs/auth) recommends `storageState` for suites with many authenticated tests. For v2.0:

- **Smoke specs:** UI login every time (3 logins per CI run — acceptable).
- **Future / reto:** `auth.setup.ts` + `storageState` for a hypothetical CRUD E2E suite or local dev speed — teach as optimization, not baseline.

### API-request auth alternative (not for smoke)

`request.newContext()` + `POST /auth/login` + `storageState()` is valid for **API-only** setup but **bypasses dashboard login gate** — use only in advanced docs, not v2.0 smoke.

---

## Parallel vs serial execution

### Recommendation: parallel dashboards, serial steps within spec

| Layer | Mode | Rationale |
|-------|------|-----------|
| **Across dashboards** (vanilla / react / vue) | **Parallel** (Playwright projects or `fullyParallel: true`) | Independent origins, isolated contexts, no shared DB mutation in smoke |
| **Within one smoke spec** | **Serial** (login before table assert before logout) | Natural `await` order; use `test.describe.configure({ mode: 'serial' })` only if splitting into multiple tests in one file |
| **CI jobs** (sqlite ∥ postgres ∥ e2e) | **Parallel** | Minimize wall clock |
| **Workers on CI** | **2–3 workers** | Playwright default capped; enough for 3 projects without oversubscribing GHA |
| **Auth setup project** | **Not needed** for v2.0 | No `dependencies: ['setup']` — each smoke logs in once |

### Rate limiting interaction

API login rate limit: **10 attempts / 15 min** (`createLoginRateLimiter`). Three parallel smokes + optional invalid-login step = ~6 attempts — safe. Avoid `retries: 3` on login-heavy tests (could trigger 429).

### `webServer` startup

| Service | Port | Start strategy |
|---------|------|----------------|
| API | 3100 | `cd api && PORT=3100 npm start` (SQLite for E2E job) |
| Vanilla | 5173 | `python3 -m http.server 5173` in `dashboard/` |
| React | 5174 | `npm run dev -- --host` in `dashboard-react/` |
| Vue | 5175 | `npm run dev -- --host` in `dashboard-vue/` |

Playwright supports **multiple `webServer` entries** — start all four; set `reuseExistingServer: !process.env.CI`. Wait for URL or stdout `"listening"` / `"Local:"` before tests.

**Serial alternative (simpler CI, slower):** one job, `workers: 1` — only if parallel proves flaky; not default.

---

## Flakiness risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| **Servers not ready** | High without `webServer` | Multi-`webServer` config; generous `timeout` (120s); health poll on `:3100/health` |
| **Table still loading** | Medium | `expect(table.getByRole('row')).not.toHaveText(/cargando/i)`; wait for row with digit in ID cell |
| **Vite dev server slow on GHA** | Medium | `--host 127.0.0.1`; consider `vite preview` after build for CI stability (tradeoff: build step) |
| **Selector drift** (copy/CSS) | Medium | Role + label first; add `data-testid` in same phase as E2E |
| **CORS / cookie not sent** | Low if unchanged | Assert `edf_session` cookie after login; fails fast |
| **Login 429** | Low | Minimal retries; don't parallelize multiple login attempts per dashboard |
| **Postgres not ready** (PG job only) | Medium | `pg_isready -d edf_lab_test`; `test:db:prepare`; separate from E2E |
| **Shared operator account** | Low for smoke | Read-only assertions; no concurrent CRUD in E2E |
| **React strict mode double-mount** | Low | Use `toBeVisible` with auto-wait, not `count()` immediately |

**Retries:** `retries: process.env.CI ? 1 : 0` for smoke — enough for infra blips, not enough to mask systematic failure.

---

## Feature dependencies

```
API auth (edf_session cookie) ──► E2E smoke (all dashboards)
       │
       ├──► test:sqlite (CI, AUTH_DISABLED)
       └──► test:pg (CI, AUTH_DISABLED, separate job)

Dashboard login gate ──► smoke step 1 (gate visible)
Dashboard credentialed fetch ──► smoke step 3 (table data)
Logout handler ──► smoke step 4 (gate returns)

Stable selectors (optional testids) ──► low-flake cross-framework specs
```

**Important split:** Postgres CI validates **persistence layer**; E2E validates **browser auth wiring**. They complement; neither replaces the other.

---

## MVP recommendation (v2.0 scope)

### Prioritize

1. Three dashboard smoke specs (login → table ≥1 row → logout)
2. Playwright root config + `webServer` for API + 3 frontends
3. Postgres CI job required on PR (`test:pg` + prepare)
4. Chromium-only, parallel projects
5. Doc + NOTEBOOK + Mission for local E2E
6. Minimal `data-testid` parity (if role selectors prove brittle in implementation)

### Defer

| Item | Reason |
|------|--------|
| Full CRUD E2E | API tests + manual missions sufficient |
| Visual regression | No teaching goal in v2.0 |
| `storageState` auth setup | Optimization for larger suites later |
| E2E on Postgres | API PG job covers DB; reduces CI coupling |
| Firefox/WebKit in CI | Cost vs benefit |
| Invalid-login spec | Nice-to-have; add only if zero extra flake |
| `/health` DB ping | Optional hardening; not blocking smoke |

### Success criteria (feature-level)

- [ ] PR cannot merge without `test:sqlite` + `test:pg` + Playwright smoke green
- [ ] Each dashboard smoke completes in < 60s locally
- [ ] CI E2E job < ~8 min wall clock (with caching)
- [ ] Learner can reproduce locally with one documented command
- [ ] Zero committed secrets or `.auth` state files

---

## Sources

| Source | Used for | Confidence |
|--------|----------|------------|
| [Playwright Authentication](https://playwright.dev/docs/auth) | `storageState`, `.auth/` gitignore, httpOnly cookies | HIGH |
| [Playwright Test Parallelism](https://playwright.dev/docs/test-parallel) | workers, `fullyParallel`, isolation | HIGH |
| [Playwright Test Configuration](https://playwright.dev/docs/test-configuration) | `webServer`, projects, retries | HIGH |
| [Playwright Test Retries](https://playwright.dev/docs/test-retries) | serial mode, retry policy | HIGH |
| `api/auth.js` | `edf_session`, cookie options, rate limit | HIGH |
| `.planning/PROJECT.md` | v2.0 milestone goals, ports, constraints | HIGH |
| `missions/14-auth-vanilla-login-crud.md`, `missions/15-framework-auth-login-crud.md` | Manual smoke steps to automate | HIGH |
| `.planning/research/PITFALLS.md` | Postgres CI race, selector drift, CI cost | HIGH |

---
*Research for milestone v2.0 Quality & CI — FEATURES focus*
