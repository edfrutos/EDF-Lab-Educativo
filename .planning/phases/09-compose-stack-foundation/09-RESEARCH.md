# Phase 9 Research: Compose Stack Foundation

**Researched:** 2026-05-31
**Phase:** 09-compose-stack-foundation
**Focus:** Docker Compose two-service stack (API + dashboard nginx) without volumes

## Summary

Phase 9 adds a root-level `docker-compose.yml` wiring the existing `api/Dockerfile` with a new `dashboard/Dockerfile` (nginx:alpine). The browser on the host continues calling `http://localhost:3100` for API and opens the dashboard at `http://localhost:5173` — no app.js changes required. The API container needs `users.json` in the image (remove from `.dockerignore`) so SQLite cold-start migration works. No volumes in this phase.

## Key Findings

### 1. Compose file location and services

- File: `docker-compose.yml` at repo root (D-11, COMPOSE-01)
- Service names: `edf-lab-api`, `edf-lab-dashboard` (D-12)
- Build contexts: `./api`, `./dashboard`
- Ports: `3100:3100`, `5173:5173` (D-04, D-07)
- `depends_on: [edf-lab-api]` on dashboard (D-13); no healthcheck in Phase 9

### 2. Dashboard nginx on port 5173

- `nginx:alpine` default listens on 80 — must override in custom `nginx.conf` to listen **5173** inside container
- Map host `5173:5173` so learners use same URL as `python3 -m http.server 5173`
- Static COPY: `index.html`, `app.js`, `styles.css` only — no build step (D-05, D-06)
- Separate `dashboard/nginx.conf` file (not Dockerfile heredoc)

### 3. API image and seed JSON

- Current `api/.dockerignore` excludes `data/users.json` and `data/*.db` (lines 38–40)
- For D-09: **remove** `data/users.json` exclusion; keep `data/*.db` excluded (ephemeral DB inside container)
- Existing `api/Dockerfile` already creates writable `data/` dir and runs as `node` user

### 4. CORS and API URL

- `app.use(cors())` in `api/index.js` — permissive; dashboard on `:5173` works unchanged (D-01, D-02)
- `API_BASE_URL = 'http://localhost:3100'` in `dashboard/app.js` — correct for host-browser → published ports model

### 5. Ephemeral data (Phase 9 scope)

- No `volumes:` in compose file (D-08)
- `docker compose down` destroys container filesystem including `users.db`
- UAT should verify CRUD works and that recreate yields fresh migration/seed (D-10)

### 6. COMPOSE-05 — host dev remains primary

- Add short "Optional: Docker Compose" subsection to root `README.md` pointing to Phase 11 doc later; for Phase 9, minimal pointer + `docker compose up` command suffices
- Do not demote existing Terminal 1/2 instructions

## Recommended Build Order

1. `dashboard/Dockerfile` + `dashboard/nginx.conf` (can build/test dashboard image alone)
2. Update `api/.dockerignore` for `users.json`
3. Root `docker-compose.yml`
4. Manual E2E: compose up → health → CRUD → down/up → verify ephemeral restart

## Risks / Pitfalls

| Risk | Mitigation |
|------|------------|
| nginx listens on 80, port mapping 5173:5173 fails silently | Explicit `listen 5173` in nginx.conf |
| Dashboard starts before API ready | `depends_on` (no healthcheck); document refresh if first load fails |
| `.dockerignore` still excludes users.json | Grep verify after edit |
| Port 3100/5173 already in use on host | Document `docker compose down` / stop host servers in UAT notes |

## References

- Docker Compose file reference: https://docs.docker.com/compose/compose-file/
- nginx listen directive: custom port in server block
- Existing: `api/Dockerfile`, `docs/12-docker.md`, `missions/09-arrancar-con-docker.md`

---

## RESEARCH COMPLETE
