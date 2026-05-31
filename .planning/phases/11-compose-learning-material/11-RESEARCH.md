# Phase 11 Research: Compose Learning Material

**Researched:** 2026-05-31
**Phase:** 11-compose-learning-material
**Focus:** Doc 14, Mission 11, DOCS-03 alignment, NOTEBOOK, index/README

## Summary

Phase 11 closes the v1.2 milestone with **documentation-only** deliverables. The stack (Compose + bind mount + root scripts) shipped in Phases 9–10. Learners need a dedicated Compose doc explaining services/networks/volumes in *this* repo, a guided mission, and polished cross-links. Pattern analog: **Phase 8** (doc 13 + mission 10 + NOTEBOOK + index).

## Key Findings

### 1. Doc numbering and placement

| Doc | Role | Status |
|-----|------|--------|
| `docs/12-docker.md` | Single container + three-mode persistence table | Phase 10 added Compose section; placeholder for doc 14 remains |
| `docs/14-docker-compose.md` | **New** — full Compose walkthrough (DOCS-01) | To create |

Skip doc 13 slot (SQLite). Index order: doc 12 → doc 14 in advanced section (after doc 11-openapi or grouped with docker).

### 2. Doc 14 recommended outline

1. **Intro** — Compose vs `docker run`; when to use each in this lab
2. **Architecture diagram** — browser → `:5173` nginx dashboard → `fetch` → `:3100` API (host-published ports, D-04 Phase 9)
3. **Services** — walk `edf-lab-api` and `edf-lab-dashboard` from `docker-compose.yml` (build, ports, depends_on)
4. **Networks** — default Compose network; why browser uses localhost not service names (API_BASE_URL hardcoded)
5. **Volumes** — bind mount `./api/data`; dashboard stateless; link to Mission 10 / doc 13 for SQLite
6. **Executable flow** — `npm run compose:up`, dashboard CRUD, `compose:down` + `compose:up`, persistence check
7. **Scripts** — root `package.json` compose:up/down/logs
8. **Contrast table** — link to doc 12 three-mode table (host / docker run / compose)
9. **Reto avanzado** — nginx `/api` reverse proxy (conceptual only, D-03)
10. **Enlaces** — Mission 11, doc 12, Mission 09

Tone: match `docs/13-sqlite.md` and `docs/11-openapi.md` — Spanish, executable bash blocks, ASCII diagrams.

### 3. DOCS-03 scope for doc 12

Phase 10 fixed ephemeral SQLite narrative and added Compose section. Phase 11:
- Remove line 119 placeholder ("documentación completa… fase posterior")
- Replace with link to `docs/14-docker-compose.md` and Mission 11
- Ensure opening "datos efímeros (SEED_DATA)" diagram note clarifies SQLite inside container for Mission 09 path
- Resumen section: mention Mission 11 for Compose path

No wholesale rewrite — surgical alignment only.

### 4. Mission 11 structure (mirror Mission 10)

| Step | Action |
|------|--------|
| 1 | Stop host API/dashboard and conflicting containers |
| 2 | `npm run compose:up` from repo root |
| 3 | Open dashboard; verify health/online |
| 4 | Create user (dashboard or curl POST) |
| 5 | `sqlite3 api/data/users.db` on host — row visible (bind mount) |
| 6 | `npm run compose:down && npm run compose:up` |
| 7 | GET /users — user persists |
| 8 | Reto: EADDRINUSE if host API also on 3100 |

Expected result: persistence across compose restart (inverts Mission 09 ephemeral lesson).

### 5. NOTEBOOK entries (DOCS-05)

Real errors from Phases 9–10 integration:

| Error | Source |
|-------|--------|
| `Cannot connect to the Docker daemon` | Docker Desktop not running |
| `EADDRINUSE :::3100` | Host `npm start` + Compose API both publishing 3100 |
| `EADDRINUSE :::5173` | `python3 -m http.server 5173` + Compose dashboard |
| Confusion: Mission 09 data lost but Compose persists | Teaching moment — link doc 12 table |

Extend existing NOTEBOOK EADDRINUSE section with Compose-specific stop commands (`docker compose down`, `docker ps`).

### 6. Index and README updates (DOCS-04)

- `docs/00-indice.md`: add doc 14 + mission 11 (advanced section)
- `README.md`: replace deferred Compose doc sentence; link doc 14 + mission 11
- `api/README.md`: new "Opcional: Docker Compose" subsection after arranque — `npm run compose:up`, link doc 14
- `docs/09-glosario.md`: add entries for Docker Compose, servicio, bind mount (optional but matches Phase 8 glossary updates)

### 7. Risks

| Risk | Mitigation |
|------|------------|
| Doc drift vs actual compose.yml | Copy YAML snippets from live file; verify with grep in plan |
| Duplicating Phase 10 three-mode table | Doc 14 links to doc 12; one canonical table |
| UAT requires Docker | Mark runtime tests in 11-UAT; static greps for doc links |

---

## RESEARCH COMPLETE
