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

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | ~5 | 5 | GSD phased execution with UAT + security gates |

### Cumulative Quality

| Milestone | Tests | Coverage | Zero-Dep Additions |
|-----------|-------|----------|-------------------|
| v1.0 | 12 API tests | Manual UAT per phase | fs/promises, node:test, manual OpenAPI |

### Top Lessons (Verified Across Milestones)

1. Document real errors in NOTEBOOK.md — converts friction into curriculum
2. Validate with executable checks (curl, npm test, docker health) before phase sign-off
