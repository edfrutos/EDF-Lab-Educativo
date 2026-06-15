# Phase 26: Fundación E2E Playwright (vanilla) - Pattern Map

**Mapped:** 2026-06-14  
**Files analyzed:** 11 new/modified targets  
**Analogs found:** 9 / 11 (2 greenfield: Playwright config + smoke spec)

**Scope:** Vanilla dashboard smoke auth only (`:5173` + API `:3100`). React/Vue E2E deferred to Phase 27.

**Research precedence:** `.planning/research/STACK.md` wins over `ARCHITECTURE.md` on Playwright placement — root `e2e/` + root devDependency, **not** isolated `e2e/package.json`.

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `e2e/playwright.config.js` | config | request-response (webServer orchestration) | `.planning/research/STACK.md` config block + `api/package.json` `start` script | partial (greenfield + env pattern) |
| `e2e/tests/auth-smoke.vanilla.spec.js` | test | request-response (browser → API → cookie) | `api/test-auth-helpers.js` login flow + `dashboard/app.js` gate UX | role-match |
| `package.json` (root) | config | batch (script orchestration) | Existing root `package.json` `test:*` `--prefix api` | exact |
| `package-lock.json` (root) | config | — | `api/package-lock.json` (first root lock) | partial |
| `.gitignore` | config | file-I/O | Existing `api/data/*.db` SQLite ignore block | role-match |
| `docs/10-tests.md` | doc | — | Existing CI section + scripts table | exact |
| `.github/workflows/ci.yml` | config | batch (CI jobs) | Current `test-sqlite` job (Phase 26: env contract only; full `e2e-smoke` job → Phase 27) | exact |
| `api/package.json` | config | — | **No changes** per STACK.md | N/A |
| `dashboard/index.html` | component | request-response | Self (login gate markup, Phase 19) | exact (read-only) |
| `dashboard/app.js` | component | request-response | Self + `api/test-auth-helpers.js` creds | exact (read-only) |

---

## Naming Conventions

| Artifact | Convention | Source |
|----------|------------|--------|
| Playwright config | `e2e/playwright.config.js` (JS, not TS) | STACK.md — no TS toolchain at root |
| Smoke specs | `e2e/tests/auth-smoke.vanilla.spec.js` | Playwright default `testDir: './tests'`; suffix `.vanilla` for Phase 27 multi-dashboard |
| Root scripts | `test:e2e`, `test:e2e:ui`, `playwright:install` | STACK.md |
| Root script delegation | `"test:e2e": "playwright test --config e2e/playwright.config.js"` | Mirrors explicit `--config` over `--prefix` (Playwright lives at root, not in `api/`) |
| E2E SQLite DB | `api/data/e2e.users.db` via `DB_FILE` env | ARCHITECTURE.md + `index.test.js` `users.test.db` pattern |
| Admin creds in E2E | `admin@lab.local` / `changeme` | `api/test-auth-helpers.js`, `api/.env.example` |
| CI env prefix | `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD` optional overrides | ARCHITECTURE.md fixtures (optional Phase 26) |

---

## Pattern Assignments

### `e2e/playwright.config.js` (config, request-response)

**Analog:** `.github/workflows/ci.yml` (Node 22, fresh processes) + `api/rate-limit.test.js` (env-before-start) + `api/package.json` `"start": "node index.js"`

**webServer env pattern** — mirror test DB isolation but **invert** auth/rate-limit vs API tests:

```js
// e2e/playwright.config.js — api webServer.env (DO NOT copy from api/package.json scripts)
env: {
  PORT: '3100',
  JWT_SECRET: 'ci-e2e-only-not-production',
  ADMIN_EMAIL: 'admin@lab.local',
  ADMIN_PASSWORD: 'changeme',
  DB_FILE: 'data/e2e.users.db',           // isolated — like users.test.db in index.test.js
  CORS_ORIGINS: 'http://localhost:5173,http://localhost:5174,http://localhost:5175',
  LOGIN_RATE_LIMIT_MAX: '100',            // elevated — opposite of rate-limit.test.js (= '2')
  // DATABASE_URL: omit → SQLite (STACK.md)
  // AUTH_DISABLED: NEVER SET (see What NOT to Copy)
}
```

**webServer array** (Phase 26 — 2 entries only):

```js
webServer: [
  {
    name: 'api',
    command: 'npm start',
    cwd: '../api',
    url: 'http://localhost:3100/health',
    timeout: 60_000,
    reuseExistingServer: !process.env.CI,
    env: { /* block above */ },
  },
  {
    name: 'vanilla',
    command: 'python3 -m http.server 5173',
    cwd: '../dashboard',
    url: 'http://localhost:5173',
    timeout: 30_000,
    reuseExistingServer: !process.env.CI,
  },
],
use: {
  baseURL: 'http://localhost:5173',  // required when webServer is array (STACK.md)
  trace: 'on-first-retry',
},
forbidOnly: !!process.env.CI,
retries: process.env.CI ? 1 : 0,
workers: process.env.CI ? 1 : undefined,
reporter: process.env.CI ? 'github' : 'list',
```

**Health probe analog:** `GET /health` is public — same as `test-auth-helpers.js` line 73-77.

---

### `e2e/tests/auth-smoke.vanilla.spec.js` (test, request-response)

**Analog:** `api/test-auth-helpers.js` (login/logout contract) + `dashboard/index.html` + `dashboard/app.js` (DOM + gate flow)

**Credentials** — copy constants from test helper, not hardcode in spec body:

```3:4:api/test-auth-helpers.js
const ADMIN_EMAIL = 'admin@lab.local';
const ADMIN_PASSWORD = 'changeme';
```

E2E may import equivalent from a small `e2e/fixtures/auth.js` or inline the same literals (match helper exactly).

**Login flow analog** (supertest → Playwright UI):

```31:39:api/test-auth-helpers.js
    it('POST /auth/login válido responde 200 y cookie edf_session', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
      assert.equal(res.status, 200);
      assert.equal(res.body.email, ADMIN_EMAIL);
      const cookie = sessionCookieFromResponse(res);
      assert.ok(cookie && cookie.includes('edf_session='), 'debe incluir cookie de sesión');
    });
```

**Playwright equivalent** — exercise UI, not direct POST:

```js
// Gate visible (bootstrapAuth → 401 on /users)
await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();

// Fill form — selectors from dashboard/index.html
await page.getByLabel('Email').fill('admin@lab.local');
await page.getByLabel('Contraseña').fill('changeme');
await page.getByRole('button', { name: 'Entrar' }).click();

// Dashboard panel + seed user (api/data/users.json → John Doe)
await expect(page.locator('#dashboard-panel')).toBeVisible();
await expect(page.getByText('John Doe')).toBeVisible();

// Logout — dashboard/app.js handleLogoutClick
await page.getByRole('button', { name: 'Cerrar sesión' }).click();
await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();
```

**DOM selectors from vanilla dashboard** (prefer role/label; IDs as fallback):

| Element | HTML (`dashboard/index.html`) | Playwright locator |
|---------|-------------------------------|-------------------|
| Login gate | `#login-gate`, `#login-gate-title` | `getByRole('heading', { name: 'Iniciar sesión' })` |
| Email field | `#login-email`, label span "Email" | `getByLabel('Email')` |
| Password field | `#login-password`, label span "Contraseña" | `getByLabel('Contraseña')` |
| Submit | `<button type="submit">Entrar</button>` | `getByRole('button', { name: 'Entrar' })` |
| Dashboard panel | `#dashboard-panel` (hidden until auth) | `locator('#dashboard-panel')` + `toBeVisible()` |
| Users table | `#users-table-body` | `getByText('John Doe')` (seed from `users.json`) |
| Logout | `#logout-button` "Cerrar sesión" | `getByRole('button', { name: 'Cerrar sesión' })` |
| Login error | `#login-error` role="alert" | Only assert on failure paths (reto) |

**Gate flow analog** (`dashboard/app.js`):

```44:52:dashboard/app.js
function showLoginGate() {
  elements.loginGate.hidden = false;
  elements.dashboardPanel.hidden = true;
}

function showDashboardPanel() {
  elements.loginGate.hidden = true;
  elements.dashboardPanel.hidden = false;
}
```

```108:126:dashboard/app.js
async function handleLoginSubmit(event) {
  event.preventDefault();
  clearLoginError();
  const email = elements.loginEmailInput.value.trim();
  const password = elements.loginPasswordInput.value;
  try {
    await fetchJson('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    clearLoginError();
    showDashboardPanel();
    await loadDashboardData();
```

**fetch credentials pattern** (cross-origin cookie — do not change dashboard code):

```178:183:dashboard/app.js
async function fetchJson(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    credentials: 'include',
    ...options
  });
```

---

### `package.json` (root) (config, batch)

**Analog:** Existing root orchestration:

```5:12:package.json
  "scripts": {
    "compose:up": "docker compose up --build",
    "compose:down": "docker compose down",
    "compose:logs": "docker compose logs -f",
    "test": "npm test --prefix api",
    "test:pg": "npm run test:pg --prefix api",
    "test:db:prepare": "npm run test:db:prepare --prefix api"
  }
```

**Additions to mirror** (STACK.md):

```json
{
  "scripts": {
    "test:e2e": "playwright test --config e2e/playwright.config.js",
    "test:e2e:ui": "playwright test --config e2e/playwright.config.js --ui",
    "playwright:install": "playwright install --with-deps chromium"
  },
  "devDependencies": {
    "@playwright/test": "^1.60.0"
  }
}
```

**Do not** add Playwright to `api/package.json` — wrong package boundary (STACK.md, ARCHITECTURE.md anti-pattern 4).

---

### `api/package.json` scripts (read-only analog for contrast)

**Analog for API unit tests** — Phase 26 does **not** modify this file:

```6:12:api/package.json
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "AUTH_DISABLED=1 node --test --test-force-exit index.test.js && AUTH_DISABLED=1 node --test --test-force-exit index.pg.test.js",
    "test:sqlite": "AUTH_DISABLED=1 node --test --test-force-exit index.test.js rate-limit.test.js",
    "test:pg": "AUTH_DISABLED=1 node --test --test-force-exit index.pg.test.js",
    "test:db:prepare": "node scripts/prepare-test-db.js",
```

E2E uses `"start"` (no `AUTH_DISABLED` prefix). API test scripts stay unchanged.

---

### `api/rate-limit.test.js` (test env pattern — contrast, not copy)

**Analog:** Env-before-require + isolated DB — **same structure**, different values for E2E:

```11:15:api/rate-limit.test.js
const TEST_DB = path.join(__dirname, 'data', 'users.rate-limit.test.db');
process.env.DB_FILE = TEST_DB;
delete process.env.DATABASE_URL;
process.env.LOGIN_RATE_LIMIT_MAX = '2';
process.env.LOGIN_RATE_LIMIT_WINDOW_MS = '60000';
```

| Variable | API test (`rate-limit.test.js`) | E2E (`webServer.env`) |
|----------|--------------------------------|------------------------|
| `DB_FILE` | `users.rate-limit.test.db` | `e2e.users.db` |
| `LOGIN_RATE_LIMIT_MAX` | `'2'` (assert 429) | `'100'` or higher (avoid flake, QA-CI-04) |
| `AUTH_DISABLED` | unset (login route always live) | **unset** (real auth) |

Rate limiter reads env at module load (`api/auth.js` lines 107-108) — set env in `webServer.env` **before** `npm start` spawns the process (Playwright handles this).

---

### `api/index.test.js` (test env pattern — contrast for AUTH_DISABLED)

**Analog for DB isolation** (copy structure):

```14:18:api/index.test.js
const TEST_DB = path.join(__dirname, 'data', 'users.test.db');
process.env.DB_FILE = TEST_DB;
// Tests SQLite: no usar Postgres aunque DATABASE_URL esté en el shell o en Compose.
delete process.env.DATABASE_URL;
process.env.AUTH_DISABLED = '1';
```

E2E webServer env: copy `DB_FILE` + `delete DATABASE_URL` semantics; **omit** `AUTH_DISABLED = '1'`.

**Auth block contrast** — API tests temporarily enable real auth:

```17:23:api/test-auth-helpers.js
    before(() => {
      delete process.env.AUTH_DISABLED;
    });

    after(() => {
      process.env.AUTH_DISABLED = '1';
    });
```

E2E never sets `AUTH_DISABLED` at all — auth is always on (ROADMAP success criterion 3).

---

### `.github/workflows/ci.yml` (config, batch)

**Analog:** Current job — extend in Phase 27; Phase 26 only documents env contract (QA-CI-04):

```9:23:.github/workflows/ci.yml
jobs:
  test-sqlite:
    runs-on: ubuntu-latest
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
      - run: npm run test:sqlite
```

**Future `e2e-smoke` job pattern** (Phase 27 / QA-CI-02 — reference only):

- Same `checkout@v4` + `setup-node@v4` with `node-version: '22'`
- Root `npm ci` + `npm ci --prefix api`
- `npx playwright install --with-deps chromium`
- `npm run test:e2e` with `CI: true` (disables `reuseExistingServer`)
- **No** `AUTH_DISABLED` in job `env`
- Cache paths: root + `api/package-lock.json` (Phase 26 adds root lock)

**Postgres job snippet** — not Phase 26 scope; lives in `docs/10-tests.md` lines 106-137 for Phase 28.

---

### `.gitignore` (config, file-I/O)

**Analog:** Existing SQLite runtime ignore:

```29:30:.gitignore
# SQLite runtime (API)
api/data/*.db
```

**Additions** (ROADMAP criterion 5):

```gitignore
# Playwright E2E (Phase 26)
e2e/test-results/
e2e/playwright-report/
playwright/.auth/
blob-report/
# api/data/e2e.users.db already covered by api/data/*.db
```

---

### `docs/10-tests.md` (doc)

**Analog:** Existing scripts table (lines 40-47) + CI section (lines 82-90).

Append E2E section documenting:
- `npm run test:e2e` from repo root
- Playwright starts API + vanilla (no manual servers)
- Explicit rule: E2E ≠ `AUTH_DISABLED` (cross-link `docs/17-autenticacion.md` line 166-170)
- `playwright:install` one-time setup

---

## Shared Patterns

### Admin credentials (single source of truth)

**Source:** `api/test-auth-helpers.js` + `api/.env.example`  
**Apply to:** `e2e/playwright.config.js` webServer.env, smoke spec, optional `e2e/fixtures/auth.js`

```12:14:api/.env.example
# Cuenta operador inicial (solo se crea si la tabla accounts está vacía)
ADMIN_EMAIL=admin@lab.local
ADMIN_PASSWORD=changeme
```

Seed runs on empty `accounts` via `api/seed.js` → `seedAdminIfEmptyAccounts()` at `initDb()` — no new seed script needed.

### DB isolation before server start

**Source:** `api/index.test.js` lines 14-17, `api/rate-limit.test.js` lines 11-13  
**Apply to:** Playwright `webServer.env.DB_FILE`

Fresh `e2e.users.db` per run → empty `accounts` → admin always seeded.

### Spanish error / UI text assertions

**Source:** `api/test-auth-helpers.js`, `dashboard/index.html`  
**Apply to:** Playwright locators use Spanish UI strings (`Iniciar sesión`, `Contraseña`, `Entrar`, `Cerrar sesión`)

### Port contract (unchanged)

| Service | Port | Health URL |
|---------|------|------------|
| API | 3100 | `http://localhost:3100/health` |
| Vanilla | 5173 | `http://localhost:5173` |

Hardcoded in `dashboard/app.js` line 1: `API_BASE_URL = 'http://localhost:3100'`.

---

## What NOT to Copy

| Do NOT copy from | Reason | Use instead |
|------------------|--------|-------------|
| `AUTH_DISABLED=1` in `api/package.json` test scripts | Bypasses `requireAuth`; smoke would not test login gate | Omit `AUTH_DISABLED` entirely in E2E env |
| `process.env.AUTH_DISABLED = '1'` in `index.test.js` setup | Same — CRUD-only escape hatch | Real UI login in Playwright |
| `test-auth-helpers.js` `before`/`after` AUTH toggle | Pattern is for supertest suites, not browser E2E | Never set `AUTH_DISABLED` in E2E |
| `LOGIN_RATE_LIMIT_MAX = '2'` from `rate-limit.test.js` | Causes 429 flakes on CI retries (QA-CI-04) | Elevated max (`100+`) in webServer.env |
| `ARCHITECTURE.md` isolated `e2e/package.json` | Extra lockfile; STACK.md rejects | Root devDependency + single root lock |
| `storageState` / saved auth JSON for smoke | Skips login UX; security risk if committed | UI login per test; `.gitignore` `playwright/.auth/` |
| `DATABASE_URL` in E2E job | Couples browser smoke to Postgres; Phase 28 owns PG CI | SQLite via omitted `DATABASE_URL` |
| Mission 13 Option A `AUTH_DISABLED` in `.env` | Old learner workaround; contradicts v2.0 smoke goal | Document in NOTEBOOK only as anti-pattern |
| Cypress / `start-server-and-test` / Docker for E2E | STACK.md explicit rejects | Playwright native `webServer` |

**Negative CI check (QA-CI-04):** Grep `.github/workflows/ci.yml` E2E job for `AUTH_DISABLED` → must be absent.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `e2e/playwright.config.js` | config | request-response | Greenfield — follow STACK.md template, not existing repo file |
| `e2e/tests/auth-smoke.vanilla.spec.js` | test | request-response | First browser test in repo; borrow API auth contract + vanilla DOM only |

---

## Research Doc Conflicts (planner must resolve)

| Topic | STACK.md | ARCHITECTURE.md | **Recommend** |
|-------|----------|-----------------|---------------|
| Playwright package location | Root devDep | Isolated `e2e/package.json` | **STACK** (root) |
| Config filename | `playwright.config.js` | `playwright.config.ts` | **STACK** (JS) |
| Spec folder | `e2e/tests/` | `e2e/specs/` | **STACK** (`tests/`) |
| webServer scope | Single array (4 servers) | Per-project webServer | Phase 26: **2-server array**; Phase 27: evaluate per-project |
| CI Postgres in E2E | Separate job only | — | **STACK** — SQLite for E2E |

---

## Metadata

**Analog search scope:** `api/`, `dashboard/`, `.github/workflows/`, root `package.json`, `.gitignore`, `docs/10-tests.md`, `.planning/research/`, `.planning/phases/{19,24,13}-*/`  
**Files scanned:** ~25  
**Pattern extraction date:** 2026-06-14

---

## PATTERN MAPPING COMPLETE

**Phase:** 26 — Fundación E2E Playwright (vanilla)  
**Files classified:** 11  
**Analogs found:** 9 / 11

### Coverage
- Files with exact analog: 4 (`package.json` root, `ci.yml`, `dashboard/*`, `docs/10-tests.md`)
- Files with role-match analog: 5 (`playwright.config.js`, smoke spec, `.gitignore`, test env patterns)
- Files with no analog: 2 (Playwright config + smoke spec — greenfield)

### Key Patterns Identified
- Root `e2e/` + `@playwright/test` devDep at repo root (not `api/`)
- `webServer` env: isolated `DB_FILE`, elevated rate limit, **never** `AUTH_DISABLED`
- Smoke spec: Spanish `getByRole`/`getByLabel` locators from `dashboard/index.html`; assert `John Doe` seed
- API test scripts (`AUTH_DISABLED=1`) are **contrast only** — opposite of E2E env contract

### File Created
`.planning/phases/26-fundaci-n-e2e-playwright-vanilla/PATTERNS.md`

### Ready for Planning
Pattern mapping complete. Planner can reference analog patterns in PLAN.md files.
