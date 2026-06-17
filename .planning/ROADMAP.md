# Roadmap: EDF Lab Educativo

**Current Milestone:** v2.5 Production Deploy (Phases 42–45) — **PLANNING**

## Milestones

- ✅ **v1.0 Educational Lab MVP** — Phases 1–5 (shipped 2026-05-30)
- ✅ **v1.1 SQLite Persistence** — Phases 6–8 (shipped 2026-05-30)
- ✅ **v1.2 Docker & Compose** — Phases 9–11 (shipped 2026-05-31)
- ✅ **v1.3 PostgreSQL Persistence** — Phases 12–14 (shipped 2026-06-01)
- ✅ **v1.4 Frontend Framework Comparison** — Phases 15–17 (shipped 2026-06-01)
- ✅ **v1.5 Production Auth & Deployment** — Phases 18–21 (shipped 2026-06-02)
- ✅ **v1.6 Framework Auth & CI** — Phases 22–25 (shipped 2026-06-14, tag `v1.6`)
- ✅ **v2.0 Quality & CI** — Phases 26–29 (shipped 2026-06-15, tag `v2.0`)
- ✅ **v2.1 Advanced E2E** — Phases 30–33 (shipped 2026-06-16)
- ✅ **v2.2 Visual Regression** — Phases 34–37 (shipped 2026-06-17)
- ✅ **v2.3 Auth Advanced** — Phases 38–39 (shipped 2026-06-17)
- ✅ **v2.4 OAuth Foundation** — Phases 40-41 shipped 2026-06-17
- 🚧 **v2.5 Production Deploy** — Phases 42–45 (planning)

## Phases

### Phase 34: Fundación visual vanilla

**Goal:** El operador puede ejecutar snapshots Playwright estables en el dashboard vanilla con baselines versionadas y política anti-flake documentada.  
**Depends on:** v2.1 (auth smoke + CRUD E2E estables)  
**Requirements:** QA-VIS-01, QA-VIS-03  
**Plans:** 2/2 plans complete

Plans:
**Wave 1**

- [x] 34-01-PLAN.md — Helper `visual-flow.js`, spec `visual.vanilla.spec.js`, `snapshotPathTemplate`

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 34-02-PLAN.md — Config Playwright visual, `maxDiffPixelRatio`, docs borrador y verificación local

**Success criteria:**

1. Tras login UI, el spec captura al menos un snapshot estable (tabla de usuarios visible).
2. Baselines viven en el repo bajo ruta predecible (`e2e/**-snapshots/`).
3. `npm run test:visual` (o equivalente) pasa en Chromium local.
4. Política de threshold y `--update-snapshots` documentada en comentario o `docs/10-tests.md` (borrador).

---

### Phase 35: Visual multi-dashboard

**Goal:** React y Vue repiten snapshots equivalentes a vanilla sin duplicar lógica de preparación de estado.  
**Depends on:** Phase 34  
**Requirements:** QA-VIS-02  
**Plans:** 2/2

Plans:
**Wave 1**

- [x] 35-01-PLAN.md — Specs `visual.react` / `visual.vue` reutilizando helper compartido

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 35-02-PLAN.md — Proyectos Playwright, viewport unificado, verificación 3 dashboards

**Success criteria:**

1. Spec React (`:5174`) genera snapshot comparable al de vanilla (mismo viewport).
2. Spec Vue (`:5175`) genera snapshot comparable.
3. `npm run test:visual` ejecuta los tres dashboards (3+ specs).
4. Contenido dinámico (timestamps, filas variables) enmascarado o con fixture estable.

---

### Phase 36: CI visual regression

**Goal:** CI ejecuta regresión visual en cada PR sin romper los jobs E2E existentes.  
**Depends on:** Phase 35  
**Requirements:** QA-VIS-04, QA-CI-06  
**Plans:** 2/2

Plans:
**Wave 1**

- [x] 36-01-PLAN.md — Job `visual-regression` en `.github/workflows/ci.yml`, script `test:visual:ci`

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 36-02-PLAN.md — Artefactos diff en fallo, docs flujo baseline update en PR, verificación CI

**Success criteria:**

1. Job CI dedicado corre snapshots Chromium en PRs.
2. Fallo de snapshot produce diff revisable (artefacto o instrucción clara).
3. Los cuatro jobs E2E/API existentes siguen pasando sin cambio de contrato.
4. Flujo documentado para actualizar baselines cuando el cambio UI es intencional.

---

### Phase 37: Material didáctico visual

**Goal:** El alumno tiene misión, NOTEBOOK y docs para la puerta de regresión visual.  
**Depends on:** Phase 36  
**Requirements:** DOCS-04, DOCS-05, DOCS-06  
**Plans:** 2/2

Plans:
**Wave 1**

- [x] 37-01-PLAN.md — Mission 18, ampliación `docs/10-tests.md`, índice/README

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 37-02-PLAN.md — NOTEBOOK v2.2 (≥2 fricciones reales), verificación milestone

**Success criteria:**

1. Mission 18 publicada con objetivo, pasos, resultado y reto extra.
2. `docs/10-tests.md` incluye sección visual regression (setup, update, flake).
3. Sección NOTEBOOK v2.2 con ≥2 entradas de fricción real.
4. Ruta v2.2 enlazada desde `docs/00-indice.md` y `README.md`.

---

### Phase 38: Auth advanced foundation

**Goal:** El operador autenticado puede cambiar su contraseña con validaciones claras sin romper login/logout ni el flujo CRUD protegido.  
**Depends on:** v2.2 (auth/cookies + tests consolidados)  
**Requirements:** AUTH-ADV-03  
**Plans:** 2/2

Plans:
**Wave 1**

- [x] 38-01-PLAN.md — Endpoint `PATCH /auth/password`, validaciones y tests API

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 38-02-PLAN.md — docs auth, misiones y NOTEBOOK alineados al nuevo flujo

**Success criteria:**

1. Endpoint autenticado `PATCH /auth/password` disponible y aditivo.
2. Cambio exige `currentPassword` válida y `newPassword` con validación básica.
3. Suite SQLite pasa con cobertura de password change (sin romper auth previa).
4. `docs/17-autenticacion.md`, misiones 14/15 y `NOTEBOOK.md` reflejan fase 38.

---

### Phase 39: Refresh token rotation foundation

**Goal:** El operador mantiene sesión renovable con rotación de refresh token, sin romper login/logout ni el acceso protegido actual.  
**Depends on:** Phase 38  
**Requirements:** AUTH-ADV-02  
**Plans:** 2/2

Plans:
**Wave 1**

- [x] 39-01-PLAN.md — contrato backend refresh + persistencia mínima + tests auth

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 39-02-PLAN.md — alineación docs/misiones/NOTEBOOK + verificación de fase

**Success criteria:**

1. Endpoint de refresh con rotación e invalidación del token previo.
2. Tests auth cubren refresh válido, refresh inválido y reuse/revocación básica.
3. Flujo login/logout actual sigue estable.
4. `docs/17-autenticacion.md` y misión auth reflejan el nuevo ciclo de sesión.

---

### Phase 40: OAuth social login foundation

**Goal:** El operador puede iniciar un flujo OAuth/social de forma controlada y didáctica sin romper el contrato auth vigente.  
**Depends on:** Phase 39  
**Requirements:** AUTH-ADV-01  
**Plans:** 2/2

Plans:
**Wave 1**

- [x] 40-01-PLAN.md — contrato OAuth backend (start/callback) + tests base

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 40-02-PLAN.md — docs/misiones/NOTEBOOK y verificación de fase

**Success criteria:**

1. Existe contrato backend para iniciar y completar flujo OAuth.
2. El flujo OAuth emite sesión compatible con rutas protegidas actuales.
3. Login clásico y refresh rotation previos siguen estables.
4. Documentación auth refleja claramente cuándo usar login clásico vs social.

---

### Phase 42: Compose prod profile & reverse proxy

**Goal:** El operador puede levantar un perfil Compose `prod` con nginx como único origen HTTPS que enruta `/api` a Express y sirve el dashboard estático, sin romper el modo dev en host.  
**Depends on:** Phase 41 (auth/OAuth estable)  
**Requirements:** PROD-02, PROD-04, PROD-06  
**Plans:** 0/2

Plans:
**Wave 1**

- [ ] 42-01-PLAN.md — perfil Compose prod, nginx `/api` + static, `API_BASE_URL` relativa en dashboard

**Wave 2** *(blocked on Wave 1 completion)*

- [ ] 42-02-PLAN.md — verificación modo dual (dev host intacto) y smoke básico del perfil prod

**Success criteria:**

1. `docker compose --profile prod up` expone HTTPS en un solo puerto/origen.
2. Peticiones del dashboard a `/api/*` llegan a Express sin CORS cross-origin en prod.
3. `cd api && PORT=3100 npm start` + `python3 -m http.server 5173` siguen funcionando como antes.

---

### Phase 43: TLS local & proxy trust

**Goal:** El operador prueba HTTPS local con certificados autofirmados y login con cookie `Secure` bajo `NODE_ENV=production`, con la API confiando en el proxy.  
**Depends on:** Phase 42  
**Requirements:** PROD-03, PROD-05  
**Plans:** 0/2

Plans:
**Wave 1**

- [ ] 43-01-PLAN.md — generación certs autofirmados, nginx TLS, arranque prod con `NODE_ENV=production`

**Wave 2** *(blocked on Wave 1 completion)*

- [ ] 43-02-PLAN.md — `trust proxy` / `X-Forwarded-Proto` en API + verificación login Secure

**Success criteria:**

1. Login operador funciona por HTTPS local (cert autofirmado documentado).
2. Cookie `edf_session` se emite con `Secure` en producción y persiste en el flujo CRUD.
3. La API no asume HTTPS directo cuando está detrás de nginx.

---

### Phase 44: Let's Encrypt automation

**Goal:** El operador dispone de scripts y guía para obtener y renovar certificados Let's Encrypt en un VPS con dominio real.  
**Depends on:** Phase 43  
**Requirements:** PROD-01  
**Plans:** 0/2

Plans:
**Wave 1**

- [ ] 44-01-PLAN.md — scripts certbot (obtener/renovar), plantillas de dominio y volúmenes certs

**Wave 2** *(blocked on Wave 1 completion)*

- [ ] 44-02-PLAN.md — guía VPS en docs, variables de entorno prod y checklist de despliegue

**Success criteria:**

1. Scripts documentados ejecutables para emisión inicial y renovación de certs.
2. Flujo descrito de punta a punta: dominio → certbot → nginx prod → health check HTTPS.
3. Sin credenciales reales en el repositorio.

---

### Phase 45: Material didáctico production deploy

**Goal:** El alumno tiene docs, misión y NOTEBOOK para reproducir el despliegue prod y aprender de fricciones reales.  
**Depends on:** Phase 44  
**Requirements:** DOCS-07, DOCS-08, DOCS-09  
**Plans:** 0/2

Plans:
**Wave 1**

- [ ] 45-01-PLAN.md — ampliar `docs/18-production-deploy.md`, misión nueva, enlaces en índice/README

**Wave 2** *(blocked on Wave 1 completion)*

- [ ] 45-02-PLAN.md — NOTEBOOK v2.5 (≥2 fricciones), verificación milestone v2.5

**Success criteria:**

1. `docs/18-production-deploy.md` cubre modo dual, TLS local y LE.
2. Misión publicada con objetivo, pasos, resultado y reto extra.
3. NOTEBOOK v2.5 con ≥2 entradas de error real (certs, proxy, CORS same-origin).

---

<details>
<summary>✅ v2.4 OAuth Foundation (Phases 40–41) — SHIPPED 2026-06-17</summary>

- [x] Phase 40: OAuth social login foundation (2/2 plans) — completed 2026-06-17
- [x] Phase 41: OAuth dashboard integration foundation (2/2 plans) — completed 2026-06-17

See [.planning/milestones/v2.4-ROADMAP.md](milestones/v2.4-ROADMAP.md).

</details>

---

<details>
<summary>✅ v2.1 Advanced E2E (Phases 30–33) — SHIPPED 2026-06-16</summary>

See [.planning/milestones/v2.1-ROADMAP.md](milestones/v2.1-ROADMAP.md) when archived.

</details>

<details>
<summary>✅ v2.0 Quality & CI (Phases 26–29) — SHIPPED 2026-06-15</summary>

See [.planning/milestones/v2.0-ROADMAP.md](milestones/v2.0-ROADMAP.md).

</details>

<details>
<summary>Earlier milestones (v1.0–v1.6)</summary>

See `.planning/milestones/` archives.

</details>

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 34 | v2.2 | 2/2 | Complete    | 2026-06-16 |
| 35 | v2.2 | 2/2 | Complete    | 2026-06-16 |
| 36 | v2.2 | 2/2 | Complete    | 2026-06-17 |
| 37 | v2.2 | 2/2 | Complete    | 2026-06-17 |
| 38 | v2.3 | 2/2 | Complete    | 2026-06-17 |
| 39 | v2.3 | 2/2 | Complete | 2026-06-17 |
| 40 | v2.4 | 2/2 | Complete | 2026-06-17 |
| 41 | v2.4 | 2/2 | Complete | 2026-06-17 |
| 42 | v2.5 | 0/2 | Not started | - |
| 43 | v2.5 | 0/2 | Not started | - |
| 44 | v2.5 | 0/2 | Not started | - |
| 45 | v2.5 | 0/2 | Not started | - |
| 30–33 | v2.1 | 8/8 | Complete | 2026-06-16 |
| 26–29 | v2.0 | 8/8 | Complete | 2026-06-15 |

---
*Roadmap format: GSD — phase numbering continues across milestones*
