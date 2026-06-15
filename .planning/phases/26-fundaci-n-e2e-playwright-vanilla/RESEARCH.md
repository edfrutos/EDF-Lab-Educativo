# Phase 26: Fundación E2E Playwright (vanilla) - Research

**Researched:** 2026-06-14  
**Domain:** Playwright E2E smoke auth — dashboard vanilla + API Express  
**Confidence:** HIGH

## Summary

La fase 26 introduce la **capa de confianza browser** en el laboratorio: un smoke de autenticación en Chromium que recorre el gate de login del dashboard vanilla (`:5173`) contra la API real (`:3100`), sin `AUTH_DISABLED` y sin `storageState` como atajo. El operador ejecuta `npm run test:e2e` desde la raíz y Playwright levanta ambos servidores vía `webServer` — no hace falta tmux manual.

El patrón recomendado sigue la investigación v2.0 ya consolidada en `.planning/research/`: **Playwright en la raíz** (`e2e/` + devDependency en `package.json` raíz), **SQLite aislado** para la API E2E (`DB_FILE=data/e2e.users.db`, sin `DATABASE_URL`), **login por UI** con selectores accesibles (`getByRole` / `getByLabel`), y **entorno seguro** con credenciales configurables y rate limit elevado solo en el proceso API del `webServer`. React/Vue y el job CI completo de tres dashboards quedan para la fase 27; en la 26 basta un job `e2e-smoke` vanilla (interino) que ya cumple QA-CI-04.

El DOM vanilla ya expone contratos estables: sección `#login-gate` con heading «Iniciar sesión», labels «Email»/«Contraseña», botón «Entrar», panel `#dashboard-panel` con tabla de usuarios y botón «Cerrar sesión». Tras `initDb()` con BD vacía, `seed.js` rellena ≥2 filas en `users` (p. ej. `john@example.com`) y `seedAdminIfEmptyAccounts()` crea el operador en `accounts` con `ADMIN_EMAIL`/`ADMIN_PASSWORD`.

**Primary recommendation:** Scaffold mínimo en raíz — `e2e/playwright.config.js` con **dos** entradas `webServer` (API + `python3 -m http.server 5173`), un spec `auth-smoke.vanilla.spec.js`, scripts raíz `test:e2e` / `playwright:install`, `.gitignore` de artefactos Playwright, job CI vanilla con env QA-CI-04, y sección E2E en `docs/10-tests.md`.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| QA-E2E-01 | Playwright en raíz `e2e/`; config arranca API `:3100` y dashboards necesarios; sin `AUTH_DISABLED` | `webServer` dual (API + vanilla); `env` explícito sin `AUTH_DISABLED`; `@playwright/test` ^1.60.0 en root `package.json` |
| QA-E2E-02 | Smoke vanilla: gate → login → tabla con datos → logout → gate | Selectores verificados en `dashboard/index.html`; flujo alineado con `dashboard/app.js` (`bootstrapAuth`, `handleLoginSubmit`, `handleLogoutClick`) |
| QA-E2E-05 | Script raíz `npm run test:e2e`; documentado en `docs/10-tests.md` | Scripts propuestos + sección mínima E2E en doc (matriz CI completa en fase 29 / DOCS-01) |
| QA-CI-04 | CI con env seguro E2E (credenciales operador, `LOGIN_RATE_LIMIT_MAX` elevado) | `webServer.env` + `env` del job GHA; alineado con `api/auth.js` `createLoginRateLimiter()` |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Orquestación servidores E2E | **Test runner (Playwright config)** | — | `webServer` es responsabilidad del harness, no del código de producción |
| Autenticación / cookie `edf_session` | **API / Backend** (`:3100`) | Browser (formulario login) | JWT + httpOnly cookie se firman y validan en `api/auth.js`; el browser solo envía credenciales |
| Gate login / tabla usuarios | **Browser / Client** (`:5173`) | — | Visibilidad DOM (`#login-gate`, `#dashboard-panel`) es UX frontend |
| Seed operador + usuarios demo | **Database / Storage** (SQLite E2E) | API `initDb()` | `seedAdminIfEmptyAccounts` + `populateIfEmptySqlite` en arranque API |
| Rate limiting login | **API / Backend** | Test env (`LOGIN_RATE_LIMIT_MAX`) | `express-rate-limit` en `api/auth.js`; tests solo elevan el techo |
| Artefactos trace/report | **CDN / Static** (filesystem local) | CI artifacts | Generados por Playwright; nunca en git |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@playwright/test` | **^1.60.0** | Runner E2E + `webServer` | Oficial Microsoft; multi-`webServer` nativo; Chromium bundled [VERIFIED: npm registry — `1.60.0` al 2026-06-14] |
| Node.js | **22** | Runtime API + Playwright | Requerido por `node:sqlite` en CI existente; alineado con `.github/workflows/ci.yml` [VERIFIED: codebase] |
| Python 3 | sistema (3.x) | `python3 -m http.server 5173` | Patrón didáctico ya documentado en `CLAUDE.md` / `AGENTS.md` [VERIFIED: codebase] |
| Express API | existente (`api/`) | Backend bajo test | Sin cambios de código para smoke mínimo [VERIFIED: `.planning/research/SUMMARY.md`] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `actions/setup-node@v4` | v4 | Node 22 en CI E2E | Job `e2e-smoke` en fase 26 |
| `playwright install chromium` | bundled | Browser en CI/local | Post-instalación y step CI |
| Root `package-lock.json` | nuevo | Lock de `@playwright/test` | Raíz no tenía lock hasta ahora [VERIFIED: `package.json` raíz] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Root devDep + `e2e/` | `e2e/package.json` aislado | Lock extra + otro `npm ci`; rechazado en STACK v2.0 |
| `webServer` Playwright | `start-server-and-test` | Dependencia adicional; menos integración trace/reuse |
| `playwright.config.ts` | `.js` CommonJS | Lab es JS vanilla; sin toolchain TS en raíz |
| `storageState` setup project | Login UI cada spec | Oculta lección didáctica; anti-feature v2.0 |
| Postgres en E2E | SQLite `DB_FILE` aislado | Postgres cubierto por `test:pg` (fase 28); E2E más rápido |

**Installation:**

```bash
# Desde la raíz del repo
npm install -D @playwright/test@^1.60.0
npx playwright install chromium
# CI (Ubuntu): npx playwright install --with-deps chromium
```

**Version verification:** `npm view @playwright/test version` → `1.60.0` (2026-06-14).

## Architecture Patterns

### System Architecture Diagram

```
Operador / CI
    │
    ▼ npm run test:e2e
┌───────────────────────────────────────┐
│  Playwright Test Runner               │
│  e2e/playwright.config.js           │
│  ┌─────────────────────────────────┐  │
│  │ webServer[0]: api               │  │
│  │   npm start (cwd: api/)         │  │
│  │   health: GET :3100/health      │  │
│  │   env: JWT_SECRET, DB_FILE,     │  │
│  │        ADMIN_*, LOGIN_RATE_*    │  │
│  │        (NO AUTH_DISABLED)       │  │
│  └──────────────┬──────────────────┘  │
│  ┌──────────────▼──────────────────┐  │
│  │ webServer[1]: vanilla           │  │
│  │   python3 -m http.server 5173   │  │
│  │   cwd: dashboard/               │  │
│  └──────────────┬──────────────────┘  │
└─────────────────┼─────────────────────┘
                  │ ambos ready
                  ▼
┌───────────────────────────────────────┐
│  Chromium — auth-smoke.vanilla.spec   │
│  1. goto :5173 (contexto limpio)      │
│  2. assert gate visible               │
│  3. fill Email/Contraseña → Entrar    │
│     └─► POST :3100/auth/login         │
│         Set-Cookie: edf_session         │
│  4. assert tabla usuarios con filas    │
│     └─► fetch :3100/users (cookie)    │
│  5. Cerrar sesión → gate visible      │
└───────────────────────────────────────┘
```

### Recommended Project Structure

```
repo/
├── package.json              ← + devDep @playwright/test, scripts test:e2e
├── package-lock.json         ← nuevo
├── .nvmrc                    ← opcional: "22"
├── .gitignore                ← + artefactos Playwright
├── e2e/
│   ├── playwright.config.js
│   ├── fixtures/
│   │   └── auth.js           ← helper loginAsOperator (opcional, JS)
│   └── specs/
│       └── auth-smoke.vanilla.spec.js
├── api/                      ← sin cambios obligatorios
└── dashboard/                ← sin cambios obligatorios (selectores ya accesibles)
```

### Pattern 1: `playwright.config.js` — dos `webServer` (solo vanilla, fase 26)

**What:** Config CommonJS en `e2e/`; array de dos servidores; `baseURL` explícito porque con array Playwright no infiere puerto [CITED: https://playwright.dev/docs/test-webserver].

**When to use:** Siempre en fase 26. Ampliar a 4 entradas en fase 27.

**Example:**

```javascript
// e2e/playwright.config.js
// Source: https://playwright.dev/docs/test-webserver
const path = require('path');
const { defineConfig, devices } = require('@playwright/test');

const repoRoot = path.join(__dirname, '..');
const reuse = !process.env.CI;

const operatorEmail = process.env.E2E_OPERATOR_EMAIL || 'admin@lab.local';
const operatorPassword = process.env.E2E_OPERATOR_PASSWORD || 'changeme';

module.exports = defineConfig({
  testDir: path.join(__dirname, 'specs'),
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    ...devices['Desktop Chrome'],
  },

  webServer: [
    {
      name: 'api',
      command: 'npm start',
      cwd: path.join(repoRoot, 'api'),
      url: 'http://localhost:3100/health',
      timeout: 60_000,
      reuseExistingServer: reuse,
      stdout: 'ignore',
      stderr: 'pipe',
      env: {
        PORT: '3100',
        JWT_SECRET: process.env.E2E_JWT_SECRET || 'e2e-local-secret-not-for-production',
        DB_FILE: 'data/e2e.users.db',
        ADMIN_EMAIL: operatorEmail,
        ADMIN_PASSWORD: operatorPassword,
        LOGIN_RATE_LIMIT_MAX: process.env.LOGIN_RATE_LIMIT_MAX || '1000',
        CORS_ORIGINS: 'http://localhost:5173,http://localhost:5174,http://localhost:5175',
        // AUTH_DISABLED: deliberadamente ausente
        // DATABASE_URL: deliberadamente ausente → SQLite
      },
    },
    {
      name: 'vanilla',
      command: 'python3 -m http.server 5173',
      cwd: path.join(repoRoot, 'dashboard'),
      url: 'http://localhost:5173',
      timeout: 30_000,
      reuseExistingServer: reuse,
      stdout: 'ignore',
      stderr: 'pipe',
    },
  ],
});
```

**Decisiones clave del config:**

| Variable | Valor E2E | Motivo |
|----------|-----------|--------|
| `JWT_SECRET` | No vacío (dev/CI) | Cookie consistente; sin secret prod en git [VERIFIED: `api/auth.js` `getJwtSecret()`] |
| `DB_FILE` | `data/e2e.users.db` | Aislamiento de `users.db` dev y `users.test.db` API tests [VERIFIED: `api/db-sqlite.js`] |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Alineados con `E2E_OPERATOR_*` | Seed operador en BD vacía [VERIFIED: `api/seed.js`] |
| `LOGIN_RATE_LIMIT_MAX` | `1000` (default E2E) | Evita 429 con retries/workers [VERIFIED: `api/auth.js` L106-108] |
| `AUTH_DISABLED` | **no definir** | Smoke debe ejercitar gate real [VERIFIED: ROADMAP criterio 3] |
| `reuseExistingServer` | `!process.env.CI` | Local reutiliza tmux; CI arranque limpio [CITED: Playwright webServer docs] |

### Pattern 2: Smoke spec — `getByRole` / `getByLabel`

**What:** Un spec lineal sin Page Objects; credenciales desde env con fallback lab.

**When to use:** QA-E2E-02; plantilla para React/Vue en fase 27.

**Example:**

```javascript
// e2e/specs/auth-smoke.vanilla.spec.js
// Selectores derivados de dashboard/index.html (verificado en codebase)
const { test, expect } = require('@playwright/test');

const email = process.env.E2E_OPERATOR_EMAIL || 'admin@lab.local';
const password = process.env.E2E_OPERATOR_PASSWORD || 'changeme';

test.describe('Smoke auth — dashboard vanilla', () => {
  test('gate → login → tabla con datos → logout → gate', async ({ page }) => {
    await page.goto('/');

    // 1. Gate visible, dashboard oculto
    await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cerrar sesión' })).toBeHidden();

    // 2. Login operador
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Contraseña').fill(password);
    await page.getByRole('button', { name: 'Entrar' }).click();

    // 3. Tabla con datos (semilla users: john@example.com o jane@example.com)
    await expect(page.getByRole('button', { name: 'Cerrar sesión' })).toBeVisible();
    const table = page.getByRole('table');
    await expect(table).toBeVisible();
    await expect(table.getByRole('cell', { name: /john@example\.com|jane@example\.com/i })).toBeVisible();

    // 4. Logout → gate de nuevo
    await page.getByRole('button', { name: 'Cerrar sesión' }).click();
    await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cerrar sesión' })).toBeHidden();
  });
});
```

**Notas de aserción:**

- No usar `document.cookie` para `edf_session` (httpOnly). Opcional en debug: `page.context().cookies('http://localhost:3100')` [CITED: https://playwright.dev/docs/auth].
- Evitar paso «credenciales inválidas» en v2.0 baseline — consume cupo rate limit sin valor didáctico extra [VERIFIED: `.planning/research/SUMMARY.md` open question 5].
- `getByLabel('Email')` funciona porque `<label><span>Email</span><input>` asocia texto accesible [VERIFIED: `dashboard/index.html` L36-42].

### Pattern 3: Scripts raíz `package.json`

```json
{
  "scripts": {
    "test:e2e": "playwright test --config=e2e/playwright.config.js",
    "test:e2e:ui": "playwright test --config=e2e/playwright.config.js --ui",
    "test:e2e:headed": "playwright test --config=e2e/playwright.config.js --headed",
    "playwright:install": "playwright install chromium"
  },
  "devDependencies": {
    "@playwright/test": "^1.60.0"
  }
}
```

### Pattern 4: `.gitignore` — artefactos Playwright

Añadir al `.gitignore` raíz (complementa `api/data/*.db` ya existente):

```gitignore
# Playwright E2E
test-results/
playwright-report/
blob-report/
playwright/.auth/
```

`api/data/e2e.users.db` ya queda ignorado por `api/data/*.db` [VERIFIED: `.gitignore` L29-30].

### Pattern 5: Job CI interino `e2e-smoke` (vanilla, QA-CI-04)

Fase 26 puede añadir job separado (paralelo a `test-sqlite`). Fase 27 extiende specs; fase 28 añade `test-postgres`.

```yaml
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
      - run: npm ci
      - run: npm ci
        working-directory: api
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
        env:
          CI: true
          E2E_OPERATOR_EMAIL: admin@lab.local
          E2E_OPERATOR_PASSWORD: changeme
          LOGIN_RATE_LIMIT_MAX: '1000'
          E2E_JWT_SECRET: e2e-ci-secret-not-for-production
```

**Importante:** No definir `AUTH_DISABLED` en el job. Valores `E2E_*` son credenciales de laboratorio documentadas, no secretos de producción.

### Pattern 6: `.nvmrc` opcional

```
22
```

Alinea `nvm use` local con CI Node 22. No obligatorio si el entorno ya usa Node 22 [VERIFIED: `node --version` → v22.22.3 en máquina de desarrollo].

### Anti-Patterns to Avoid

- **`AUTH_DISABLED=1` en `webServer.env`:** Smoke falso; copia natural desde `test:sqlite` [VERIFIED: PITFALLS.md #2].
- **`storageState` como default:** Salta el formulario; anti-feature v2.0.
- **Login por `request.post` sin UI:** Válido como reto avanzado, no baseline didáctico.
- **`reuseExistingServer: true` en CI:** Procesos stale con env incorrecto.
- **Hardcodear credenciales solo en spec sin `ADMIN_*` en API:** Desalineación si cambia seed.
- **Cuatro `webServer` en fase 26:** Scope creep; React/Vue son fase 27.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Arrancar API + static server | Scripts shell paralelos custom | Playwright `webServer` array | Health URL, reuse, teardown, logs con `name` |
| Esperar puertos libres | Loop `curl` manual | `url` en cada `webServer` | Integrado en runner |
| Browser automation | Puppeteer/Selenium suelto | `@playwright/test` | Assertions, trace, reporter GitHub |
| Bypass auth en E2E | Cookie JWT manual / `AUTH_DISABLED` | Formulario login real | Contrato pedagógico v2.0 |
| Page Object framework | Capa POM para 1 spec | Helper `loginAsOperator` opcional | YAGNI para smoke único |

**Key insight:** El valor didáctico está en el **flujo observable** (gate → cookie httpOnly → datos → logout), no en la sofisticación del harness.

## Common Pitfalls

### Pitfall 1: Puerto ocupado / servidor stale

**What goes wrong:** `reuseExistingServer` reutiliza API vieja sin `JWT_SECRET` o con `AUTH_DISABLED` en `.env` del desarrollador.

**Why it happens:** Learners dejan tmux en 3100/5173 [VERIFIED: PITFALLS.md #1].

**How to avoid:** `reuseExistingServer: !process.env.CI`; documentar `lsof -i :3100 -i :5173` en `docs/10-tests.md`; en CI `CI=true` fuerza arranque fresco.

**Warning signs:** Smoke pasa sin mostrar gate; datos inesperados en tabla.

### Pitfall 2: HTTP 429 en login

**What goes wrong:** Retries + múltiples specs agotan 10 intentos / 15 min [VERIFIED: `api/auth.js`, default `LOGIN_RATE_LIMIT_MAX=10`].

**How to avoid:** `LOGIN_RATE_LIMIT_MAX=1000` en `webServer.env`; `workers: 1` en CI; un solo login por spec.

### Pitfall 3: `baseURL` ausente con `webServer` array

**What goes wrong:** `page.goto('/')` falla o apunta mal.

**Why it happens:** Con array, Playwright exige `use.baseURL` explícito [CITED: Playwright webServer docs].

**How to avoid:** `baseURL: 'http://localhost:5173'` en config.

### Pitfall 4: BD E2E contaminada

**What goes wrong:** Segunda ejecución sin BD limpia: usuarios extra, operador ya existe.

**How to avoid:** `DB_FILE=data/e2e.users.db` dedicado; borrar archivo en pre-test si hace falta (opcional `globalSetup`); en CI proceso nuevo cada run.

### Pitfall 5: Commitear artefactos o `.auth`

**What goes wrong:** `test-results/`, traces o `playwright/.auth/` en git.

**How to avoid:** Entradas `.gitignore` + revisión PR [CITED: Playwright auth docs].

## Code Examples

### Helper opcional `fixtures/auth.js`

```javascript
// e2e/fixtures/auth.js
async function loginAsOperator(page) {
  const email = process.env.E2E_OPERATOR_EMAIL || 'admin@lab.local';
  const password = process.env.E2E_OPERATOR_PASSWORD || 'changeme';
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Contraseña').fill(password);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.getByRole('button', { name: 'Cerrar sesión' }).waitFor({ state: 'visible' });
}

module.exports = { loginAsOperator };
```

### Documentación mínima `docs/10-tests.md` (QA-E2E-05)

Añadir sección «Smoke E2E (Playwright)» con:

```bash
# Desde la raíz (primera vez)
npm install
npm run playwright:install
cd api && npm ci && cd ..

# Ejecutar smoke vanilla
npm run test:e2e

# UI mode (depuración)
npm run test:e2e:ui
```

Tabla contrastando `AUTH_DISABLED=1` (supertest) vs login UI (E2E) — ampliar en fase 29.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Smoke manual Mission 14/15 | Playwright automatizado | v2.0 fase 26 | Misma UX, repetible en CI |
| Solo `test-sqlite` en CI | + `e2e-smoke` (26), + `test-postgres` (28) | v2.0 | Tres jobs paralelos al final |
| Sin root lockfile | Root `package-lock.json` con Playwright | fase 26 | Un `npm ci` raíz para E2E |

**Deprecated/outdated:**

- Asumir que E2E necesita cambios en `api/index.js` o `dashboard/app.js` para smoke mínimo — **no** [VERIFIED: SUMMARY.md].
- Cypress / `start-server-and-test` — explícitamente fuera de scope v2.0.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `getByLabel('Email')` resuelve el input `#login-email` en Chromium | Pattern 2 | Spec flake; fallback `getByRole('textbox', { name: 'Email' })` |
| A2 | Semilla siempre incluye `john@example.com` o `jane@example.com` en tabla users | Pattern 2 | Aserción de fila falla si `users.json` vacío y seed cambia |
| A3 | Job `e2e-smoke` vanilla en fase 26 es aceptable como interino antes de QA-CI-02 completo | Pattern 5 | Planner podría diferir CI a fase 27 — ROADMAP/SUMMARY favorecen interino con QA-CI-04 |
| A4 | `python3` disponible en PATH local y GHA `ubuntu-latest` | Environment | Falla `webServer` vanilla; fallback `npx serve` añadiría dep |

**Si A3 se confirma con usuario:** QA-CI-04 se cumple con env en config + job; QA-CI-02 (tres dashboards en PR) sigue en fase 27.

## Open Questions

1. **¿Job CI en fase 26 o solo local?**
   - What we know: QA-CI-04 mapea a fase 26; QA-CI-02 a fase 27.
   - Recommendation: Añadir job `e2e-smoke` vanilla en 26; extender en 27.

2. **¿Borrar `e2e.users.db` antes de cada run local?**
   - What we know: CI es proceso fresco; local puede acumular estado.
   - Recommendation: Confiar en seed idempotente; documentar `rm api/data/e2e.users.db` si hay flake.

3. **¿`docs/10-tests.md` completo o stub en 26?**
   - QA-E2E-05 exige documentación; DOCS-01 (matriz CI) es fase 29.
   - Recommendation: Sección E2E mínima en 26; matriz tres jobs en 28/29.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js 22+ | API (`node:sqlite`), Playwright | ✓ | v22.22.3 | — |
| npm | install + scripts | ✓ | — | — |
| Python 3 | `webServer` vanilla | ✓ | 3.14.3 | `npx serve dashboard -l 5173` (añade dep; evitar en v2.0) |
| `@playwright/test` | E2E | ✗ (Wave 0) | — | `npm install -D` en fase 26 |
| Chromium (Playwright) | tests | ✗ (Wave 0) | — | `playwright install chromium` |
| `api/node_modules` | `npm start` en webServer | ✓ (local) | — | `npm ci` en `api/` step CI |

**Missing dependencies with no fallback:**

- `@playwright/test` — bloquea ejecución hasta Wave 0 install.

**Missing dependencies with fallback:**

- Ninguno crítico tras install inicial.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| V2 Authentication | yes (bajo test) | Login UI real; no bypass |
| V3 Session Management | yes | Cookie httpOnly `edf_session`; no `.auth` en git |
| V4 Access Control | parcial | Smoke verifica gate 401→login→datos |
| V5 Input Validation | no (infra test) | — |
| V6 Cryptography | yes | `JWT_SECRET` solo valores CI/dev en `webServer.env`, nunca prod en repo |

### Known Threat Patterns for Playwright + Express auth

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Commitear `playwright/.auth/` o traces con cookies | Spoofing | `.gitignore`; CI ephemeral |
| `AUTH_DISABLED` en E2E | Elevation | Grep workflow; unset explícito |
| Credenciales prod en specs | Information disclosure | `E2E_OPERATOR_*` con defaults lab; sin `.env` en git |
| Rate limit como DoS en CI | Denial of service | `LOGIN_RATE_LIMIT_MAX` elevado solo en env test |

## Key Decisions for Planner

| # | Decision | Recommendation | Lock? |
|---|----------|----------------|-------|
| D1 | Ubicación Playwright | Root `e2e/` + devDep en `package.json` raíz | **Sí** |
| D2 | Config format | `e2e/playwright.config.js` CommonJS (`require`) | **Sí** |
| D3 | `webServer` count fase 26 | **2** (API + vanilla python :5173) | **Sí** |
| D4 | API backend E2E | SQLite `DB_FILE=data/e2e.users.db`; sin `DATABASE_URL` | **Sí** |
| D5 | Auth en E2E | UI login; **sin** `AUTH_DISABLED`; **sin** `storageState` default | **Sí** |
| D6 | Credenciales | `E2E_OPERATOR_EMAIL` / `E2E_OPERATOR_PASSWORD` en specs; mismos valores en `ADMIN_*` del `webServer` | **Sí** |
| D7 | Rate limit E2E | `LOGIN_RATE_LIMIT_MAX=1000` en `webServer.env` (+ CI job env) | **Sí** |
| D8 | JWT | `JWT_SECRET` no vacío en `webServer.env` (`E2E_JWT_SECRET` opcional en CI) | **Sí** |
| D9 | Selectores | `getByRole` + `getByLabel`; sin `data-testid` salvo flake | **Sí** |
| D10 | Browser CI | Chromium only | **Sí** |
| D11 | Scripts raíz | `test:e2e`, `test:e2e:ui`, `playwright:install` | **Sí** |
| D12 | `.gitignore` | `test-results/`, `playwright-report/`, `blob-report/`, `playwright/.auth/` | **Sí** |
| D13 | `.nvmrc` | Opcional `22` | Discreción planner |
| D14 | CI job fase 26 | `e2e-smoke` vanilla (interino) cumple QA-CI-04; triple dashboard → fase 27 | Recomendado |
| D15 | Docs | Sección E2E mínima en `docs/10-tests.md` (QA-E2E-05); matriz completa → fase 29 | **Sí** |

## Sources

### Primary (HIGH confidence)

- [Playwright webServer](https://playwright.dev/docs/test-webserver) — multi-server, `reuseExistingServer`, `baseURL`, `env`, `name`
- [Playwright Authentication](https://playwright.dev/docs/auth) — httpOnly, `.auth/` gitignore, anti-`storageState` pedagógico
- npm registry — `@playwright/test@1.60.0`
- Repo: `dashboard/index.html`, `dashboard/app.js`, `api/auth.js`, `api/seed.js`, `api/.env.example`, `package.json`, `.github/workflows/ci.yml`, `.planning/research/SUMMARY.md`, `.planning/research/STACK.md`, `.planning/research/PITFALLS.md`

### Secondary (MEDIUM confidence)

- `.planning/research/FEATURES.md` — escenarios smoke, anti-features
- `.planning/research/ARCHITECTURE.md` — env matrix E2E, job structure

### Tertiary (LOW confidence)

- Timing exacto primer green run GHA con dual `webServer` — validar en ejecución (ajustar `timeout` si hace falta)

## Metadata

**Confidence breakdown:**

- Standard stack: **HIGH** — Playwright 1.60.0 verificado; patrones webServer en docs oficiales
- Architecture: **HIGH** — DOM y auth contract verificados en codebase; scope vanilla acotado
- Pitfalls: **HIGH** — rate limit y AUTH_DISABLED confirmados en `api/auth.js` y PITFALLS v2.0

**Research date:** 2026-06-14  
**Valid until:** 2026-07-14 (Playwright estable; revisar si major bump)
