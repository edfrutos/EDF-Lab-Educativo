# Phase 6: SQLite Persistence Layer - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-30
**Phase:** 6-SQLite Persistence Layer
**Areas discussed:** code structure, schema visibility, phase 6 seed, env naming, id strategy

---

## Code structure

| Option | Description | Selected |
|--------|-------------|----------|
| db.js separado | initDb(), queries CRUD; index.js solo rutas | ✓ |
| Inline en index.js | Como loadUsers/saveUsers actuales | |
| Tú decides | Elige lo más didáctico | |

**User's choice:** db.js separado
**Notes:** Separación didáctica entre capa HTTP y capa de datos.

---

## Schema visibility

| Option | Description | Selected |
|--------|-------------|----------|
| api/schema.sql | Archivo legible que el alumno abre | ✓ |
| CREATE TABLE en db.js | Schema visible en código JS | |
| Ambos | schema.sql fuente + db.js lo ejecuta | (implícito en D-03/D-04) |

**User's choice:** api/schema.sql
**Notes:** Cumple SQLITE-03 — schema explícito fuera del ruido de rutas.

---

## Phase 6 first-run seed

| Option | Description | Selected |
|--------|-------------|----------|
| Seed John/Jane vía SQL | API usable desde Fase 6 | ✓ (Claude discretion) |
| Solo CREATE TABLE | Datos en Fase 7 | |
| Tú decides | Equilibrio didáctico | ✓ (user delegated) |

**User's choice:** Claude decides → INSERT seed if table empty after schema init
**Notes:** API funcional sin esperar migración JSON (Fase 7). users.json no se lee en runtime en Fase 6.

---

## Environment variable

| Option | Description | Selected |
|--------|-------------|----------|
| DB_FILE | Nueva var, default api/data/users.db | ✓ |
| Reutilizar DATA_FILE | Misma var apunta al .db | |
| SQLITE_PATH | Nombre alternativo | |

**User's choice:** DB_FILE
**Notes:** Paralelo claro a DATA_FILE sin reutilizar el nombre (evita confusión post-JSON).

---

## ID generation

| Option | Description | Selected |
|--------|-------------|----------|
| AUTOINCREMENT | Idiomático SQLite | ✓ |
| Contador nextId | Paralelo al patrón JSON | |
| Tú decides | Lo más enseñable | |

**User's choice:** INTEGER PRIMARY KEY AUTOINCREMENT
**Notes:** Elimina nextUserId en memoria; POST usa lastInsertRowid.

---

## Claude's Discretion

- Seed INSERT location (schema.sql vs initDb after empty check)
- Prepared statements vs string SQL
- Sort in SQL vs Lodash
- OpenAPI update timing

## Deferred Ideas

- JSON migration, test isolation, docs/missions — Phases 7–8
- Docker volume for .db — v1.2
