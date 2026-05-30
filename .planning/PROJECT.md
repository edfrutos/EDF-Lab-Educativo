# EDF Lab Educativo

## What This Is

EDF Lab Educativo is a hands-on learning lab for understanding a modern web flow with a separate Express backend and a static frontend dashboard. It is for the project owner and beginner students who need to see, run, break, debug, and document the path from backend endpoints to JSON responses to rendered browser UI.

The lab includes a working API with file persistence, a dashboard that performs full CRUD with `fetch()`, 12 automated API tests, a beginner glossary, guided missions, OpenAPI contract documentation, and an optional Docker path — all organized as an educational progression.

## Core Value

Make the backend -> JSON -> frontend flow visible, executable, and teachable, turning real errors into documented learning.

## Requirements

### Validated

- ✓ API Express exposes JSON endpoints for health, users, metadata, about, time, and user CRUD — existing
- ✓ Dashboard runs as a separate static frontend and consumes API data with `fetch()` — existing
- ✓ CORS is enabled and documented as a real browser boundary between `localhost:5173` and `localhost:3100` — existing
- ✓ Documentation explains architecture, startup, Express routes, dashboard fetch flow, CORS, debugging, and extension retos — existing
- ✓ Practical missions guide learners through starting the API, starting the dashboard, inspecting JSON, breaking/fixing CORS, and improving the UI — existing
- ✓ `NOTEBOOK.md` records decisions, real errors, and learning context — existing
- ✓ Codebase map exists in `.planning/codebase/` for stack, architecture, structure, conventions, testing, integrations, and concerns — existing
- ✓ Dashboard CRUD forms let beginners create, edit, and delete users from the browser with visible method/endpoint feedback — v1.0 Phase 01
- ✓ Users persist across API restarts via `api/data/users.json`; memory vs persistence explained with missions — v1.0 Phase 02
- ✓ `npm test` from `api/` runs 12 automated API checks; `parseUserId` rejects partial strings like `1abc` — v1.0 Phase 03
- ✓ `api/package.json` metadata and scripts match the educational lab — v1.0 Phase 03
- ✓ Validation commands documented in `api/README.md`; parseUserId fix in `NOTEBOOK.md` — v1.0 Phase 03
- ✓ Beginner glossary (`docs/09-glosario.md`) with 24 executable entries across 4 thematic blocks — v1.0 Phase 04
- ✓ Docs and missions synchronized with actual paths, ports, endpoints, and commands — v1.0 Phase 04
- ✓ OpenAPI 3.0.3 spec documents all 9 API endpoints with literal error messages — v1.0 Phase 05
- ✓ Optional Docker path (`docker:build`, `docker:start`) teaches containerized execution without replacing `npm start` — v1.0 Phase 05

### Active

- [ ] Frontend framework comparison (React/Vue) after vanilla flow is mastered — deferred from v1.0
- [ ] SQLite or PostgreSQL persistence — after file persistence concept is solid
- [ ] Production authentication and deployment hardening — future advanced phase
- [ ] Docker Compose multi-container setup — deferred from Phase 05

### Out of Scope

- Full production authentication — not needed for the current beginner-focused API/data-flow lab.
- Database-first architecture — file persistence established the memory vs persistence concept; SQLite/PostgreSQL deferred.
- Frontend frameworks in the near term — keep HTML, CSS, and JavaScript vanilla until a framework has clear teaching value.
- Production deployment hardening — local learning remains the first target.
- Complex dependency additions without educational payoff — project rules explicitly prefer avoiding unnecessary dependencies.

## Context

The lab is organized around a learning route:

- `docs/` explains the concepts in reading order (including glossary, tests, OpenAPI, Docker).
- `missions/` provides executable practice (9 missions including advanced optional topics).
- `ROADMAP.md` lists the educational evolution; v1.0 milestone complete.
- `NOTEBOOK.md` captures real decisions, errors, and lessons.
- `api/` contains the Express backend with file persistence, tests, OpenAPI spec, and Dockerfile.
- `dashboard/` contains the static frontend with full CRUD.

**v1.0 milestone shipped 2026-05-30:** 5 phases, 13 plans, 12 API tests passing, UAT verified for Phase 05, security STRIDE verified.

Known resolved concerns (all fixed in v1.0):

- ~~Stale `express-api-demo` path in dashboard help text~~ — Phase 01
- ~~Generic `test-project` metadata in package.json~~ — Phase 03
- ~~`npm test` intentionally fails~~ — 12/12 pass, Phase 03
- ~~`parseUserId()` accepts `1abc` as `1`~~ — fixed with `Number()`, Phase 03
- ~~Docker EACCES on `data/users.json`~~ — `chown` before `USER node`, Phase 05 UAT

## Constraints

- **Educational clarity**: Every change needs a didactic explanation because the repo is a learning lab.
- **Executable examples**: Every concept should include something learners can run.
- **Documentation discipline**: Relevant real errors belong in `NOTEBOOK.md`.
- **Mission format**: Every mission needs objective, steps, expected result, and extra challenge.
- **Dependency restraint**: Do not add dependencies unless they add clear educational value.
- **Validation**: Validate whenever practical with syntax checks, endpoint checks, audits, or tests.
- **Current stack**: Express backend plus static vanilla frontend remains the base.
- **Future stack flexibility**: Frameworks allowed later when they support the learning path.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Keep the lab beginner-oriented | Stated audience is project owner and beginner students | ✓ Good — v1.0 |
| Prioritize dashboard CRUD before persistence/tests/docs | Browser mutation makes API behavior visible first | ✓ Good — Phase 01 |
| Keep vanilla frontend for now | HTML/CSS/JS makes data flow inspectable | ✓ Good — v1.0 |
| Use `fs/promises` + zero new dependencies for persistence | Built-in Node.js; teaches concept without complexity | ✓ Good — Phase 02 |
| Include `api/data/users.json` in git | Fresh clone works immediately; seed data is fictional | ✓ Good — Phase 02 |
| `module.exports = app` before `startServer()` | Express pattern; prevents test-runner import issues | ✓ Good — Phase 02 |
| Use `node:test` + `supertest` for API tests | Built-in runner + minimal HTTP assertions | ✓ Good — Phase 03 |
| Single test file with AAA pattern | Easier for beginners than scattered spec files | ✓ Good — Phase 03 |
| Fix `parseUserId` with `Number()` instead of `parseInt` | Rejects partial strings; documented in NOTEBOOK.md | ✓ Good — Phase 03 |
| Glossary in 4 thematic blocks, 24 entries | Scannable reference with executable localhost examples | ✓ Good — Phase 04 |
| OpenAPI manual YAML without npm dependencies | Contract visible as plain file; Swagger Editor for exploration | ✓ Good — Phase 05 |
| Docker optional with node:22-alpine | Teaches containers without replacing simpler `npm start` path | ✓ Good — Phase 05 |
| Advanced material marked `(avanzado, opcional)` in index | Core learning path stays unblocked | ✓ Good — Phase 05 |
| Treat docs, missions, and roadmap as source-of-intent | User-identified direction for the project | ✓ Good — v1.0 |
| Allow frameworks later | Future phases may benefit once fundamentals are established | — Pending v1.1 |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `$gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `$gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-30 after v1.0 milestone*
