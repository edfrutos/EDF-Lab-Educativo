# Roadmap: EDF Lab Educativo

**Current Milestone:** v2.0 Quality & CI (Phases 26–29)

## Milestones

- ✅ **v1.0 Educational Lab MVP** — Phases 1–5 (shipped 2026-05-30)
- ✅ **v1.1 SQLite Persistence** — Phases 6–8 (shipped 2026-05-30)
- ✅ **v1.2 Docker & Compose** — Phases 9–11 (shipped 2026-05-31)
- ✅ **v1.3 PostgreSQL Persistence** — Phases 12–14 (shipped 2026-06-01)
- ✅ **v1.4 Frontend Framework Comparison** — Phases 15–17 (shipped 2026-06-01)
- ✅ **v1.5 Production Auth & Deployment** — Phases 18–21 (shipped 2026-06-02)
- ✅ **v1.6 Framework Auth & CI** — Phases 22–25 (shipped 2026-06-14, tag `v1.6`)
- 🚧 **v2.0 Quality & CI** — Phases 26–29 (in progress)

## Phases

### 🚧 v2.0 Quality & CI (Phases 26–29)

**Milestone Goal:** Automatizar confianza end-to-end en los tres dashboards y exigir la suite Postgres en cada PR — con material didáctico que convierte fricción real en aprendizaje.

- [x] **Phase 26: Fundación E2E Playwright (vanilla)** — Scaffold `e2e/`, webServer API+5173, smoke auth vanilla, script local
- [x] **Phase 27: E2E multi-dashboard** — Smoke React `:5174` y Vue `:5175`; job CI Playwright completo en PRs
- [x] **Phase 28: Postgres CI obligatorio** — Job `test-postgres` en cada PR; tres checks requeridos para merge
- [ ] **Phase 29: Material didáctico Quality & CI** — Doc 10-tests, Mission 16, NOTEBOOK v2.0

## Phase Details

### Phase 26: Fundación E2E Playwright (vanilla)
**Goal**: El operador puede ejecutar localmente un smoke E2E de autenticación en el dashboard vanilla sin levantar servidores a mano.
**Depends on**: Phase 25 (v1.6 shipped)
**Requirements**: QA-E2E-01, QA-E2E-02, QA-E2E-05, QA-CI-04
**Success Criteria** (what must be TRUE):
  1. `npm run test:e2e` desde la raíz arranca API `:3100` y vanilla `:5173` vía Playwright `webServer` y el smoke pasa en verde
  2. El smoke vanilla demuestra login gate → login válido → tabla de usuarios con datos → logout → gate de nuevo visible
  3. E2E nunca usa `AUTH_DISABLED`; la cookie `edf_session` se obtiene solo por formulario de login (UI real)
  4. Entorno E2E seguro: credenciales de operador configurables y rate limit elevado para evitar 429 en CI/local
  5. Artefactos Playwright (`test-results/`, `playwright-report/`, `playwright/.auth/`) están en `.gitignore`; cero secretos commiteados
**Plans**: 2 plans
**UI hint**: yes

Plans:
- [x] 26-01-PLAN.md — Scaffold Playwright: config dual webServer, smoke auth vanilla, toolchain raíz
- [x] 26-02-PLAN.md — Documentación E2E en docs/10-tests.md + job CI e2e-smoke vanilla

### Phase 27: E2E multi-dashboard
**Goal**: Los tres dashboards pasan el mismo smoke de autenticación y CI ejecuta la suite completa en cada pull request.
**Depends on**: Phase 26
**Requirements**: QA-E2E-03, QA-E2E-04, QA-CI-02
**Success Criteria** (what must be TRUE):
  1. Smoke React en `:5174` replica el flujo de Phase 26 (gate → login → tabla → logout → gate)
  2. Smoke Vue en `:5175` replica el mismo flujo con proyecto Playwright separado (cookies por origen)
  3. Job GitHub Actions `e2e-smoke` corre Chromium contra los tres dashboards en cada PR a `main`
  4. Selectores estables (`getByRole`/`getByLabel`; `data-testid` mínimos solo si hace falta) no rompen entre vanilla, React y Vue
**Plans**: 2 plans

Plans:
- [x] 27-01 — Smoke React/Vue specs + Playwright projects + shared auth flow helper
- [x] 27-02 — Documentación multi-dashboard + CI e2e-smoke completo

### Phase 28: Postgres CI obligatorio
**Goal**: Ningún PR puede mergearse sin pasar la suite Postgres además de SQLite y E2E.
**Depends on**: Phase 26 (independiente de 27 en wall-clock; secuencia didáctica browser antes que persistencia)
**Requirements**: QA-CI-01, QA-CI-03
**Success Criteria** (what must be TRUE):
  1. Cada PR a `main` ejecuta `npm run test:pg` contra servicio `postgres:16` en GitHub Actions y pasa en verde
  2. Job `test-sqlite` existente se mantiene; los tres jobs (`test-sqlite`, `test-postgres`, `e2e-smoke`) son checks requeridos para merge
  3. Postgres CI usa healthcheck con `pg_isready -d edf_lab_test`, DB aislada y `AUTH_DISABLED=1` solo en job API (nunca en E2E)
  4. README/badge reflejan la matriz de tres jobs obligatorios en PRs
**Plans**: 2 plans

Plans:
- [x] 28-01 — Job test-postgres (postgres:16 + test:pg)
- [x] 28-02 — Documentación matriz CI tres jobs + README

### Phase 29: Material didáctico Quality & CI
**Goal**: El alumno puede reproducir la puerta de calidad v2.0 en local y aprender de errores reales documentados.
**Depends on**: Phases 26, 27, 28
**Requirements**: DOCS-01, DOCS-02, DOCS-03
**Success Criteria** (what must be TRUE):
  1. `docs/10-tests.md` documenta setup E2E local, matriz CI (sqlite + postgres + e2e) y por qué Postgres es obligatorio en PRs
  2. Mission 16 guía ejecutar smoke E2E en local e interpretar un trace/screenshot de fallo
  3. `NOTEBOOK.md` incluye al menos dos entradas reales v2.0 (fricción E2E o Postgres CI) con causa y solución
  4. Tabla didáctica contrasta `AUTH_DISABLED=1` (supertest) vs login UI en E2E; duración esperada de CI documentada
**Plans**: TBD

<details>
<summary>✅ v1.6 Framework Auth & CI (Phases 22–25) — SHIPPED 2026-06-14</summary>

- [x] **Phase 22: React Dashboard Auth**
- [x] **Phase 23: Vue Dashboard Auth**
- [x] **Phase 24: CI & Rate Limiting**
- [x] **Phase 25: Framework Auth Learning Material**

See [.planning/milestones/v1.6-ROADMAP.md](milestones/v1.6-ROADMAP.md).

</details>

<details>
<summary>✅ v1.5 Production Auth & Deployment (Phases 18–21) — SHIPPED 2026-06-02</summary>

- [x] **Phase 18: Auth API & Protected Routes**
- [x] **Phase 19: Vanilla Dashboard Login**
- [x] **Phase 20: Secrets & Deploy Hardening**
- [x] **Phase 21: Auth & Deploy Learning Material**

See [.planning/milestones/v1.5-ROADMAP.md](milestones/v1.5-ROADMAP.md).

</details>

<details>
<summary>✅ v1.4 Frontend Framework Comparison (Phases 15–17) — SHIPPED 2026-06-01</summary>

See [.planning/milestones/v1.4-ROADMAP.md](milestones/v1.4-ROADMAP.md).

</details>

<details>
<summary>✅ v1.3 PostgreSQL Persistence (Phases 12–14) — SHIPPED 2026-06-01</summary>

See [.planning/milestones/v1.3-ROADMAP.md](milestones/v1.3-ROADMAP.md).

</details>

<details>
<summary>✅ v1.2 Docker & Compose (Phases 9–11) — SHIPPED 2026-05-31</summary>

See [.planning/milestones/v1.2-ROADMAP.md](milestones/v1.2-ROADMAP.md).

</details>

<details>
<summary>✅ v1.1 SQLite Persistence (Phases 6–8) — SHIPPED 2026-05-30</summary>

See [.planning/milestones/v1.1-ROADMAP.md](milestones/v1.1-ROADMAP.md).

</details>

<details>
<summary>✅ v1.0 Educational Lab MVP (Phases 1–5) — SHIPPED 2026-05-30</summary>

See [.planning/milestones/v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md).

</details>

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 26. Fundación E2E Playwright (vanilla) | v2.0 | 2/2 | Complete | 2026-06-15 |
| 27. E2E multi-dashboard | v2.0 | 2/2 | Complete | 2026-06-15 |
| 28. Postgres CI obligatorio | v2.0 | 2/2 | Complete | 2026-06-15 |
| 29. Material didáctico Quality & CI | v2.0 | 0/TBD | Not started | - |
| 22–25 | v1.6 | 8/8 | Complete | 2026-06-14 |
| 18–21 | v1.5 | 9/9 | Complete | 2026-06-02 |
| 1–17 | v1.0–v1.4 | — | Complete | 2026-05-26 → 2026-06-01 |

---
*Roadmap format: GSD — phase numbering continues across milestones*
