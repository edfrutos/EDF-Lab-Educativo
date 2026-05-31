# Phase 9: Compose Stack Foundation - Context

**Gathered:** 2026-05-31
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver a working two-service Docker Compose stack from the project root: containerized API (reusing `api/Dockerfile`) and containerized dashboard (new `dashboard/Dockerfile` with nginx). Learner runs `docker compose up`, opens `http://localhost:5173`, and performs full CRUD against the API on `:3100`. No SQLite volume persistence in this phase — that is Phase 10. Host dev path (`npm start` + `python3 -m http.server`) remains primary and documented.

</domain>

<decisions>
## Implementation Decisions

### API URL & CORS
- **D-01:** Keep `API_BASE_URL = 'http://localhost:3100'` hardcoded in `dashboard/app.js` — no changes in Phase 9. Browser on the host calls published container ports; same mental model as local dev.
- **D-02:** Do not modify CORS configuration in the API for Compose — existing `cors()` already allows dashboard on `:5173`.
- **D-03:** Reverse proxy / relative API URLs (`/api/*` via nginx) are **out of scope** for Phase 9; note as advanced reto in Phase 11 docs only.

### Network & Dashboard Container
- **D-04:** **Direct published ports** — nginx serves static files only; no reverse proxy to API in Phase 9. Dashboard `:5173`, API `:3100` on host.
- **D-05:** Dashboard image: `nginx:alpine` with static COPY of `index.html`, `app.js`, `styles.css`.
- **D-06:** nginx configuration in separate file `dashboard/nginx.conf` (not embedded heredoc in Dockerfile).
- **D-07:** Publish dashboard on port **5173** (user choice) — matches `python3 -m http.server 5173` dev path.

### Ephemeral Data (Phase 9)
- **D-08:** No volumes in Phase 9 — stack is intentionally ephemeral; data loss on `docker compose down` is expected and teachable.
- **D-09:** Include `users.json` in the API Docker image (adjust `.dockerignore` accordingly) so cold-start migration log (`Migrados N usuarios desde users.json`) works inside containers.
- **D-10:** Phase 9 UAT covers CRUD end-to-end **and** verifying clean restart behavior (fresh DB/seed after container recreate). Full persistence-across-restarts UAT belongs to Phase 10.

### Compose Structure
- **D-11:** `docker-compose.yml` at **project root** — learner runs `docker compose up` from repo root (COMPOSE-01).
- **D-12:** Service names: `edf-lab-api` and `edf-lab-dashboard` (user choice).
- **D-13:** Use `depends_on` so dashboard starts after API; **no healthcheck** in Phase 9 (keep startup simple).
- **D-14:** Root-level compose helper scripts (`compose:up`, `compose:down`) deferred to **Phase 10** (VOL-03).

### Claude's Discretion
- API URL strategy, app.js changes, CORS touches, nginx image choice, nginx config file vs inline, ephemeral documentation depth, Phase 9 UAT scope for data, `depends_on` without healthcheck, and deferring compose scripts — resolved per decisions above (simplicity and beginner transparency prioritized).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone & Requirements
- `.planning/ROADMAP.md` — Phase 9 goal, success criteria, COMPOSE-01…05
- `.planning/REQUIREMENTS.md` — COMPOSE-01…05 traceability
- `.planning/PROJECT.md` — v1.2 milestone intent, nginx decision, host-dev-primary constraint

### Existing Docker & API
- `api/Dockerfile` — reuse as-is for API service build context
- `api/.dockerignore` — must be updated to allow `data/users.json` in image (D-09)
- `docs/12-docker.md` — single-container Docker baseline (Mission 09); Phase 11 will align with SQLite
- `missions/09-arrancar-con-docker.md` — prior Docker learning path

### Dashboard & Contract
- `dashboard/app.js` — `API_BASE_URL` hardcoded; do not change in Phase 9
- `dashboard/index.html`, `dashboard/styles.css` — static assets for nginx COPY
- `CLAUDE.md` — ports 3100/5173, CORS contract, separation api/dashboard

### Persistence (context only — volumes are Phase 10)
- `api/db.js` — `populateIfEmpty()`, `DEFAULT_SEED`, migration from `users.json`
- `docs/13-sqlite.md` — SQLite runtime store context

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `api/Dockerfile`: production-ready node:22-alpine image with PORT=3100, non-root user, `data/` writable — reuse directly as Compose service build.
- `api/package.json` scripts `docker:build` / `docker:start`: reference patterns for single-container flow; Compose replaces these for multi-service but scripts can remain for Mission 09.
- `dashboard/app.js`: full CRUD + state helpers unchanged; Compose must preserve `:5173` → `:3100` browser flow.

### Established Patterns
- Educational lab: advanced paths marked optional; host dev stays primary (COMPOSE-05).
- Zero unnecessary dependencies: nginx official image only for dashboard; no Node build step.
- Ports fixed at 3100 (API) and 5173 (dashboard) across docs, dashboard, and README.

### Integration Points
- New: `docker-compose.yml` (root) wiring `edf-lab-api` build context `api/` and `edf-lab-dashboard` build context `dashboard/`.
- New: `dashboard/Dockerfile` + `dashboard/nginx.conf` listening on 5173 inside container, published to host 5173.
- `.dockerignore` change: stop excluding `data/users.json` so container cold start can migrate seed data.

</code_context>

<specifics>
## Specific Ideas

- User explicitly chose port **5173** for dashboard Compose publish (zero surprise vs dev server).
- User explicitly chose service names **`edf-lab-api`** + **`edf-lab-dashboard`**.
- User explicitly chose **`docker-compose.yml` at repo root**.
- Most other areas deferred to Claude with preference for maximum beginner clarity.

</specifics>

<deferred>
## Deferred Ideas

- **nginx reverse proxy** (`/api` → API service) — advanced reto in Phase 11 docs, not Phase 9 implementation.
- **SQLite volume mount** — Phase 10 (VOL-01…03).
- **Root compose helper scripts** — Phase 10 (VOL-03).
- **API healthcheck + depends_on condition** — optional hardening; not required in Phase 9.
- **Runtime API URL injection** (envsubst / config.js) — unnecessary while host-browser + published ports model holds.

</deferred>

---

*Phase: 9-Compose Stack Foundation*
*Context gathered: 2026-05-31*
