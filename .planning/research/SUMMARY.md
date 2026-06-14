# Project Research Summary

**Project:** EDF Lab Educativo  
**Domain:** Educational full-stack lab — E2E smoke auth + mandatory Postgres CI (v2.0 Quality & CI)  
**Researched:** 2026-06-14  
**Confidence:** HIGH overall (Playwright webServer, GHA Postgres service, verified auth contract); MEDIUM on CI timing for four concurrent dev servers

## Executive Summary

EDF Lab Educativo v2.0 is not a product-quality gate in the SaaS sense — it is a **confidence and teaching gate**. The milestone adds two orthogonal quality layers on top of the existing split architecture (Express `:3100`, vanilla `:5173`, React `:5174`, Vue `:5175`): **Playwright smoke auth E2E** across all three dashboards and a **mandatory Postgres CI job** on every PR. Experts building similar educational labs keep browser smoke and database integration tests **separate and parallel**: E2E validates the operator journey (login → protected data visible → logout) in real Chromium with httpOnly cookie auth; Postgres correctness stays in the existing `test:pg` API suite (16 tests). That split keeps CI fast enough for a beginner repo, avoids duplicating CRUD coverage already enforced by 24 SQLite + 16 Postgres API tests, and preserves the pedagogical lesson that `AUTH_DISABLED=1` is for supertest only — never for browser E2E.

The recommended approach is **minimal scope, maximal clarity**: add `@playwright/test` ^1.60.0 at the **repo root** (`e2e/` folder, root `package.json` devDependency — not in `api/` and not an isolated `e2e/package.json` lockfile), orchestrate four processes via Playwright's multi-`webServer` array (API on SQLite for speed, three frontends), run **Chromium-only** smoke specs with UI login (no `storageState` bypass), and extend `.github/workflows/ci.yml` to **three parallel jobs** — `test-sqlite` (unchanged), `test-postgres` (new, required), `e2e-smoke` (new, required). Branch protection should require all three checks.

Key risks are operational, not architectural: port conflicts from stale dev servers (`reuseExistingServer: !process.env.CI`), `AUTH_DISABLED` copy-paste into E2E env, login rate limits (10/15 min) under parallel workers, Postgres service health races in GHA, and selector drift across three UIs. Mitigations are documented in PITFALLS.md and mapped to phases 26–29 below.

---

## Key Findings

### Stack Additions (from STACK.md)

Existing stack unchanged: Express + Node 22, `node:sqlite` / `pg`, httpOnly cookie auth, three dashboards. v2.0 adds only:

| Addition | Version / pattern | Purpose |
|----------|-------------------|---------|
| `@playwright/test` | ^1.60.0 | Browser E2E smoke; native multi-`webServer`; Chromium only in CI |
| Root `e2e/` + root devDependency | — | Crosses `api/` + 3 dashboards; root already orchestrates `test:pg`, `compose:*` |
| Root `package-lock.json` | new | Generated when Playwright added at root |
| `postgres:16` GHA service | Docker Hub | Mandatory `test:pg` job; `localhost:5432` |
| `actions/setup-node` v4 | Node **22** | All three CI jobs aligned (required for `node:sqlite`) |
| Optional root `.nvmrc` | `22` | Align local/CI Node version |

**Explicitly avoid:** Cypress, Docker/Compose for E2E, `testcontainers`, `start-server-and-test`, Firefox/WebKit matrix, Percy/Applitools, Playwright in `api/package.json`, isolated `e2e/package.json`.

**E2E API backend:** SQLite (omit `DATABASE_URL`); isolated `DB_FILE` (e.g. `data/e2e.users.db`). Postgres validated only in `test-postgres` job.

### Feature Scope — Smoke Auth, 3 Dashboards (from FEATURES.md)

**Table stakes (must ship in v2.0):**

- One smoke spec per dashboard (`:5173`, `:5174`, `:5175`): unauthenticated gate → login (`admin@lab.local` / `changeme`) → users table with ≥1 data row → logout → gate returns
- Postgres CI job on every PR (`test:pg` + DB prepare)
- SQLite CI job preserved (`test:sqlite`, 24 tests)
- Playwright `webServer` orchestration (API + 3 frontends — no manual server assumption)
- Stable selectors: `getByRole` + `getByLabel`; optional shared `data-testid` hooks if brittle
- Auth via UI, not JWT injection or `storageState` bypass
- `.gitignore` for Playwright artifacts (`test-results/`, `playwright-report/`, `playwright/.auth/`)
- Docs + mission: run E2E locally; NOTEBOOK for real failures; README/CI badge update

**Differentiators (should have, align with lab values):**

- Shared selector contract across 3 UIs; Playwright projects per dashboard
- CI trace/screenshot on failure (`retain-on-failure`)
- Env-based credentials (`E2E_OPERATOR_EMAIL` / `E2E_OPERATOR_PASSWORD` with lab defaults)
- Mission 16 (E2E smoke practice)

**Defer (anti-features — do not build in v2.0):**

- Full CRUD E2E, visual regression, multi-browser matrix, E2E against Postgres, Page Object layers, API mocking, `storageState` as default, Cypress second runner, OAuth/refresh flows

**Success criteria:**

- PR cannot merge without `test:sqlite` + `test:pg` + Playwright smoke green
- Each dashboard smoke < 60s locally; CI E2E job < ~8 min wall clock
- Learner reproduces locally with one documented command
- Zero committed secrets or `.auth` state files

### Architecture — 3 CI Jobs (from ARCHITECTURE.md + STACK.md)

```
.github/workflows/ci.yml
├── test-sqlite      (existing — api/ npm ci + test:sqlite, AUTH_DISABLED=1)
├── test-postgres    (NEW — services.postgres:16 + test:pg, AUTH_DISABLED=1)
└── e2e-smoke        (NEW — Playwright + 4 webServers, AUTH_DISABLED unset)

e2e/                          (NEW — repo root)
├── playwright.config.js      (or .ts — see Open Questions)
├── fixtures/auth.ts          (loginAsAdmin, logout helpers)
└── specs/
    ├── auth-smoke.vanilla.spec.ts
    ├── auth-smoke.react.spec.ts
    └── auth-smoke.vue.spec.ts
```

**Job design:** Three **parallel** jobs, no `needs:` — wall clock ≈ max(sqlite, postgres, e2e); failure attribution clear (persistence vs auth UX vs SQLite regressions).

**E2E data flow:** Playwright → dashboard login form → `POST /auth/login` → `Set-Cookie: edf_session` → credentialed `fetch /users` → table visible → logout → gate returns.

**Postgres CI data flow:** GHA `postgres:16` healthy → `test:db:prepare` (or `POSTGRES_DB: edf_lab_test`) → `DATABASE_URL=postgresql://edf_lab:edf_lab_dev@localhost:5432/edf_lab_test` → `AUTH_DISABLED=1 npm run test:pg`.

**Component boundaries unchanged:** No required changes to `api/index.js` or dashboard code for minimal smoke — integration via env + CI orchestration. Admin seed reuses existing `seedAdminIfEmptyAccounts()` on `initDb()`.

**Synthesis note on Playwright placement:** STACK recommends root devDependency (single lock); ARCHITECTURE proposes isolated `e2e/package.json`. **Recommend STACK pattern** — one root lock, `npm run test:e2e`, fewer `npm ci` steps, matches minimal-deps lab goal.

### Critical Pitfalls — Watch Out For (from PITFALLS.md)

1. **Port conflicts / stale `reuseExistingServer`** — Learners leave tmux on 3100/5173–5175; E2E attaches to wrong process. → `reuseExistingServer: !process.env.CI`, strictPort on Vite, document `lsof` pre-flight, full 4-entry `webServer` with health URLs.

2. **`AUTH_DISABLED=1` in E2E** — Copy-paste from `test:sqlite` scripts; smoke passes without testing login. → Never set in Playwright `webServer.env` or E2E GHA job; real UI login only; grep CI for misuse.

3. **Cookie / origin scoping** — `edf_session` is per-origin; shared `storageState` across 5173/5174/5175 fails. → Separate Playwright projects per dashboard; UI login per origin in smoke (no shared auth file for v2.0); `.gitignore` `playwright/.auth/`.

4. **Login rate limit 429** — 10 attempts / 15 min / IP; parallel workers × retries × 3 dashboards exhaust limit. → `LOGIN_RATE_LIMIT_MAX=1000` in E2E CI env only; `workers: 1` in CI; `retries: 1` max; authenticate once per spec.

5. **Postgres GHA health timing** — `pg_isready` without `-d` races init; default 10s poll interval delays readiness. → `pg_isready -U edf_lab -d edf_lab_test`; `--health-interval 1s --health-retries 30`; explicit `test:db:prepare` if not using `POSTGRES_DB: edf_lab_test`.

6. **Selector drift (moderate)** — Copy/CSS changes break text selectors across vanilla/React/Vue. → Role + label first; add minimal `data-testid` in same phase as first E2E.

7. **CI time explosion (moderate)** — Browser install + 3 Vite `npm ci` on every PR. → Chromium only; smoke scope only; cache lockfiles + Playwright browsers; parallel jobs not sequential mega-job.

---

## Implications for Roadmap

Recommended phase order for v2.0 milestone (phases **26–29**):

### Phase 26 — Playwright E2E Foundation

**Rationale:** Establishes tooling, env contract, and vanilla smoke before multiplying dashboards. Lowest debugging surface (one origin, one frontend server + API).

**Delivers:** Root `e2e/` scaffold, `playwright.config.js` (API + vanilla `webServer`), `fixtures/auth.ts`, `auth-smoke.vanilla.spec.ts`, root `test:e2e` script, `.gitignore` entries, initial `e2e-smoke` CI job (vanilla-only acceptable as interim).

**Addresses:** Playwright install, webServer orchestration, vanilla smoke auth, stable selectors (vanilla), AUTH_DISABLED guardrails.

**Avoids:** Pitfalls 1 (ports), 2 (AUTH_DISABLED), 4 (rate limit — set CI env early), 9 (artifact gitignore).

**Research flag:** Standard Playwright patterns — skip `/gsd-research-phase` unless webServer timing fails on GHA.

### Phase 27 — Multi-Dashboard E2E

**Rationale:** Depends on Phase 26 config/fixtures; adds React/Vue projects and Vite `webServer` entries once vanilla is green.

**Delivers:** `auth-smoke.react.spec.ts`, `auth-smoke.vue.spec.ts`, per-project `baseURL`, extended CI with `dashboard-react` + `dashboard-vue` `npm ci`, optional `data-testid` parity across three UIs.

**Addresses:** React `:5174` and Vue `:5175` smoke parity; cross-framework selector contract.

**Avoids:** Pitfalls 3 (per-origin projects), 6 (selector drift), 10 (baseURL mismatch).

**Research flag:** Per-project vs shared `webServer` array — resolve in planning if Phase 26 used single array (extend) vs per-project (ARCHITECTURE pattern).

### Phase 28 — Postgres CI Required

**Rationale:** Independent of E2E browser stack; can run in parallel with 26–27 in wall-clock terms, but sequenced after E2E foundation so learners see browser confidence first. Delivers mandatory persistence gate without Playwright complexity.

**Delivers:** `test-postgres` GHA job (`postgres:16` service, health cmd, `DATABASE_URL`, `test:pg`), branch protection / README badge, `docs/10-tests.md` promoted from optional to required.

**Addresses:** QA-02 dual-DB teaching; Postgres regression on every PR.

**Avoids:** Pitfalls 5 (PG health race), 8 (E2E+PG coupling — keep jobs separate).

**Research flag:** Low — `docs/10-tests.md` snippet + official GHA Postgres docs are sufficient.

### Phase 29 — Quality & CI Learning Material

**Rationale:** Documents real failures after implementation; converts operational pain into NOTEBOOK entries and missions.

**Delivers:** `docs/` E2E section (local setup, CI diagram, httpOnly + Playwright), Mission 16 (or extend doc 10-tests), NOTEBOOK v2.0 entries (CORS, 429, webServer timeout, PG health, selector drift), teaching table on AUTH_DISABLED vs E2E, expected CI duration in README.

**Addresses:** Educational deliverable; learner can reproduce E2E locally; anti-patterns documented.

**Avoids:** Teaching pitfalls (E2E replaces API tests, AUTH_DISABLED for speed, one auth file for all origins).

**Research flag:** Skip — content derives from phases 26–28 outcomes.

### Phase Ordering Rationale

- **26 before 27:** One dashboard proves webServer + auth fixture before debugging three Vite servers.
- **28 can overlap 26–27 in calendar time** but is listed after E2E in roadmap for pedagogical sequencing (browser UX before persistence CI hardening).
- **29 last:** Learning material needs real error examples from green CI runs.
- **Three CI jobs ship incrementally:** Postgres job can land in 28 even if E2E is vanilla-only in 26; full triple-dashboard E2E completes in 27.

### Research Flags

| Phase | Deep research needed? | Notes |
|-------|----------------------|-------|
| 26 | No (standard) | Playwright webServer docs sufficient |
| 27 | Maybe | Per-project webServer vs single array — pick one in PLAN.md |
| 28 | No | GHA Postgres service well-documented |
| 29 | No | Derive from implementation |

---

## Open Questions

Resolve during `/gsd-plan-phase` for each phase:

1. **Playwright package placement:** STACK (root devDep) vs ARCHITECTURE (isolated `e2e/package.json`). **Recommend root** — confirm in Phase 26 PLAN.md.

2. **Postgres DB bootstrap in CI:** STACK uses `POSTGRES_DB: edf_lab_test` (skip prepare); ARCHITECTURE uses `POSTGRES_DB: edf_lab` + `npm run test:db:prepare`. **Recommend:** `POSTGRES_DB: edf_lab_test` + health `-d edf_lab_test`; keep prepare step if grants/ownership require it (verify against `prepare-test-db.js`).

3. **webServer topology:** Single 4-entry array (STACK) vs per-project webServer with duplicated API (ARCHITECTURE). **Recommend:** Start with single array in 26; split to per-project in 27 only if port/API lifecycle conflicts appear.

4. **Config format:** `playwright.config.js` (STACK, matches lab JS style) vs `.ts` (ARCHITECTURE). **Recommend `.js`** unless root gains TS toolchain.

5. **Invalid-credentials step in smoke:** FEATURES lists as optional cheap step; adds login attempts toward rate limit. **Defer** unless zero flake in 26.

6. **Phase 28 vs 26 ordering:** Postgres CI has fewer dependencies and could ship first for faster value. **Current roadmap:** 26→27→28→29 per PITFALLS phase map; consider parallel PR tracks if calendar pressure.

7. **E2E CI env for rate limit:** Exact var name (`LOGIN_RATE_LIMIT_MAX=1000` vs `E2E=1` flag) — align with existing `api/auth.js` env parsing in Phase 26.

8. **`storageState` for local dev speed:** Document as advanced reto in 29, not v2.0 baseline (FEATURES + PITFALLS agree).

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Playwright 1.60.0 verified; GHA Postgres pattern matches `docs/10-tests.md`; repo ports/scripts confirmed |
| Features | HIGH | Auth contract verified in `api/auth.js`; missions 14/15 define manual smoke to automate |
| Architecture | HIGH | Baseline CI and seed paths verified; minor tension on e2e/ package placement resolved toward STACK |
| Pitfalls | HIGH (codebase) / MEDIUM (CI timing) | Rate limit and PG health from official + community sources; four-server boot timing needs GHA validation |

**Overall confidence:** HIGH

### Gaps to Address

- **Four concurrent webServer boot on GHA** — Validate timeout values (120s Vite) in first CI green run; adjust in Phase 26/27.
- **Selector stability across React/Vue** — May require minimal `data-testid` during Phase 27; decide after Phase 26 vanilla green.
- **Postgres prepare vs POSTGRES_DB** — Single decision in Phase 28 PLAN.md after reading `prepare-test-db.js` behavior.
- **ARCHITECTURE vs STACK placement** — Lock root devDep pattern in Phase 26 to avoid mid-milestone restructure.

---

## Sources

### Primary (HIGH confidence)

- [Playwright webServer](https://playwright.dev/docs/test-webserver) — multi-server array, `reuseExistingServer`, `baseURL` rule
- [Playwright Authentication](https://playwright.dev/docs/auth) — `storageState`, httpOnly cookies, `.auth/` gitignore
- [GitHub Actions PostgreSQL service containers](https://docs.github.com/en/actions/use-cases-and-examples/using-containerized-services/creating-postgresql-service-containers)
- Repo: `api/auth.js`, `api/package.json`, `.github/workflows/ci.yml`, `docs/10-tests.md`, `docker-compose.yml`
- `.planning/PROJECT.md` — v2.0 milestone goals, ports, constraints

### Secondary (MEDIUM confidence)

- [github/docs PR #43243](https://github.com/github/docs/pull/43243) — GHA health-interval 1s recommendation
- [Playwright PR #40869](https://github.com/microsoft/playwright/pull/40869) — per-project webServer
- Community PG init race reports — `pg_isready -d` mitigation

### Research artifacts (detail)

- `.planning/research/STACK.md` — stack additions, CI YAML target, npm scripts
- `.planning/research/FEATURES.md` — smoke scenarios, anti-features, cookie handling
- `.planning/research/ARCHITECTURE.md` — 3-job structure, e2e/ layout, phased build order
- `.planning/research/PITFALLS.md` — phase 26–29 warnings, teaching pitfalls

---
*Research completed: 2026-06-14*  
*Ready for roadmap: yes*
