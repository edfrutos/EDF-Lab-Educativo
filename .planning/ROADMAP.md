# Roadmap: EDF Lab Educativo

**Current Milestone:** v2.2 Visual Regression (Phases 34–37)

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
- 🚧 **v2.2 Visual Regression** — Phases 34–37 (executing)

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
**Plans:** 0/2

Plans:
**Wave 1**

- [ ] 37-01-PLAN.md — Mission 18, ampliación `docs/10-tests.md`, índice/README

**Wave 2** *(blocked on Wave 1 completion)*

- [ ] 37-02-PLAN.md — NOTEBOOK v2.2 (≥2 fricciones reales), verificación milestone

**Success criteria:**

1. Mission 18 publicada con objetivo, pasos, resultado y reto extra.
2. `docs/10-tests.md` incluye sección visual regression (setup, update, flake).
3. Sección NOTEBOOK v2.2 con ≥2 entradas de fricción real.
4. Ruta v2.2 enlazada desde `docs/00-indice.md` y `README.md`.

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
| 37 | v2.2 | 0/2 | Not started | — |
| 30–33 | v2.1 | 8/8 | Complete | 2026-06-16 |
| 26–29 | v2.0 | 8/8 | Complete | 2026-06-15 |

---
*Roadmap format: GSD — phase numbering continues across milestones*
