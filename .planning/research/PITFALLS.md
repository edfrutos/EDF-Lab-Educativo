# Domain Pitfalls — v2.0 Quality & CI

**Domain:** Playwright E2E + mandatory Postgres CI on multi-app localhost educational lab  
**Researched:** 2026-06-14  
**Milestone:** v2.0 Quality & CI  
**Overall confidence:** HIGH (codebase + Playwright/GitHub Actions official docs); MEDIUM (CI timing edge cases from community reports)

---

## Critical Pitfalls

Mistakes that cause rewrites, red CI on every PR, or teach the wrong security model.

### Pitfall 1: Port conflicts and `reuseExistingServer` collisions

**What goes wrong:** E2E fails locally with *"Port already in use"* or passes locally but fails in CI because Playwright attached to the wrong process — e.g. a dev Vite on `:5174` while tests expect a fresh stack on `:3100` / `:5173` / `:5174` / `:5175`.

**Why it happens:** The lab hardcodes four ports (`3100`, `5173`, `5174`, `5175`). Learners often leave tmux sessions running. Playwright's default `reuseExistingServer: !process.env.CI` reuses whatever is listening, which may be stale code, wrong env (`AUTH_DISABLED`, missing `JWT_SECRET`), or only partial stack (API up, React not).

**Consequences:** Flaky green/red toggling; tests exercise the wrong build; students blame Playwright instead of process hygiene.

**Prevention:**
- In `playwright.config`, use **`webServer` array** (API + static server + Vite apps) with explicit `url` readiness checks — API: `GET /health`; frontends: root 200. Official pattern: [Playwright webServer](https://playwright.dev/docs/test-webserver).
- Set **`reuseExistingServer: !process.env.CI`** (CI always cold start); document opt-in `PLAYWRIGHT_REUSE_SERVER=1` for fast local iteration only when ports are known-clean.
- Add **`--strictPort`** on Vite dev commands so a conflict fails fast instead of silently binding another port.
- Pre-flight script or mission step: `lsof -i :3100 -i :5173 -i :5174 -i :5175` before first E2E run.
- Never run E2E and manual dev on the same ports without stopping one side.

**Detection:** Playwright log shows `[WebServer]` started but UI shows old behavior; `curl localhost:5174` returns unexpected content; E2E passes only after killing tmux sessions.

**Phase:** **26 — Playwright E2E foundation** (webServer orchestration, port contract doc). **27 — Multi-dashboard E2E** (four-server array). **29 — Learning material** (mission troubleshooting section).

---

### Pitfall 2: `AUTH_DISABLED=1` misuse in E2E or CI

**What goes wrong:** E2E runs with auth bypass enabled, so tests never exercise login, cookies, or 401 UX — while students are taught the opposite in Mission 15. Worse: `AUTH_DISABLED=1` leaks into a "production-like" CI job or a student's `.env` during framework missions.

**Why it happens:** v1.5–v1.6 established `AUTH_DISABLED=1` as the **API test-only** escape hatch (`api/package.json` scripts set it for CRUD supertest). Old docs (Mission 13 Option A) still mention it for "quick CRUD without login." Copy-paste from `test:sqlite` into E2E `webServer.env` is a natural mistake.

**Consequences:** False confidence — green E2E while login/regression breaks; students learn that "tests skip auth"; security lesson undermined.

**Prevention:**
- **Never** set `AUTH_DISABLED` in Playwright `webServer.env`, GitHub Actions E2E job, or `.env.example` defaults. Explicitly **`AUTH_DISABLED` unset** in E2E/CI env blocks.
- Keep `AUTH_DISABLED=1` **only** in `npm run test:sqlite` / `test:pg` script prefixes (supertest CRUD block) — unchanged from v1.6.
- E2E must perform **real login** (UI or `POST /auth/login` via APIRequestContext) — the milestone smoke is *login → table → logout*.
- Docs/mission: repeat the v1.6 rule — `AUTH_DISABLED` is for **automated API CRUD tests**, not browser E2E or Mission 15.
- Add a negative check in CI config review: grep workflow for `AUTH_DISABLED` in E2E jobs → fail review.

**Detection:** E2E passes with login steps commented out; `/users` returns 200 without cookie in Network tab during test run.

**Phase:** **26 — Playwright E2E foundation** (env contract). **28 — Postgres CI required** (ensure PG job also never sets `AUTH_DISABLED` for auth coverage). **29 — Learning material** (NOTEBOOK entry, doc 10-tests cross-link).

---

### Pitfall 3: Cookie / `storageState` scoped to wrong origin

**What goes wrong:** Login succeeds on `:5173` but React test on `:5174` shows login gate; or saved `storageState` cookie is not sent to API requests; or one shared auth file works for vanilla but not Vite apps.

**Why it happens:** Each dashboard is a **different browser origin** (`http://localhost:5173` vs `:5174` vs `:5175`). The session cookie `edf_session` is set by API `:3100` but scoped to the **requesting page origin** via CORS + `Set-Cookie`. Playwright `storageState` is **per-origin** — cookies for `localhost:5173` do not apply on `5174`. Cross-origin API calls need `credentials: 'include'` (already in app code) **and** the cookie must exist in the browser context visiting that origin.

**Consequences:** Intermittent 401 on `GET /users`; students think "CORS broke again"; shared `playwright/.auth/user.json` reused across three projects without re-login per origin.

**Prevention:**
- Use **separate Playwright projects** (or separate `storageState` files) per dashboard: `playwright/.auth/vanilla.json`, `react.json`, `vue.json` — add `playwright/.auth/` to `.gitignore` ([Playwright auth docs](https://playwright.dev/docs/auth)).
- Setup project per origin: navigate to that dashboard's login UI, submit credentials, wait for **post-login DOM** (table visible, login form hidden), then `storageState({ path })`.
- Prefer **UI login in setup** over raw API login unless APIRequestContext uses the same `baseURL`/origin strategy; if using API login, ensure cookie domain/path works for subsequent page loads on that dashboard origin.
- Do **not** commit `storageState` files — they contain session tokens (Playwright security warning).
- For smoke tests that assert logout, either use fresh context per test or re-run setup after logout specs.

**Detection:** `storageState` JSON shows cookies only for one host; React spec fails at `GET /users` 401 while vanilla passes.

**Phase:** **26 — Playwright E2E foundation** (vanilla auth setup + storageState). **27 — Multi-dashboard E2E** (per-origin projects). **29 — Learning material** (explain origin vs API port).

---

### Pitfall 4: Login rate limit (`429`) during E2E and CI

**What goes wrong:** After several CI runs or parallel workers, `POST /auth/login` returns **429**; setup project fails; entire E2E suite red. Local dev "mysteriously" blocks login for 15 minutes.

**Why it happens:** `express-rate-limit` on login defaults to **10 attempts / 15 min / IP** (`api/auth.js`). E2E multiplies attempts: setup login × 3 dashboards × retries × parallel workers × re-runs. All share **one IP** (`127.0.0.1`) on the runner.

**Consequences:** Flaky CI; students hit 429 while experimenting with wrong passwords (already documented in NOTEBOOK v1.6) — amplified under automation.

**Prevention:**
- In **E2E/CI API env only**, set generous limits: `LOGIN_RATE_LIMIT_MAX=1000` (or disable via dedicated `E2E=1` env that raises max — **do not** remove limiter from production code path).
- **Authenticate once per origin** in setup projects; reuse `storageState` — do not login in every test.
- Keep **`workers: 1`** for auth setup projects; use `fullyParallel: false` for smoke suite initially.
- Separate **rate-limit.test.js** (uses `LOGIN_RATE_LIMIT_MAX=2`) from E2E — never run rate-limit tests in same process as E2E without env isolation.
- Document in NOTEBOOK: 429 during repeated E2E runs → check env overrides.

**Detection:** 429 response body matches Spanish rate-limit JSON; CI fails on setup step, not assertion step.

**Phase:** **26 — Playwright E2E foundation** (CI env for rate limit). **28 — Postgres CI** (same env block if E2E job shares workflow). **29 — Learning material** (NOTEBOOK + mission reto on 429).

---

### Pitfall 5: Postgres service health timing in GitHub Actions

**What goes wrong:** `npm run test:pg` fails with connection refused, "database does not exist", or reset by peer on first query — despite `services.postgres` block present.

**Why it happens:** (1) **`pg_isready` without `-d`** can succeed before `POSTGRES_DB` init finishes ([community race reports](https://github.com/Harol-Reina/Asterisk.Sdk/commit/3b3efb66dc3761ef48ea8ebd73d13e495c046f9c)). (2) GitHub Actions polls Docker health on an interval — default **10s interval** means Postgres may not appear ready until ~14s+ ([github/docs#43243](https://github.com/github/docs/pull/43243)). (3) This lab's `prepare-test-db.js` expects **`edf_lab_test`** — GHA service with only `POSTGRES_DB: edf_lab_test` is fine, but skipping prepare step causes "database does not exist". (4) Local Postgres on `:5432` + CI service port mapping conflict on self-hosted runners (rare).

**Consequences:** Mandatory PG job blocks every PR intermittently; students conflate "Postgres hard" with "CI misconfigured."

**Prevention:**
- Use health cmd: **`pg_isready -U edf_lab -d edf_lab_test`** (match `docs/10-tests.md` snippet).
- Prefer **`--health-interval 1s --health-timeout 1s --health-retries 30`** for faster, stable readiness (GitHub docs PR recommendation).
- Run **`npm run test:db:prepare`** as explicit CI step after service healthy — do not assume DB exists from `POSTGRES_DB` alone if script creates owner/grants.
- Set `DATABASE_URL=postgresql://edf_lab:edf_lab_dev@localhost:5432/edf_lab_test` in job env (mirror `index.pg.test.js` default).
- Optional belt-and-suspenders: retry loop in `prepare-test-db.js` on connection (1–2 retries) — only if flakes persist.
- Keep **`test-sqlite` and `test-postgres` as separate jobs** so SQLite signal is not lost when PG service fails.

**Detection:** First PG test fails, rerun passes; logs show connection error on step 1 not step N.

**Phase:** **28 — Postgres CI required** (workflow YAML, health cmd, prepare step). **29 — Learning material** (extend doc 10-tests from "optional" to "required" with failure modes).

---

## Moderate Pitfalls

### Pitfall 6: Flaky selectors across vanilla, React, and Vue

**What goes wrong:** Tests break when copy changes ("Iniciar sesión" vs "Entrar"), CSS class refactors, or React re-render timing — `page.click('text=Usuarios')` matches multiple nodes.

**Why it happens:** No `data-testid` in current dashboards; login gates use similar but not identical markup (`LoginGate.jsx` vs `LoginGate.vue` vs vanilla `#login-form`).

**Prevention:**
- Prefer **role + name** selectors: `getByRole('button', { name: /iniciar sesión/i })`, `getByRole('table')`, `getByLabel(/email/i)`.
- Add **minimal stable hooks** (`data-testid="login-email"`, `data-testid="users-table"`) in all three dashboards in the **same phase as first E2E** — lowest flake cost for teaching.
- Wait for **network idle or explicit API response** after login before asserting table — not fixed `sleep`.
- Use **`expect(locator).toBeVisible()`** not presence-only checks.
- Start with **one browser project (chromium)** in CI; add firefox/webkit only if justified (cost).

**Phase:** **26** (vanilla selectors + testids). **27** (parity across React/Vue). **29** (anti-pattern doc: CSS/XPath).

---

### Pitfall 7: CI time and cost explosion

**What goes wrong:** PR feedback jumps from ~1 min to 8–15 min; Playwright browser download dominates; three Vite dev servers + install `dashboard-react` + `dashboard-vue` node_modules on every run.

**Why it happens:** E2E is inherently heavier than `npm run test:sqlite`. Naive config runs full matrix (3 dashboards × 3 browsers) on every push.

**Prevention:**
- **Cache Playwright browsers**: `npx playwright install --with-deps chromium` with actions cache.
- **Smoke scope only for v2.0**: login → table visible → logout — no full CRUD E2E in milestone 1.
- **Single Chromium** in CI; parallelize dashboards via Playwright **projects**, not separate jobs (one webServer stack).
- **npm ci** with cache for `api/`, `dashboard-react/`, `dashboard-vue/` lockfiles — or hoist E2E to root workspace script.
- **Job parallelism**: `test-sqlite` ∥ `test-postgres` ∥ `test-e2e` — total wall clock ≈ max(job), not sum.
- Set **`retries: process.env.CI ? 1 : 0`** — not 2+ for smoke (masks real flakes).
- Document expected CI budget in README (~X min) so students know why E2E is PR-only or main+PR.

**Phase:** **26–28** (workflow design). **29** (README badge, doc 10-tests CI section).

---

### Pitfall 8: `webServer` starts API before Postgres is ready (E2E + PG path)

**What goes wrong:** E2E job uses `DATABASE_URL` to Postgres service but API boot races DB init — `/health` ok while `/auth/login` 500 on DB error.

**Why it happens:** Playwright waits for `/health` which may not touch DB; API `initDb()` fails silently or on first query.

**Prevention:**
- Start Postgres service (or compose) **before** API in workflow; use **`wait`** on API log line "listening" **after** DB migrate/init.
- Health endpoint enhancement (optional): `/health` includes DB ping when `DATABASE_URL` set — makes readiness meaningful.
- E2E smoke can run on **SQLite API** for speed; PG mandatory job stays **API-only** (`test:pg`) unless milestone explicitly requires E2E-on-Postgres (defer to avoid scope creep).

**Phase:** **28 — Postgres CI** (API tests). **27** if E2E-on-PG is required later.

---

## Minor Pitfalls

### Pitfall 9: Checking in Playwright traces / auth state / screenshots

**What goes wrong:** Repo bloat; accidental commit of session cookies in `playwright/.auth/`.

**Prevention:** `.gitignore`: `playwright/.auth/`, `test-results/`, `playwright-report/`, `blob-report/`. CI uploads artifacts on failure only.

**Phase:** **26**

---

### Pitfall 10: Vite `baseURL` vs Playwright `baseURL` mismatch

**What goes wrong:** `page.goto('/')` hits wrong app when project `baseURL` still points to `:5173` while testing Vue.

**Prevention:** Per-project `use.baseURL` in config; smoke specs live in project-specific folders.

**Phase:** **27**

---

## Teaching Pitfalls (students)

| Pitfall | What students experience | Wrong lesson | Right teaching |
|---------|-------------------------|--------------|----------------|
| **"E2E replaces API tests"** | Skip `npm test` locally | Browser tests cover everything | API tests (supertest) = contract; E2E = integration smoke — both required |
| **"AUTH_DISABLED for E2E speed"** | Bypass login in `.env` | Tests should skip auth | Auth *is* the feature under test in v2.0 |
| **"Playwright fixed my CORS bug"** | Tests pass with wrong CORS in headless | CORS optional | E2E uses real browser CORS + cookies — reproduce Mission 04/15 |
| **"CI red = project broken"** | PG job fails, SQLite green | Give up on Postgres | Teach job matrix: which layer failed |
| **"More sleeps = stable tests"** | `waitForTimeout(5000)` everywhere | Timing fixes quality | Explicit waits on locators/network |
| **"One auth file for all dashboards"** | Copy-paste setup from doc | Cookies portable across ports | Origins `:5173/5174/5175` are three sites — three logins |
| **"Rate limit is a bug"** | 429 after homework attempts | Remove limiter | Security feature — tune env in dev/E2E only |

**Phase:** **29 — Quality & CI learning material** (Mission 16 or extend doc 10-tests; NOTEBOOK v2.0 section; index update).

---

## Phase-Specific Warnings

| Phase (proposed v2.0) | Topic | Likely pitfall | Mitigation |
|----------------------|-------|----------------|------------|
| **26 — Playwright E2E foundation** | webServer + vanilla smoke | Port reuse / stale server | `reuseExistingServer: !CI`, strictPort |
| **26** | Auth env | `AUTH_DISABLED` in webServer | Explicit unset; real login |
| **26** | storageState | Single cookie file | Vanilla-only setup first |
| **26** | Rate limit | Setup hits 429 | CI env `LOGIN_RATE_LIMIT_MAX` high |
| **27 — Multi-dashboard E2E** | Origins | Shared storageState | Per-project auth files |
| **27** | Selectors | Text/CSS drift | role+name; optional testids |
| **28 — Postgres CI required** | GHA service | pg_isready race | `-d edf_lab_test`, 1s interval |
| **28** | DB exists | Skipped prepare | `npm run test:db:prepare` step |
| **28** | Job design | PG failure hides SQLite | Parallel jobs, required checks |
| **29 — Learning material** | Pedagogy | AUTH_DISABLED confusion | Mission + NOTEBOOK |
| **29** | Expectations | CI duration | Document ~minutes, smoke scope |

---

## Anti-Patterns to Avoid

| Anti-pattern | Instead |
|--------------|---------|
| E2E every CRUD operation × 3 frameworks in CI | Smoke auth path only in v2.0 |
| `AUTH_DISABLED=1` to make E2E green | Real login + storageState |
| One `webServer` entry manually started by student | Full automated stack in config |
| Mandatory PG job without health `-d` | Target DB in pg_isready |
| CSS selectors `.btn-primary` | role/label/testid |
| 3 browsers × 3 dashboards on every PR | Chromium smoke |

---

## Sources

| Source | Confidence | Used for |
|--------|------------|----------|
| [Playwright — Authentication / storageState](https://playwright.dev/docs/auth) | HIGH | Per-origin cookies, `.auth/` gitignore |
| [Playwright — webServer](https://playwright.dev/docs/test-webserver) | HIGH | Multi-server, reuseExistingServer, timeouts |
| [GitHub Docs — PostgreSQL service containers](https://docs.github.com/en/actions/use-cases-and-examples/using-containerized-services/creating-postgresql-service-containers) | HIGH | Service pattern baseline |
| [github/docs PR #43243 — health-interval 1s](https://github.com/github/docs/pull/43243) | MEDIUM | GHA polling backoff vs Docker interval |
| Codebase: `api/auth.js`, `api/package.json`, `.github/workflows/ci.yml`, `docs/10-tests.md`, `NOTEBOOK.md` | HIGH | Rate limit, AUTH_DISABLED, ports, PG test DB |
| Community: Asterisk.Sdk commit 3b3efb6 (pg_isready `-d` race) | MEDIUM | PG init race mitigation |

---

*Research for milestone v2.0 — feeds ROADMAP phase planning and phase-level RESEARCH.md*
