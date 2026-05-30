# Milestones

## v1.1 SQLite Persistence (Shipped: 2026-05-30)

**Phases completed:** 3 phases, 8 plans  
**Timeline:** 2026-05-30 (single-day milestone execution)  
**Audit:** `.planning/milestones/v1.1-MILESTONE-AUDIT.md` — 16/16 requirements, tech debt resolved at close

**Key accomplishments:**

- SQLite persistence: `api/db.js` + `schema.sql` with `node:sqlite`, zero new npm dependencies, `DB_FILE` env var
- JSON→SQLite migration on cold start with preserved IDs and UNIQUE email constraint (HTTP 409)
- Test suite expanded to 16/16 with isolated `users.test.db` per run
- Learning material: `docs/13-sqlite.md`, Mission 10, NOTEBOOK entries for real SQLite integration errors
- Dashboard unchanged — full CRUD UAT pass with SQLite backend

---

## v1.0 Educational Lab MVP (Shipped: 2026-05-30)

**Phases completed:** 5 phases, 13 plans, 12 tasks  
**Timeline:** 2026-05-26 → 2026-05-30 (4 days)  
**Known deferred items at close:** 1 (see STATE.md Deferred Items — Phase 02 HUMAN-UAT artifact flagged, status verified)

**Key accomplishments:**

- Dashboard CRUD: create, edit, and delete users from the browser with loading/success/error feedback in plain Spanish
- File persistence: users survive API restarts via `api/data/users.json` with memory-vs-disk documentation and missions
- API quality: 12 automated tests (node:test + supertest), `parseUserId` fix, package metadata, and `npm run dev`
- Learning material: 24-entry beginner glossary, renumbered missions, and docs/tests alignment
- Advanced topics: manual OpenAPI 3.0.3 spec (9 endpoints) and optional Docker path (node:22-alpine) marked as advanced/optional

### Known Gaps

- REQUIREMENTS.md checkboxes were not synced before archive; all v1 requirements were implemented and verified via phase UAT/security audits. Traceability table in archive reflects pre-close state.

---
