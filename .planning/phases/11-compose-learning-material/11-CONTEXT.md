# Phase 11: Compose Learning Material - Context

**Gathered:** 2026-05-31 (inferred from ROADMAP + Phases 9–10; no separate discuss-phase)
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver guided documentation and a hands-on mission so learners understand Docker Compose in this lab: services, networks, volumes, and the contrast with single-container Docker (Mission 09) and host dev (`npm start`). Align `docs/12-docker.md` with SQLite as runtime store. Update index, README, and `api/README.md`. Record real Compose integration errors in `NOTEBOOK.md`.

**In scope (Phase 11):** DOCS-01…05 — doc 14, mission 11, doc 12 alignment, index/README updates, NOTEBOOK.

**Out of scope:** Code changes to API, dashboard, or `docker-compose.yml` unless a doc example reveals a factual inaccuracy. nginx reverse proxy implementation (D-03 from Phase 9) — advanced reto in docs only.

</domain>

<decisions>
## Implementation Decisions

### Documentation split
- **D-01:** New primary Compose doc: `docs/14-docker-compose.md` (DOCS-01). Walk through this repo's `docker-compose.yml` with executable examples.
- **D-02:** `docs/12-docker.md` remains the single-container Docker entry (Mission 09); Phase 11 completes DOCS-03 by removing "doc 14 coming" placeholder and ensuring SQLite (not JSON-only) narrative throughout.
- **D-03:** Cross-link doc 12 ↔ doc 14 ↔ missions 09 and 11. Three-mode persistence table lives in doc 12 (Phase 10); doc 14 references it rather than duplicating verbatim.

### Mission
- **D-04:** `missions/11-arrancar-con-compose.md` — compose up, dashboard CRUD, restart stack, SQLite persistence via bind mount, optional sqlite3 on host.
- **D-05:** Add v1.2 note to `missions/09-arrancar-con-docker.md` pointing learners who want persistence to Mission 11 (mirror Mission 06 → Mission 10 pattern).

### Index & README
- **D-06:** `docs/00-indice.md` — doc 14 after doc 12 in advanced section; mission 11 in missions list.
- **D-07:** Root `README.md` — replace "documentación completa llegará en fase posterior" with link to doc 14 and mission 11.
- **D-08:** `api/README.md` — optional Compose subsection with `npm run compose:up` and bind mount note (DOCS-04).

### NOTEBOOK (DOCS-05)
- **D-09:** Document at minimum: Docker daemon not running, EADDRINUSE with Compose vs host dev, port 5173 conflict. Extend existing EADDRINUSE entry rather than duplicate.

### Advanced reto (docs only)
- **D-10:** Doc 14 ends with optional reto: nginx reverse proxy `/api` → API service (Phase 9 D-03 deferred). No implementation.

</decisions>

<canonical_refs>
## Canonical References

- `.planning/ROADMAP.md` — Phase 11 goal, success criteria, DOCS-01…05
- `.planning/phases/09-compose-stack-foundation/09-CONTEXT.md` — stack decisions, ephemeral → persistent arc
- `.planning/phases/10-sqlite-volume-scripts/10-RESEARCH.md` — bind mount, three-mode table scope
- `docker-compose.yml` — services, ports, volumes
- `docs/12-docker.md` — single-container + Compose contrast (Phase 10 section)
- `docs/13-sqlite.md` — SQLite patterns for mission/doc cross-links
- `missions/09-arrancar-con-docker.md`, `missions/10-inspeccionar-sqlite.md` — mission structure analogs
- `docs/08-memoria-vs-persistencia.md` — Phase 8 doc 08-01 pattern for index/README sync

</canonical_refs>
