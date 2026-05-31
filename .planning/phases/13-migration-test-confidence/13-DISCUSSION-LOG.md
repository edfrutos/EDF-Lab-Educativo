# Phase 13 Discussion Log

**Phase:** 13 — Migration & Test Confidence  
**Date:** 2026-05-31  
**Mode:** Interactive (4 areas selected)

## Areas Discussed

1. Semilla Postgres (PGMIG-01)
2. Aislamiento de tests (PGTEST-02, PGTEST-03)
3. Matriz de tests (PGTEST-01)
4. Documentación PGMIG-02

---

## Area 1: Semilla Postgres

| Question | Options presented | Selection |
|----------|-------------------|-----------|
| Enfoque de semilla | Módulo compartido / Duplicar en db-pg / Reutilizar export sqlite | **Módulo compartido (seed.js)** |
| IDs en Postgres | SERIAL auto / IDs explícitos + reset sequence / Tú decides | **IDs explícitos + reset sequence** |
| Mensajes de log | Mismos que SQLite / Prefijo PG / Mínimo | **Mismos que SQLite** |
| DB con datos existentes | No-op COUNT>0 / FORCE_SEED flag / Tú decides | **Tú decides** → registrado en CONTEXT como no-op (igual SQLite) |

**Notes:** Alineado con Fase 7 v1.1 y D-16 de Fase 12.

---

## Area 2: Aislamiento de tests

| Question | Options presented | Selection |
|----------|-------------------|-----------|
| Aislamiento DB | edf_lab_test / TEST_DATABASE_URL doc / contenedor test | **edf_lab_test** |
| Creación de DB | test:db:prepare / manual / Tú decides | **test:db:prepare** |
| Limpieza between tests | TRUNCATE / DROP+schema / transacciones | **TRUNCATE RESTART IDENTITY** |
| Postgres requerido | localhost obligatorio / skip si no hay / compose profile | **localhost obligatorio** |

---

## Area 3: Matriz de tests

| Question | Options presented | Selection |
|----------|-------------------|-----------|
| Cuándo corre PG | Dual en npm test / test:pg separado / solo PG | **Dual en npm test** |
| Archivo de tests | index.pg.test.js / mismo archivo con flag / Tú decides | **index.pg.test.js separado** |
| Scripts | Solo api/ / raíz + api/ | **Raíz + api/** |
| Regresión SQLite | npm test rápido sin Docker / documentar ambos | **Sí — index.test.js intacto** |

**Notes:** `npm test` encadena SQLite luego Postgres; ambos deben pasar con Postgres levantado.

---

## Area 4: Documentación PGMIG-02

| Question | Options presented | Selection |
|----------|-------------------|-----------|
| Dónde documentar | Sección en 13-sqlite / solo README / stub doc 15 | **Sección en docs/13-sqlite.md** |
| Profundidad | Tabla corta / tabla + comandos / párrafo mínimo | **Tabla + comandos ejecutables** |
| Solapamiento Fase 14 | Sin tutorial Compose / solapamiento OK | **Sin tutorial Compose (Fase 14)** |
| Índice | No hasta Fase 14 / nota en 13-sqlite | **No actualizar 00-indice en Fase 13** |

---

## Deferred During Discussion

- FORCE_SEED flag — not in Phase 13 scope
- Separate postgres-test Docker service — rejected
- Full doc 15 / Mission 12 — Phase 14

---

*Log generated from /gsd-discuss-phase 13*
