# Phase 7: Migration & Test Confidence - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-30
**Phase:** 7-Migration & Test Confidence
**Areas discussed:** migration trigger, migration semantics, duplicate email, test coverage

---

## Migration trigger

| Option | Description | Selected |
|--------|-------------|----------|
| Automatic in initDb() | If table empty, read users.json before hardcoded seed | ✓ |
| Separate npm script | npm run migrate; initDb() only schema + fallback | |
| Claude decides | Most didactic for beginners | |

**User's choice:** Automatic in initDb()
**Notes:** User selected all four sub-questions in this area.

### Sub-decisions

| Question | Options | Selected |
|----------|---------|----------|
| JSON source path | Fixed api/data/users.json / SEED_FILE env / Claude decides | Claude decides → locked as fixed path in CONTEXT |
| Console log on migrate | Yes didactic log / Silent / Log only on failure | Yes — "Migrados N usuarios desde users.json" |
| When NOT to migrate | Only if COUNT=0 / Always merge / Claude decides | Only if table empty (skip if rows exist) |

---

## Migration semantics

| Option | Description | Selected |
|--------|-------------|----------|
| Preserve IDs from JSON | INSERT with explicit id | ✓ |
| Ignore IDs | SQLite AUTOINCREMENT assigns new | |
| Claude decides | | |

**User's choice:** Preserve IDs from JSON

### Sub-decisions

| Question | Options | Selected |
|----------|---------|----------|
| Fallback order | JSON first → hardcoded seed / JSON only / JSON only source | JSON first → hardcoded John/Jane |
| Corrupt JSON | Restore seed / Fail startup / Empty + warn | Restore seed (Phase 2 parity) |
| nextId field | Ignore / Sync sqlite_sequence / Claude decides | Claude decides → ignore, AUTOINCREMENT handles |

---

## Duplicate email

| Option | Description | Selected |
|--------|-------------|----------|
| UNIQUE in schema.sql | Constraint + catch SQLite error | ✓ |
| App-only check | SELECT before INSERT, no schema change | |
| Both layers | UNIQUE + explicit app check | |

**User's choice:** UNIQUE in schema.sql

### Sub-decisions

| Question | Options | Selected |
|----------|---------|----------|
| HTTP status | 409 Conflict / 400 Bad Request / Claude decides | 409 — "Ya existe un usuario con ese email." |
| PUT same email | Exclude self (200) / Always 409 | Exclude self |
| Update OpenAPI | Yes in Phase 7 / Defer Phase 8 | Yes in Phase 7 |

---

## Test coverage

| Option | Description | Selected |
|--------|-------------|----------|
| Empty DB test | initDb({ skipSeed: true }) for tests | ✓ |
| Env SKIP_SEED | Test-only env var | |
| DELETE after init | initDb then DELETE FROM users | |

**User's choice:** initDb({ skipSeed: true })

### Sub-decisions

| Question | Options | Selected |
|----------|---------|----------|
| Duplicate test cases | POST + PUT collision / POST only | POST + PUT |
| Update docs/10-tests.md | Full update now / Phase 8 / Minimal note | Full update now |
| Test count | Grow suite (~15-16) / Keep exactly 12 | Grow suite |

---

## Claude's Discretion

- JSON path: fixed `api/data/users.json` (user deferred to Claude)
- nextId handling: ignore field, rely on AUTOINCREMENT after explicit inserts
- MIG-02 doc scope: brief note in Phase 7, full doc Phase 8 (user chose "ready" without discussing MIG-02)

## Deferred Ideas

- Full JSON vs SQLite comparison — Phase 8
- Standalone migrate script — optional, not required for learner path
- Dashboard 409 UX — out of scope
