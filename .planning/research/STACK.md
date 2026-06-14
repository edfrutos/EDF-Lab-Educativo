# Technology Stack — v2.0 Quality & CI

**Project:** EDF Lab Educativo  
**Milestone:** v2.0 — Playwright E2E smoke auth (3 dashboards) + mandatory Postgres CI  
**Researched:** 2026-06-14  
**Confidence:** HIGH (Playwright webServer, GHA Postgres service) / MEDIUM (CI timing for 4 concurrent dev servers)

## Scope

This document covers **additions only** for v2.0. The existing stack is unchanged:

- Express API (Node 22), `node:sqlite` / `pg`, httpOnly cookie auth
- Dashboards: vanilla (`python3 -m http.server` :5173), React/Vite (:5174), Vue/Vite (:5175)
- API tests: `npm run test:sqlite` (24 tests) in CI today

---

## Recommended Additions

### Playwright E2E

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `@playwright/test` | **^1.60.0** | Browser E2E smoke (login → dashboard visible) | Official Microsoft runner; native multi-`webServer`; no extra harness |
| Chromium only (CI) | bundled | Single browser in CI | Smoke auth does not need cross-browser matrix; `playwright install --with-deps chromium` |

**Package placement: root `e2e/`, dependency in root `package.json`**

| Placement | Verdict |
|-----------|---------|
| **Root `e2e/` + root devDependency** | **Recommended** — E2E crosses `api/`, `dashboard/`, `dashboard-react/`, `dashboard-vue/`; root already orchestrates `test:pg`, `compose:*` |
| `api/package.json` | **Reject** — API boundary is HTTP/supertest; browser tests do not belong there |
| `e2e/package.json` (isolated lock) | **Reject** — extra lockfile and `npm ci` step for one devDependency; violates minimal-deps lab goal |

```
repo/
├── package.json          ← add @playwright/test devDep + test:e2e scripts
├── package-lock.json     ← new (root currently has no lock)
├── e2e/
│   ├── playwright.config.js
│   └── tests/
│       └── auth-smoke.spec.js
├── api/                  ← unchanged; started by webServer
├── dashboard/
├── dashboard-react/      ← npm ci required before Vite dev
└── dashboard-vue/
```

### GitHub Actions — Postgres service

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `postgres` (Docker Hub) | **16** | Service container for `test:pg` | Matches `docs/10-tests.md`, Phase 12/13 lab credentials; GHA `ubuntu-latest` runs job on host → `localhost:5432` |
| `actions/setup-node` | v4 | Node **22** | Required by `node:sqlite` in `test:sqlite`; same version across all CI jobs |
| `actions/checkout` | v4 | Unchanged | Already in workflow |

Use **`postgres:16`** (Debian-based official image), not `postgres:16-alpine`, in GHA: better documented health-check examples, identical wire protocol; Compose can keep `postgres:16-alpine` for local Docker size.

---

## Playwright Configuration Pattern

### Multi-origin `webServer` (4 processes)

Playwright supports an **array** of `webServer` entries; all must be ready before tests run. With an array, **`use.baseURL` must be set explicitly** (Playwright does not infer it from `port`).

Recommended `e2e/playwright.config.js`:

```js
import { defineConfig, devices } from '@playwright/test';

const reuse = !process.env.CI;

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',

  use: {
    // Required when webServer is an array; tests use full dashboard URLs anyway.
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    ...devices['Desktop Chrome'],
  },

  webServer: [
    {
      name: 'api',
      command: 'npm start',
      cwd: '../api',
      url: 'http://localhost:3100/health',
      timeout: 60_000,
      reuseExistingServer: reuse,
      env: {
        PORT: '3100',
        JWT_SECRET: 'ci-e2e-only-not-production',
        ADMIN_EMAIL: 'admin@lab.local',
        ADMIN_PASSWORD: 'changeme',
        // Omit DATABASE_URL → SQLite (faster E2E; Postgres covered by test-postgres job)
      },
    },
    {
      name: 'vanilla',
      command: 'python3 -m http.server 5173',
      cwd: '../dashboard',
      url: 'http://localhost:5173',
      timeout: 30_000,
      reuseExistingServer: reuse,
    },
    {
      name: 'react',
      command: 'npm run dev',
      cwd: '../dashboard-react',
      url: 'http://localhost:5174',
      timeout: 120_000,
      reuseExistingServer: reuse,
    },
    {
      name: 'vue',
      command: 'npm run dev',
      cwd: '../dashboard-vue',
      url: 'http://localhost:5175',
      timeout: 120_000,
      reuseExistingServer: reuse,
    },
  ],
});
```

**Design choices:**

- **SQLite for E2E API** — smoke auth validates browser ↔ API ↔ cookie flow, not Postgres adapter. Keeps E2E job free of `services.postgres` and faster.
- **`reuseExistingServer: !process.env.CI`** — local dev reuses already-running terminals; CI always starts fresh ([Playwright webServer docs](https://playwright.dev/docs/test-webserver)).
- **`name` on each server** — prefixes logs when four processes start in parallel.
- **`timeout: 120_000` for Vite** — cold `npm run dev` on CI can exceed default 60s; vanilla/API stay at 60s/30s.
- **Multi-origin tests** — do not rely on a single `baseURL`. Parameterize three dashboard origins; login uses credentialed cross-origin `fetch` to `:3100` (already `credentials: 'include'` in all dashboards). Cookie: `sameSite: 'lax'`, `httpOnly`, `secure: false` in non-production — works in Chromium for this lab topology.

Example smoke test shape:

```js
import { test, expect } from '@playwright/test';

const DASHBOARDS = [
  { name: 'vanilla', origin: 'http://localhost:5173', appHeading: /EDF Lab/i },
  { name: 'react',   origin: 'http://localhost:5174', appHeading: /usuarios/i },
  { name: 'vue',     origin: 'http://localhost:5175', appHeading: /usuarios/i },
];

for (const { name, origin, appHeading } of DASHBOARDS) {
  test(`smoke auth — ${name}`, async ({ page }) => {
    await page.goto(origin);
    await page.getByLabel(/correo|email/i).fill('admin@lab.local');
    await page.getByLabel(/contraseña|password/i).fill('changeme');
    await page.getByRole('button', { name: /iniciar sesión|entrar/i }).click();
    await expect(page.getByRole('heading', { name: appHeading })).toBeVisible();
  });
}
```

(Selectors should match real DOM labels from each dashboard during implementation.)

---

## npm Scripts

### Root `package.json` (additions)

```json
{
  "scripts": {
    "test:e2e": "playwright test --config e2e/playwright.config.js",
    "test:e2e:ui": "playwright test --config e2e/playwright.config.js --ui",
    "test:e2e:headed": "playwright test --config e2e/playwright.config.js --headed",
    "playwright:install": "playwright install --with-deps chromium",
    "pretest:e2e:ci": "npm ci --prefix api && npm ci --prefix dashboard-react && npm ci --prefix dashboard-vue"
  },
  "devDependencies": {
    "@playwright/test": "^1.60.0"
  }
}
```

`pretest:e2e:ci` is for **CI and first-time local setup** only; document that developers with Vite deps already installed can run `npm run test:e2e` directly.

### `api/package.json` — no changes

Existing scripts stay the source of truth:

| Script | Role in v2.0 |
|--------|----------------|
| `test:sqlite` | Job `test-sqlite` (unchanged, 24 tests) |
| `test:pg` | Job `test-postgres` (new mandatory) |
| `test:db:prepare` | **Local only** — CI creates `edf_lab_test` via `POSTGRES_DB` on service start |
| `start` | Started by Playwright `webServer` |

---

## GitHub Actions — Target Workflow

Three **parallel** jobs (all required on `main` PRs):

```yaml
jobs:
  test-sqlite:
    # existing — api/ npm ci + npm run test:sqlite

  test-postgres:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: api
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: edf_lab
          POSTGRES_PASSWORD: edf_lab_dev
          POSTGRES_DB: edf_lab_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd "pg_isready -U edf_lab -d edf_lab_test"
          --health-interval 5s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: npm
          cache-dependency-path: api/package-lock.json
      - run: npm ci
      - run: npm run test:pg
        env:
          DATABASE_URL: postgresql://edf_lab:edf_lab_dev@localhost:5432/edf_lab_test

  e2e-smoke:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: npm
          cache-dependency-path: |
            package-lock.json
            api/package-lock.json
            dashboard-react/package-lock.json
            dashboard-vue/package-lock.json
      - run: npm ci
      - run: npm ci --prefix api
      - run: npm ci --prefix dashboard-react
      - run: npm ci --prefix dashboard-vue
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
        env:
          CI: true
```

**Postgres job notes:**

- `POSTGRES_DB: edf_lab_test` removes need for `npm run test:db:prepare` in CI (that script connects to `postgres` DB to `CREATE DATABASE`).
- Credentials align with `api/index.pg.test.js` default `TEST_DATABASE_URL`.
- Job runs on **runner host** (`localhost`), not `container:` job — matches current `test-sqlite` pattern and existing docs snippet in `docs/10-tests.md`.

**E2E job notes:**

- Python 3 is preinstalled on `ubuntu-latest` — no extra setup for vanilla dashboard.
- `CI: true` disables `reuseExistingServer`.
- Single worker in CI reduces port races when four servers boot (configurable in `playwright.config.js`).

---

## Node Version Alignment

| Location | Version |
|----------|---------|
| Local / CI | **Node 22** |
| `actions/setup-node` | `node-version: '22'` (all jobs) |
| Recommended | Add root `.nvmrc` with `22` (repo has no `.nvmrc` today) |

Do not mix Node 20/22 across jobs — `node:sqlite` in API tests requires 22+.

---

## What NOT to Add

| Avoid | Reason | Use instead |
|-------|--------|-------------|
| **Cypress** | Second E2E stack, slower CI, no native multi-server array | `@playwright/test` |
| **Docker / Compose for E2E** | Adds build time and DinD complexity; four host processes suffice | Playwright `webServer` |
| **`testcontainers` / `pg` in E2E job** | Postgres already validated in `test-postgres` | Separate CI jobs |
| **`start-server-and-test`** | Redundant with Playwright `webServer` | Built-in `webServer` array |
| **Firefox / WebKit in CI** | 3× browser install time for smoke auth | Chromium only |
| **`@playwright/test` in `api/`** | Wrong package boundary | Root `e2e/` |
| **Isolated `e2e/package.json`** | Extra lock without educational payoff | Root devDependency |
| **Percy / Applitools** | Visual regression out of scope | DOM assertions on login gate |
| **Playwright Docker image** | Unnecessary when `ubuntu-latest` + `install --with-deps` works | Host install step |

---

## Alternatives Considered

| Decision | Recommended | Alternative | Why not |
|----------|-------------|-------------|---------|
| Playwright location | Root `e2e/` | `e2e/package.json` workspace | Two locks, two `npm ci` for one tool |
| E2E API backend | SQLite (no `DATABASE_URL`) | Postgres in E2E job | Couples browser smoke to DB service; slower |
| Postgres image (GHA) | `postgres:16` | `postgres:16-alpine` | Both work; `16` matches docs snippet and health-check examples |
| CI structure | 3 parallel jobs | Single mega-job | Failures are harder to triage; Postgres/E2E independent |
| Config format | `playwright.config.js` | TypeScript config | Repo has no TS toolchain at root; JS matches lab style |

---

## Installation

```bash
# From repo root (one-time / after package.json update)
npm install -D @playwright/test@^1.60.0
npx playwright install --with-deps chromium

# Subproject deps (CI or first local E2E run)
npm ci --prefix api
npm ci --prefix dashboard-react
npm ci --prefix dashboard-vue

# Run smoke locally (starts 4 servers via webServer)
npm run test:e2e
```

---

## Integration Checklist (implementation phase)

- [ ] Root `package-lock.json` generated after adding Playwright
- [ ] `e2e/playwright.config.js` with 4-entry `webServer` array
- [ ] Smoke spec covers 5173, 5174, 5175 with `admin@lab.local` / `changeme`
- [ ] `.github/workflows/ci.yml` — add `test-postgres` + `e2e-smoke` jobs
- [ ] `docs/10-tests.md` — promote Postgres job from "opcional" to mandatory; document E2E commands
- [ ] `.gitignore` — `e2e/test-results/`, `e2e/playwright-report/`, `blob-report/`
- [ ] Optional: `playwright.config.js` `forbidOnly: !!process.env.CI`

---

## Sources

| Source | Confidence | Used for |
|--------|------------|----------|
| [Playwright webServer docs](https://playwright.dev/docs/test-webserver) | HIGH | Multi-server array, `reuseExistingServer`, `baseURL` rule |
| [Playwright TestConfig API](https://playwright.dev/docs/api/class-testconfig) | HIGH | `webServer` options, timeouts |
| [GitHub Actions PostgreSQL service containers](https://docs.github.com/en/actions/use-cases-and-examples/using-containerized-services/creating-postgresql-service-containers) | HIGH | `services.postgres`, `localhost:5432`, health checks |
| `npm view @playwright/test version` → **1.60.0** (2026-06-14) | HIGH | Version pin |
| `docs/10-tests.md` Postgres CI snippet | HIGH | Credentials, `test:pg` env |
| `docker-compose.yml`, `api/package.json`, `.github/workflows/ci.yml` | HIGH | Existing ports, scripts, Node 22 |
| `api/auth.js` | HIGH | Cookie/CORS defaults for E2E env |

---

*Research for milestone v2.0 — Quality & CI. Supersedes auth-focused STACK.md (v1.5) for E2E/CI additions; v1.5 auth stack rows remain valid and unchanged.*
