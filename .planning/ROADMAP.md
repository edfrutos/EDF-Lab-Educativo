# Roadmap: EDF Lab Educativo

**Current Milestone:** v2.1 Advanced E2E (Phases 30–33)

## Milestones

- ✅ **v1.0 Educational Lab MVP** — Phases 1–5 (shipped 2026-05-30)
- ✅ **v1.1 SQLite Persistence** — Phases 6–8 (shipped 2026-05-30)
- ✅ **v1.2 Docker & Compose** — Phases 9–11 (shipped 2026-05-31)
- ✅ **v1.3 PostgreSQL Persistence** — Phases 12–14 (shipped 2026-06-01)
- ✅ **v1.4 Frontend Framework Comparison** — Phases 15–17 (shipped 2026-06-01)
- ✅ **v1.5 Production Auth & Deployment** — Phases 18–21 (shipped 2026-06-02)
- ✅ **v1.6 Framework Auth & CI** — Phases 22–25 (shipped 2026-06-14, tag `v1.6`)
- ✅ **v2.0 Quality & CI** — Phases 26–29 (shipped 2026-06-15, tag `v2.0`)
- 🚧 **v2.1 Advanced E2E** — Phases 30–33 (planning)

## Phases

### Phase 30: CRUD E2E vanilla ✅

**Goal:** El operador puede ejecutar localmente un ciclo CRUD completo en el dashboard vanilla vía Playwright, con datos únicos por ejecución.  
**Depends on:** v2.0 (smoke auth + quad `webServer`)  
**Requirements:** QA-ADV-01  
**Plans:** 2/2 complete — **Verified 2026-06-15** (`30-VERIFICATION.md`, passed 7/7)
Plans:
**Wave 1**

- [x] 30-01-PLAN.md — Helper `crud-flow.js` + spec `crud.vanilla.spec.js`

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 30-02-PLAN.md — Config Playwright, docs CRUD y verificación `npm run test:e2e`

**Success criteria:**

1. Tras login UI, el spec crea un usuario con email único y lo ve en la tabla.
2. El spec edita nombre y/o email y verifica el cambio en UI.
3. El spec elimina el usuario y la fila desaparece.
4. Helper `crud-flow` reutilizable documentado en comentario o `docs/10-tests.md` (borrador).

---

### Phase 31: CRUD E2E multi-dashboard ✅

**Goal:** React y Vue repiten el mismo ciclo CRUD que vanilla sin duplicar lógica de aserciones.  
**Depends on:** Phase 30  
**Requirements:** QA-ADV-02  
**Plans:** 2/2 complete — **Verified 2026-06-15** (`31-VERIFICATION.md`, passed 6/6)

Plans:
**Wave 1**

- [x] 31-01-PLAN.md — IDs CRUD en React/Vue + specs `crud.react` / `crud.vue`

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 31-02-PLAN.md — testMatch Playwright, docs multi-dashboard, verificación 6 tests

**Success criteria:**

1. Spec React (`:5174`) pasa create → edit → delete con el helper compartido.
2. Spec Vue (`:5175`) pasa el mismo flujo.
3. `npm run test:e2e` ejecuta smoke auth + CRUD (6 specs o proyectos equivalentes).
4. Selectores estables (`#login-email`, formularios CRUD) alineados entre los tres dashboards.

---

### Phase 32: E2E contra API Postgres

**Goal:** La suite E2E puede arrancar la API contra Postgres aislado, no solo SQLite `e2e.users.db`.  
**Depends on:** Phase 31 (CRUD estable en SQLite)  
**Requirements:** QA-ADV-03, QA-CI-05  
**Plans:** 0/2 planned — 2026-06-15

Plans:
**Wave 1**

- [ ] 32-01-PLAN.md — `edf_lab_e2e`, `playwright.config.pg.js`, `test:e2e:pg`

**Wave 2** *(blocked on Wave 1 completion)*

- [ ] 32-02-PLAN.md — Job CI `e2e-postgres`, docs y verificación

**Success criteria:**

1. Config o perfil Playwright arranca API con `DATABASE_URL` apuntando a BD de test (`edf_lab_e2e`).
2. Auth smoke pasa contra Postgres; CRUD smoke pasa o queda documentado si se limita a smoke en PG.
3. CI o script local documentado para levantar Postgres de test antes de E2E PG.
4. Nunca se usa la BD de desarrollo `edf_lab` en E2E.

---

### Phase 33: Multi-browser CI y material didáctico

**Goal:** CI cubre más de un motor de navegador y el alumno tiene misión + NOTEBOOK para la puerta E2E avanzada.  
**Depends on:** Phase 32  
**Requirements:** QA-ADV-04, DOCS-01, DOCS-02, DOCS-03  
**Plans:** 0/0

**Success criteria:**

1. Job `e2e-smoke` (o hermano) ejecuta Chromium y Firefox en CI.
2. WebKit: job opcional en CI o instrucción explícita `npx playwright install webkit` en docs.
3. Mission 17 publicada con objetivo, pasos, resultado y reto extra.
4. `docs/10-tests.md` actualizado (CRUD, Postgres E2E, matriz navegadores).
5. Sección NOTEBOOK v2.1 con ≥2 entradas de fricción real.

---

<details>
<summary>✅ v2.0 Quality & CI (Phases 26–29) — SHIPPED 2026-06-15</summary>

See [.planning/milestones/v2.0-ROADMAP.md](milestones/v2.0-ROADMAP.md).

</details>

<details>
<summary>✅ v1.6 Framework Auth & CI (Phases 22–25) — SHIPPED 2026-06-14</summary>

See [.planning/milestones/v1.6-ROADMAP.md](milestones/v1.6-ROADMAP.md).

</details>

<details>
<summary>Earlier milestones (v1.0–v1.5)</summary>

See `.planning/milestones/` archives.

</details>

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 30 | v2.1 | 2/2 | Complete | 2026-06-15 |
| 31 | v2.1 | 2/2 | Complete | 2026-06-15 |
| 32 | v2.1 | 0/2 | Planned | — |
| 33 | v2.1 | — | Not started | — |
| 26–29 | v2.0 | 8/8 | Complete | 2026-06-15 |
| 22–25 | v1.6 | 8/8 | Complete | 2026-06-14 |

---
*Roadmap format: GSD — phase numbering continues across milestones*
