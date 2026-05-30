# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — Educational Lab MVP

**Shipped:** 2026-05-30  
**Phases:** 5 | **Plans:** 13 | **Sessions:** ~5

### What Was Built

- Browser-based CRUD dashboard consuming Express API with visible HTTP feedback
- File-backed user persistence (`api/data/users.json`) with seed recovery and educational missions
- 12-test API suite with validation edge cases and documented AAA pattern
- 24-term beginner glossary plus docs/missions hardening (tests doc, mission renumbering)
- OpenAPI 3.0.3 contract (manual YAML, zero deps) and optional Docker containerization path

### What Worked

- Phased learning route (CRUD → persistence → tests → docs → advanced) kept each increment teachable
- Zero-dependency bias (`fs/promises`, `node:test`, manual OpenAPI) preserved educational transparency
- Real bugs captured in NOTEBOOK.md (CORS, parseUserId, Docker EACCES) became learning material
- GSD wave-based execution with parallel plans where files didn't overlap (Phase 05)

### What Was Inefficient

- REQUIREMENTS.md checkboxes drifted from actual delivery; traceability lagged behind implementation
- Docker permission issue (root-owned files vs `USER node`) discovered late in UAT — fixed with `chown`
- Some SUMMARY.md one-liner fields incomplete for automated milestone extraction

### Patterns Established

- Docs + missions + NOTEBOOK triad for every observable behavior change
- Advanced material marked `(avanzado, opcional)` in index without blocking the core path
- `module.exports = app` before listen; `DATA_FILE` env for test isolation
- Security STRIDE pass per phase before milestone close

### Key Lessons

1. Sync REQUIREMENTS checkboxes at phase completion, not only at milestone close
2. Dockerfiles need explicit ownership when dropping privileges (`chown` before `USER`)
3. Keep vanilla frontend until data flow is fully visible — framework comparison deferred correctly

### Cost Observations

- Model mix: not tracked per session
- Sessions: ~5 across 4 calendar days
- Notable: Phase 05 (OpenAPI + Docker) completed in ~1 day after prior phases established stable API surface

---

## Milestone: v1.1 — SQLite Persistence

**Shipped:** 2026-05-30  
**Phases:** 3 | **Plans:** 8

### What Was Built

- SQLite layer (`db.js`, `schema.sql`) with `node:sqlite` and `DB_FILE` configuration
- Auto-migration from `users.json` on empty database; UNIQUE email → HTTP 409
- 16-test suite with per-run DB isolation; dashboard CRUD unchanged
- `docs/13-sqlite.md`, Mission 10, NOTEBOOK integration errors, glosario v1.1 alignment

### What Worked

- Phased split (persistence → migration/tests → docs) kept dashboard contract stable throughout
- Deferred full MIG-02 doc to Phase 8 while Phase 7 shipped code + brief note — clean separation
- Real UAT friction (EADDRINUSE, ExperimentalWarning) became NOTEBOOK curriculum

### What Was Inefficient

- Phase 6 shipped without VERIFICATION.md — caught at milestone audit, fixed retroactively
- REQUIREMENTS.md checkboxes lagged until audit/close (recurring v1.0 lesson)
- `milestone.complete` accomplishments extraction incomplete ("Plan:" placeholders)

### Patterns Established

- `users.json` = seed, `users.db` = runtime — dual-file mental model documented in doc 08 + 13
- `initDb({ skipSeed: true })` for empty-database tests without learner-facing env vars
- Milestone audit cleanup pass before archive when tech_debt status

### Key Lessons

1. Add VERIFICATION.md when phase executes, not only at audit
2. Sync REQUIREMENTS checkboxes at each phase ship, not milestone close
3. Docs phase (8) should follow code phase UAT within same milestone for coherent learner path

### Cost Observations

- Model mix: not tracked
- Timeline: v1.1 executed primarily 2026-05-30 (same day as close)
- Notable: docs-only Phase 8 chained after Phase 7 UAT in one session

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | ~5 | 5 | GSD phased execution with UAT + security gates |
| v1.1 | ~2 | 3 | SQLite migration + docs; audit cleanup before archive |

### Cumulative Quality

| Milestone | Tests | Coverage | Zero-Dep Additions |
|-----------|-------|----------|-------------------|
| v1.0 | 12 API tests | Manual UAT per phase | fs/promises, node:test, manual OpenAPI |
| v1.1 | 16 API tests | Dashboard UAT 5/5 (Phase 7) | node:sqlite (built-in) |

### Top Lessons (Verified Across Milestones)

1. Document real errors in NOTEBOOK.md — converts friction into curriculum
2. Validate with executable checks (curl, npm test, docker health) before phase sign-off
