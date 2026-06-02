---
phase: 20-secrets-deploy-hardening
plan: 02
subsystem: infra
tags: [docker-compose, env_file, nginx, tls, deploy]

requires:
  - phase: 20-secrets-deploy-hardening
    provides: api/.env.example, production fail-fast, api/README secrets section
provides:
  - Compose env_file for edf-lab-api
  - docs/18-production-deploy.md
  - README and doc 14 cross-links
affects: [phase-21, compose workflows]

tech-stack:
  added: []
  patterns: [secrets via env_file, TLS termination at reverse proxy]

key-files:
  created: [docs/18-production-deploy.md]
  modified: [docker-compose.yml, README.md, docs/14-docker-compose.md]

key-decisions:
  - "DATABASE_URL removed from inline compose environment block"
  - "doc 00-indice deferred to phase 21 per CONTEXT boundary"

patterns-established:
  - "Compose API service reads ./api/.env via env_file"
  - "Deploy docs explain nginx TLS termination without shipping production nginx config"

requirements-completed: [DEPLOY-02, DEPLOY-04]

duration: 12min
completed: 2026-06-02
---

# Phase 20 Plan 02 Summary

**Compose `env_file` wiring and production deploy doc with nginx TLS termination pattern**

## Performance

- **Duration:** ~12 min
- **Tasks:** 3
- **Files modified:** 4 (1 created)

## Accomplishments

- `edf-lab-api` loads `./api/.env` via `env_file`; inline `DATABASE_URL` removed from YAML
- Published `docs/18-production-deploy.md` (secretos, Compose, TLS, snippet nginx)
- README Compose section requires `api/.env` before `compose:up`
- `docs/14-docker-compose.md` points to deploy guide

## Task Commits

1. **Task 1: Compose env_file** - `2bfde92` (feat)
2. **Task 2: Create docs/18** - `6004d21` (docs)
3. **Task 3: Cross-links** - `f14b26a` (docs)

## Deviations from Plan

None - plan executed as specified.

## Issues Encountered

None.

## User Setup Required

Before `npm run compose:up`, copy and edit `api/.env` with JWT_SECRET and DATABASE_URL for Compose.

## Next Phase Readiness

Ready for Phase 21 (auth documentation mission and doc index).

---
*Phase: 20-secrets-deploy-hardening*
*Completed: 2026-06-02*
