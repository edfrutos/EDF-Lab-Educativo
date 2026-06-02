---
phase: 20-secrets-deploy-hardening
status: passed
verified: 2026-06-02
---

# Phase 20 Verification

**Score:** 8/8 must-haves verified (automated).

## Must-haves (Plan 20-01)

| Truth | Status | Evidence |
|-------|--------|----------|
| api/.env.example documents JWT_SECRET, ADMIN_*, CORS_ORIGINS, DATABASE_URL, DB_FILE, AUTH_DISABLED, NODE_ENV | pass | Grouped sections in `api/.env.example` |
| NODE_ENV=production without JWT_SECRET exits before listen | pass | `validateProductionEnv()` in `startServer()`; manual: fatal message + exit 1 |
| Development without JWT_SECRET warns and uses dev default | pass | `getJwtSecret()` unchanged dev path; `npm run test:sqlite` 23/23 |
| getJwtSecret does not use dev default in production | pass | `process.exit(1)` when production and no secret |

## Must-haves (Plan 20-02)

| Truth | Status | Evidence |
|-------|--------|----------|
| edf-lab-api uses env_file ./api/.env | pass | `docker-compose.yml` env_file block |
| DATABASE_URL not hardcoded in compose environment for API | pass | No `environment: DATABASE_URL` on edf-lab-api |
| docs/18-production-deploy.md explains secrets, env_file, nginx TLS | pass | File exists; nginx + env_file sections |
| README Compose section requires api/.env before compose:up | pass | README prerequisite block + link to doc 18 |
| .env remains gitignored | pass | `.gitignore` patterns `.env` and `.env.*` |

## Automated checks

- `node --check api/index.js` — OK
- `node --check api/auth.js` — OK
- `npm run test:sqlite` — 23/23 pass
- `NODE_ENV=production node index.js` — exits 1 with Spanish fatal message
- `grep env_file docker-compose.yml` — present on edf-lab-api

## human_verification

Compose end-to-end with real `api/.env` (JWT_SECRET + DATABASE_URL) recommended before production use; not blocking for phase goal — automated contract verified.

## Requirements traceability

| ID | Status |
|----|--------|
| DEPLOY-01 | pass — `.env.example` expanded |
| DEPLOY-02 | pass — Compose `env_file` |
| DEPLOY-03 | pass — production fail-fast |
| DEPLOY-04 | pass — `docs/18-production-deploy.md` |
