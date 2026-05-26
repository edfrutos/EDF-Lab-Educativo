# EDF Lab Educativo

## What This Is

EDF Lab Educativo is a hands-on learning lab for understanding a modern web flow with a separate Express backend and a static frontend dashboard. It is for the project owner and beginner students who need to see, run, break, debug, and document the path from backend endpoints to JSON responses to rendered browser UI.

The current project already includes a working API, a dashboard that consumes it with `fetch()`, conceptual docs, guided missions, and a roadmap for evolving the lab in educational phases.

## Core Value

Make the backend -> JSON -> frontend flow visible, executable, and teachable, turning real errors into documented learning.

## Requirements

### Validated

- ✓ API Express exposes JSON endpoints for health, users, metadata, about, time, and in-memory user CRUD — existing
- ✓ Dashboard runs as a separate static frontend and consumes API data with `fetch()` — existing
- ✓ CORS is enabled and documented as a real browser boundary between `localhost:5173` and `localhost:3100` — existing
- ✓ Documentation explains architecture, startup, Express routes, dashboard fetch flow, CORS, debugging, and extension retos — existing
- ✓ Practical missions guide learners through starting the API, starting the dashboard, inspecting JSON, breaking/fixing CORS, and improving the UI — existing
- ✓ `NOTEBOOK.md` records decisions, real errors, and learning context — existing
- ✓ Codebase map exists in `.planning/codebase/` for stack, architecture, structure, conventions, testing, integrations, and concerns — existing

### Active

- [ ] Add dashboard CRUD forms so beginners can create, edit, and delete users from the browser, not only with curl.
- [ ] Add persistence for users in `data/users.json` and explain memory vs persistence.
- [ ] Add API tests for core endpoints and CRUD behavior.
- [ ] Add a glossary of concepts for beginner learners.
- [ ] Improve quality tooling only where it adds clear educational value.
- [ ] Add Docker and OpenAPI/Swagger later as advanced learning material.

### Out of Scope

- Full production authentication — not needed for the current beginner-focused API/data-flow lab.
- Database-first architecture — defer until file persistence has taught the simpler memory vs persistence concept.
- Frontend frameworks in the near term — keep HTML, CSS, and JavaScript vanilla until a framework has clear teaching value.
- Production deployment hardening — local learning remains the first target.
- Complex dependency additions without educational payoff — project rules explicitly prefer avoiding unnecessary dependencies.

## Context

The lab is organized around a learning route:

- `docs/` explains the concepts in reading order.
- `missions/` provides executable practice.
- `ROADMAP.md` lists the intended educational evolution.
- `NOTEBOOK.md` captures real decisions, errors, and lessons.
- `api/` contains the Express backend.
- `dashboard/` contains the static frontend.

The current roadmap sequence is accepted, with this priority order:

1. Dashboard CRUD.
2. Persistence.
3. Tests.
4. Glossary.
5. Quality.
6. Docker/OpenAPI.

The audience is the project owner and beginner students. The tone and implementation choices should therefore favor clarity, observability, executable examples, and explicit documentation over clever abstractions.

Known current concerns from `.planning/codebase/CONCERNS.md`:

- `dashboard/index.html` still contains an old `express-api-demo` path in the offline help message.
- `api/package.json` still uses generic `test-project` metadata.
- `npm test` intentionally fails because no test suite exists yet.
- `nodemon` is installed but no `dev` script exposes it.
- `parseUserId()` currently uses `Number.parseInt`, so partial numeric strings like `1abc` can be accepted as `1`.

## Constraints

- **Educational clarity**: Every change needs a didactic explanation because the repo is a learning lab.
- **Executable examples**: Every concept should include something learners can run.
- **Documentation discipline**: Relevant real errors belong in `NOTEBOOK.md`.
- **Mission format**: Every mission needs objective, steps, expected result, and extra challenge.
- **Dependency restraint**: Do not add dependencies unless they add clear educational value.
- **Validation**: Validate whenever practical with syntax checks, endpoint checks, audits, or tests.
- **Current stack**: Express backend plus static vanilla frontend remains the base for the next phases.
- **Future stack flexibility**: Frameworks are allowed later when they support the learning path rather than obscure it.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Keep the lab beginner-oriented | The stated audience is the project owner and beginner students | — Pending |
| Prioritize dashboard CRUD before persistence/tests/glossary/quality/Docker/OpenAPI | Browser-based mutation makes the existing API behavior visible to learners before adding deeper infrastructure | — Pending |
| Keep vanilla frontend for now | HTML/CSS/JS makes the data flow easier for beginners to inspect | — Pending |
| Allow frameworks later | Future phases may benefit from framework concepts once the fundamentals are established | — Pending |
| Treat docs, missions, and roadmap as source-of-intent | The user identified `docs/`, `missions/`, and `ROADMAP.md` as the project direction | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `$gsd-transition`):
1. Requirements invalidated? -> Move to Out of Scope with reason
2. Requirements validated? -> Move to Validated with phase reference
3. New requirements emerged? -> Add to Active
4. Decisions to log? -> Add to Key Decisions
5. "What This Is" still accurate? -> Update if drifted

**After each milestone** (via `$gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-26 after initialization*
