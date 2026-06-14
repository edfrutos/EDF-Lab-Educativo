# Architecture Patterns — v2.0 E2E + Postgres CI

**Domain:** Educational Express lab with triple dashboards and dual persistence  
**Researched:** 2026-06-14  
**Milestone:** v2.0 Quality & CI  
**Overall confidence:** HIGH (stack verified in repo; Playwright/GA patterns from official docs)

## Executive Summary

v2.0 adds **two orthogonal quality layers** on top of the existing split architecture (`api/` :3100, `dashboard/` :5173, `dashboard-react/` :5174, `dashboard-vue/` :5175):

1. **Postgres CI job** — runs the existing `api/index.pg.test.js` suite against a GitHub Actions `services.postgres` container. No browser, no Playwright, no change to the HTTP contract.
2. **Playwright E2E job** — smoke auth (`login → users table visible → logout`) in real Chromium against each dashboard, with the API started in **SQLite test-isolation mode** (not Postgres).

Keep these jobs **separate and parallel**. They share auth semantics (`edf_session` cookie, `ADMIN_EMAIL`/`ADMIN_PASSWORD` seed) but not infrastructure. Branch protection should require **all three** jobs: `test-sqlite`, `test-postgres`, `test-e2e`.

---

## Current Architecture (baseline)

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser (vanilla :5173 | React :5174 | Vue :5175)              │
│    fetch(..., { credentials: 'include' })                       │
└────────────────────────────┬────────────────────────────────────┘
                             │ CORS + httpOnly cookie
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  api/ Express :3100                                             │
│    cookie-parser → cors(credentials) → /auth/* → requireAuth      │
│    db.js router → SQLite (host) | PostgreSQL (DATABASE_URL)     │
└────────────────────────────┬────────────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
     api/data/users.db              PostgreSQL :5432
     (host dev + E2E CI)            (Compose + test:pg CI)
```

**CI today:** single job `test-sqlite` → `api/npm run test:sqlite` (24 tests, `AUTH_DISABLED=1`).

**Auth seed (already implemented):** `api/seed.js` → `seedAdminIfEmptyAccounts()` on `initDb()` when `accounts` is empty. Defaults: `admin@lab.local` / `changeme` from `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

---

## Target Architecture (v2.0)

```
.github/workflows/ci.yml
├── job: test-sqlite      (unchanged — fast gate)
├── job: test-postgres    (NEW — services.postgres + test:pg)
└── job: test-e2e         (NEW — Playwright + 4 webServers)

e2e/                      (NEW — repo-root package)
├── playwright.config.ts
├── package.json
├── fixtures/auth.ts
└── specs/
    ├── auth-smoke.vanilla.spec.ts
    ├── auth-smoke.react.spec.ts
    └── auth-smoke.vue.spec.ts
```

### Why E2E uses SQLite, not Postgres

| Concern | SQLite in E2E job | Postgres in E2E job |
|---------|-------------------|---------------------|
| Job complexity | API only via `webServer` | Needs `services.postgres` + `prepare-test-db` + `DATABASE_URL` |
| Parallel CI | Independent of Postgres job | Couples browser tests to DB service startup |
| Pedagogy | E2E teaches **auth UX**; Postgres job teaches **persistence** | Blurs two learning goals |
| Existing tests | Mirrors `test:sqlite` isolation (`DB_FILE`) | Duplicates `test:pg` concerns |

**Recommendation:** E2E job = SQLite + isolated `DB_FILE`. Postgres job = API integration tests only. Revisit Postgres-backed E2E only if a future milestone needs cross-stack Compose verification.

---

## `e2e/` Folder Structure

```txt
e2e/
├── package.json                 # @playwright/test; scripts test / test:ui
├── package-lock.json
├── playwright.config.ts         # webServer array + projects
├── .env.example                 # documents E2E_* vars (never secrets in git)
├── fixtures/
│   └── auth.ts                  # loginAsAdmin(page), logout(page), ADMIN creds
├── specs/
│   ├── auth-smoke.vanilla.spec.ts
│   ├── auth-smoke.react.spec.ts
│   └── auth-smoke.vue.spec.ts
└── README.md                    # local run: prereqs, ports, troubleshooting
```

### Root `package.json` additions

```json
{
  "scripts": {
    "test:e2e": "npm run test --prefix e2e",
    "test:e2e:ui": "npm run test:ui --prefix e2e"
  }
}
```

### `e2e/package.json` (minimal)

```json
{
  "name": "edf-lab-e2e",
  "private": true,
  "scripts": {
    "test": "playwright test",
    "test:ui": "playwright test --ui"
  },
  "devDependencies": {
    "@playwright/test": "^1.52.0"
  }
}
```

**Dependency placement:** Playwright lives in `e2e/`, not `api/`. Keeps the educational boundary (API tests = Node test runner; browser tests = separate package) and avoids pulling Chromium into the backend tree.

---

## `playwright.config.ts` — `webServer` Array

Playwright supports **multiple `webServer` entries as an array**; all entries start **in parallel** and Playwright waits until each `url` responds ([official docs](https://playwright.dev/docs/test-webserver), HIGH confidence).

When using an array, **`use.baseURL` must be set explicitly** per project (not inferred from a single `port`).

### Recommended config (single job, three projects)

```typescript
import { defineConfig, devices } from '@playwright/test';
import path from 'path';

const repoRoot = path.resolve(__dirname, '..');

const apiEnv = {
  PORT: '3100',
  JWT_SECRET: 'e2e-ci-secret-not-for-production',
  ADMIN_EMAIL: process.env.E2E_ADMIN_EMAIL ?? 'admin@lab.local',
  ADMIN_PASSWORD: process.env.E2E_ADMIN_PASSWORD ?? 'changeme',
  DB_FILE: 'data/e2e.users.db',
  CORS_ORIGINS: 'http://localhost:5173,http://localhost:5174,http://localhost:5175',
};

const apiServer = {
  command: 'node index.js',
  cwd: path.join(repoRoot, 'api'),
  url: 'http://localhost:3100/health',
  name: 'API',
  timeout: 120_000,
  reuseExistingServer: !process.env.CI,
  env: apiEnv,
};

export default defineConfig({
  testDir: './specs',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'vanilla',
      testMatch: /auth-smoke\.vanilla\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:5173' },
      webServer: [
        apiServer,
        {
          command: 'python3 -m http.server 5173',
          cwd: path.join(repoRoot, 'dashboard'),
          url: 'http://localhost:5173',
          name: 'Vanilla',
          timeout: 60_000,
          reuseExistingServer: !process.env.CI,
        },
      ],
    },
    {
      name: 'react',
      testMatch: /auth-smoke\.react\.spec.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:5174' },
      webServer: [
        apiServer,
        {
          command: 'npm run dev',
          cwd: path.join(repoRoot, 'dashboard-react'),
          url: 'http://localhost:5174',
          name: 'React',
          timeout: 120_000,
          reuseExistingServer: !process.env.CI,
        },
      ],
    },
    {
      name: 'vue',
      testMatch: /auth-smoke\.vue\.spec.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:5175' },
      webServer: [
        apiServer,
        {
          command: 'npm run dev',
          cwd: path.join(repoRoot, 'dashboard-vue'),
          url: 'http://localhost:5175',
          name: 'Vue',
          timeout: 120_000,
          reuseExistingServer: !process.env.CI,
        },
      ],
    },
  ],
});
```

### Design notes

| Topic | Decision | Rationale |
|-------|----------|-----------|
| Per-project `webServer` | API duplicated per project config | Playwright 1.48+ supports project-level `webServer`; only the selected `--project` launches its servers ([PR #40869](https://github.com/microsoft/playwright/pull/40869), MEDIUM-HIGH) |
| `reuseExistingServer: !process.env.CI` | Fresh processes in CI | Prevents port conflicts on runners |
| Health probe | `http://localhost:3100/health` | Public route; no auth required |
| `AUTH_DISABLED` | **Not set** in E2E | Smoke tests must exercise real login gate |
| `DB_FILE` | `data/e2e.users.db` | Isolated from dev `users.db` and API test DBs |
| Vite dashboards | `npm run dev` (not `preview`) | Matches local dev docs; `strictPort: true` already in vite configs |

### Alternative: CI matrix (defer to reto)

```yaml
strategy:
  matrix:
    project: [vanilla, react, vue]
# run: npx playwright test --project=${{ matrix.project }}
```

Faster wall-clock (3 parallel runners) but triple Playwright browser install cost. Start with **one `test-e2e` job** for simplicity; matrix is an advanced optimization.

### Parallel `webServer` caveat

All servers in one project's array start **simultaneously** — the API must not depend on a separate migration step finishing first. This lab satisfies that: `initDb()` runs inside `node index.js` before `listen()`, seeding schema + admin + users atomically.

---

## Admin Seeding for E2E

E2E does **not** need a new seed script. Reuse the existing bootstrap:

```
API start → initDb() → seedAdminIfEmptyAccounts()
  if accounts empty:
    INSERT admin from ADMIN_EMAIL / ADMIN_PASSWORD (bcrypt hash)
  populate users from users.json if users empty
```

### Environment contract

| Variable | E2E local | E2E CI | Source |
|----------|-----------|--------|--------|
| `ADMIN_EMAIL` | `admin@lab.local` | `admin@lab.local` | `api/.env.example` default |
| `ADMIN_PASSWORD` | `changeme` | `changeme` | `api/.env.example` default |
| `JWT_SECRET` | any non-empty dev value | `e2e-ci-secret-...` | Required for consistent cookie signing |
| `DB_FILE` | `data/e2e.users.db` | same | Isolation from dev data |
| `AUTH_DISABLED` | **unset** | **unset** | Must not bypass auth in smoke tests |

### `fixtures/auth.ts`

```typescript
import type { Page } from '@playwright/test';

export const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? 'admin@lab.local';
export const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? 'changeme';

export async function loginAsAdmin(page: Page) {
  await page.goto('/');
  await page.getByLabel(/email/i).fill(ADMIN_EMAIL);
  await page.getByLabel(/contraseña|password/i).fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: /iniciar sesión/i }).click();
}

export async function expectUsersTableVisible(page: Page) {
  // Vanilla: #users-table-body with seed rows
  // React/Vue: table body with "John Doe" seed user
  await page.getByText('John Doe').waitFor({ state: 'visible' });
}

export async function logout(page: Page) {
  await page.getByRole('button', { name: /cerrar sesión/i }).click();
  await page.getByRole('heading', { name: /iniciar sesión/i }).waitFor();
}
```

**Selector strategy:** All three dashboards share `#login-email`, `#login-password`, and login gate heading text. Prefer **accessible roles/labels** over CSS classes (Tailwind classes differ in React/Vue). Seed assertion via `John Doe` (from `api/data/users.json`) works across all UIs.

### Fresh DB per CI run

Delete or use a unique `DB_FILE` path so `accounts` is empty on first `initDb()` → admin is always seeded. Do **not** commit `e2e.users.db`. Add `api/data/e2e.users.db` to `.gitignore`.

---

## CI Workflow — Job Structure

### Recommendation: three parallel jobs, no `needs:`

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test-sqlite:
    # existing job — unchanged

  test-postgres:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: edf_lab
          POSTGRES_PASSWORD: edf_lab_dev
          POSTGRES_DB: edf_lab
        ports:
          - 5432:5432
        options: >-
          --health-cmd "pg_isready -U edf_lab -d edf_lab"
          --health-interval 5s
          --health-timeout 5s
          --health-retries 10
    defaults:
      run:
        working-directory: api
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: npm
          cache-dependency-path: api/package-lock.json
      - run: npm ci
      - name: Create edf_lab_test database
        env:
          PG_ADMIN_URL: postgresql://edf_lab:edf_lab_dev@localhost:5432/postgres
        run: npm run test:db:prepare
      - name: Run Postgres API tests
        env:
          DATABASE_URL: postgresql://edf_lab:edf_lab_dev@localhost:5432/edf_lab_test
          AUTH_DISABLED: '1'
        run: npm run test:pg

  test-e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - name: Install API dependencies
        working-directory: api
        run: npm ci
      - name: Install React dashboard dependencies
        working-directory: dashboard-react
        run: npm ci
      - name: Install Vue dashboard dependencies
        working-directory: dashboard-vue
        run: npm ci
      - name: Install Playwright dependencies
        working-directory: e2e
        run: npm ci
      - name: Install Playwright browsers
        working-directory: e2e
        run: npx playwright install --with-deps chromium
      - name: Run E2E smoke tests
        working-directory: e2e
        run: npm test
```

### `DATABASE_URL` in Postgres job

| Context | Host | Database | Notes |
|---------|------|----------|-------|
| Job runs on `ubuntu-latest` runner (default) | `localhost` | `edf_lab_test` | Port `5432` mapped from service container |
| `prepare-test-db.js` admin connection | `localhost` | `postgres` | `PG_ADMIN_URL` — creates `edf_lab_test` |
| `index.pg.test.js` default | `localhost` | `edf_lab_test` | Matches `TEST_DATABASE_URL` override pattern |

**Canonical CI value:**

```
DATABASE_URL=postgresql://edf_lab:edf_lab_dev@localhost:5432/edf_lab_test
```

Align credentials with `docker-compose.yml` (`edf_lab` / `edf_lab_dev`) so local, Compose, and CI share one mental model. The service container's `POSTGRES_DB: edf_lab` is the *server default*; tests target the isolated `edf_lab_test` database created by `npm run test:db:prepare`.

### Job dependencies: parallel vs sequential

| Pattern | Use when | v2.0 verdict |
|---------|----------|--------------|
| **Parallel jobs** (no `needs:`) | Independent failures, fastest feedback | **Recommended** |
| `needs: [test-sqlite]` on e2e | Save CI minutes if unit tests fail | Optional; adds latency |
| Matrix inside one job | Shard E2E projects | Defer |

GitHub branch protection should list all three checks as required. Parallel jobs give learners **which layer broke** (persistence vs auth UX vs SQLite regressions) in one PR view.

### Caching strategy

| Path | Cache key |
|------|-----------|
| `api/package-lock.json` | Existing `test-sqlite` pattern |
| `e2e/package-lock.json` | New cache entry in `test-e2e` |
| `dashboard-react/package-lock.json` | Required for Vite cold start |
| `dashboard-vue/package-lock.json` | Required for Vite cold start |

Playwright browser cache: use `actions/cache` on `~/.cache/ms-playwright` keyed by `@playwright/test` version (optional optimization after first green run).

---

## Component Boundaries

| Component | Responsibility | v2.0 change |
|-----------|---------------|-------------|
| `api/index.js` | HTTP + auth + CRUD | None required; E2E hits real server |
| `api/seed.js` | Admin + users seed | None; env vars drive E2E admin |
| `api/index.pg.test.js` | Postgres integration | Consumed by new CI job |
| `api/scripts/prepare-test-db.js` | Create `edf_lab_test` | Called in Postgres CI step |
| `dashboard/*` | Vanilla static + login | E2E target; no code change for smoke |
| `dashboard-react/`, `dashboard-vue/` | Vite SPAs + login | E2E targets; `npm run dev` in webServer |
| `e2e/` | Browser smoke only | **New** |
| `.github/workflows/ci.yml` | Quality gates | **Extend** with 2 jobs |

### Data flow (E2E smoke)

```
Playwright → page.goto(baseURL/)
  → login form POST → API /auth/login
  → Set-Cookie: edf_session
  → dashboard fetch /users (credentials: include)
  → render users table (John Doe visible)
  → logout → /auth/logout → cookie cleared
  → login gate visible again
```

### Data flow (Postgres CI)

```
GitHub Actions postgres:16 service (healthy)
  → prepare-test-db.js (CREATE DATABASE edf_lab_test)
  → AUTH_DISABLED=1 npm run test:pg
  → supertest → Express → db-pg.js → localhost:5432/edf_lab_test
  → beforeEach: initDb + resetUsersForTests
```

---

## Integration Points

| Integration | Mechanism | Failure mode if misconfigured |
|-------------|-----------|-------------------------------|
| CORS + cookies | `CORS_ORIGINS` includes 5173/5174/5175; `credentials: true` | Login succeeds but `/users` blocked in browser |
| Admin seed | `initDb()` on API boot; empty `accounts` | E2E login returns 403 |
| JWT signing | `JWT_SECRET` set in E2E `webServer.env` | Cookie set but `/users` returns 401 |
| Port contract | 3100/5173/5174/5175 unchanged | webServer health checks timeout |
| SQLite isolation | `DB_FILE=data/e2e.users.db` | Polluted dev DB or flaky seed state |
| Postgres isolation | `edf_lab_test` not `edf_lab` | CI could contaminate dev data (if shared runner — N/A on GA) |
| `AUTH_DISABLED` | Only in API test jobs, never E2E | Smoke passes without testing real auth |
| Playwright `baseURL` | Per-project explicit | `page.goto('/')` hits wrong dashboard |
| Rate limiting | `POST /auth/login` limited per IP | Flaky E2E if retries hammer login — use `workers: 1` in CI |

---

## Phased Build Order

Build in this order to keep each step verifiable and didactic:

### Phase 1 — Postgres CI job (highest value / lowest new code)

1. Extend `.github/workflows/ci.yml` with `test-postgres` job (service container + `DATABASE_URL` + `test:db:prepare` + `test:pg`).
2. Verify green on a PR; update README badge/docs to mention required check.
3. **Verify:** `gh run watch` shows Postgres job passing; local parity with `docker compose up -d edf-lab-postgres && npm run test:db:prepare && DATABASE_URL=... npm run test:pg`.

*Addresses:* Postgres regression gate. *Avoids:* Playwright install complexity.

### Phase 2 — E2E scaffold + vanilla smoke

1. Create `e2e/` package with Playwright, `playwright.config.ts` (vanilla project only initially).
2. Add `fixtures/auth.ts` and `specs/auth-smoke.vanilla.spec.ts`.
3. Add root `test:e2e` script; document local run (API must **not** be running — Playwright owns ports).
4. **Verify:** `npm run test:e2e` passes locally and in CI `test-e2e` job (vanilla-only first).

*Addresses:* Core v2.0 smoke on `:5173`. *Avoids:* Debugging three dashboards at once.

### Phase 3 — React + Vue E2E projects

1. Add `auth-smoke.react.spec.ts` and `auth-smoke.vue.spec.ts` (likely share fixture; only `baseURL` differs).
2. Extend `playwright.config.ts` with react/vue projects + Vite `webServer` entries.
3. Extend CI `test-e2e` with `dashboard-react` and `dashboard-vue` `npm ci` steps.
4. **Verify:** `npx playwright test` runs three projects sequentially in CI (`workers: 1`).

*Addresses:* QA-01 triple-dashboard coverage.

### Phase 4 — Learning material

1. `docs/` section: E2E local setup, CI diagram, env table.
2. `missions/` practical: run E2E, interpret trace, break login on purpose.
3. `NOTEBOOK.md`: real flakes (CORS, port in use, Playwright cache, Postgres health timing).

*Addresses:* Educational deliverable; documents real errors.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Monolithic CI job

**What:** One job runs SQLite + Postgres + Playwright sequentially.  
**Why bad:** Slow feedback; failure attribution unclear; learners cannot see which layer failed.  
**Instead:** Three parallel jobs with distinct names.

### Anti-Pattern 2: `AUTH_DISABLED=1` in E2E

**What:** Bypass auth to make smoke tests pass.  
**Why bad:** v2.0 goal is auth UX confidence; tests would not catch login regressions.  
**Instead:** Seed admin via existing `initDb()` path; test real login form.

### Anti-Pattern 3: Postgres in every job

**What:** Add `services.postgres` to E2E job.  
**Why bad:** Extra startup time; duplicates `test-postgres`; parallel `webServer` cannot wait for external DB prep easily.  
**Instead:** SQLite for E2E; Postgres job for `test:pg`.

### Anti-Pattern 4: Playwright in `api/package.json`

**What:** Mix browser deps with Express backend.  
**Why bad:** Breaks intentional `api/` ↔ `dashboard/` separation.  
**Instead:** Root-level `e2e/` package.

### Anti-Pattern 5: Hardcoded credentials only in specs

**What:** `admin@lab.local` duplicated in three spec files.  
**Why bad:** Drift from `test-auth-helpers.js` and `.env.example`.  
**Instead:** Single `fixtures/auth.ts` + `E2E_ADMIN_*` env overrides.

---

## Scalability Considerations

| Concern | Current (CI) | Growth path |
|---------|--------------|-------------|
| E2E runtime | ~3 projects × ~30s smoke | Matrix parallelization; drop to chromium-only |
| Postgres CI | 16 tests, ephemeral DB | Add migration smoke step if schema versioning grows |
| Flake rate | Low (localhost, no network) | `retries: 2` on CI; traces on failure |
| Compose E2E | Not in v2.0 CI | Future job: `docker compose up` + Playwright against nginx :5173 |
| CRUD E2E | Out of v2.0 smoke scope | Extend specs after auth smoke stable |

---

## New / Modified Files Checklist

| Path | Action |
|------|--------|
| `e2e/package.json` | Create |
| `e2e/playwright.config.ts` | Create |
| `e2e/fixtures/auth.ts` | Create |
| `e2e/specs/auth-smoke.*.spec.ts` | Create (×3) |
| `e2e/.env.example` | Create |
| `e2e/README.md` | Create |
| `.github/workflows/ci.yml` | Add `test-postgres`, `test-e2e` jobs |
| `package.json` (root) | Add `test:e2e` script |
| `.gitignore` | Add `api/data/e2e.users.db`, `e2e/test-results/`, `e2e/playwright-report/` |
| `README.md`, `docs/10-tests.md` | Update CI diagram + local E2E instructions |
| `NOTEBOOK.md` | Document first real E2E/CI errors |

**No changes required** to `api/index.js`, `dashboard/*`, or DB adapters for minimal smoke — integration is via env + CI orchestration.

---

## Sources

| Source | Confidence | Used for |
|--------|------------|----------|
| [Playwright webServer docs](https://playwright.dev/docs/test-webserver) | HIGH | Multi-server array, `reuseExistingServer`, `baseURL` |
| [Playwright TestConfig API](https://playwright.dev/docs/api/class-testconfig) | HIGH | Array semantics, CI patterns |
| [GitHub Actions PostgreSQL service](https://docs.github.com/en/actions/tutorials/use-containerized-services/create-postgresql-service-containers) | HIGH | `services.postgres`, `localhost:5432` |
| Repo: `api/index.pg.test.js`, `prepare-test-db.js`, `seed.js`, `ci.yml` | HIGH | DATABASE_URL, admin seed, current CI |
| [Playwright PR #40869 per-project webServer](https://github.com/microsoft/playwright/pull/40869) | MEDIUM-HIGH | Project-scoped server launch |

---

*Research for milestone v2.0 — E2E Playwright + Postgres CI integration*
