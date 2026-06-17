# Phase 42 Verification

**Phase:** 42-compose-prod-profile-reverse-proxy  
**Verified:** 2026-06-17  
**Status:** passed (automated); manual compose prod pending operator Docker run

## Success criteria (ROADMAP)

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | `docker compose --profile prod` expone HTTPS en un solo puerto | pass | `edf-lab-proxy` `443:443`; `docker-compose.prod.yml` quita `:3100`/`:5173` |
| 2 | Dashboard a `/api/*` sin CORS cross-origin en prod | pass | `DASHBOARD_API_BASE_URL=/api` en build prod; nginx strip |
| 3 | Dev host `:3100` + `:5173` intacto | pass | `dashboard/app.js` sin cambio; `compose:up` sin override prod |

## Automated checks

- [x] `test -f proxy/nginx.conf && test -f scripts/generate-dev-tls.sh`
- [x] `node --check dashboard/app.js`
- [x] `grep compose:prod package.json`
- [x] `test -x scripts/smoke-prod-proxy.sh`
- [x] `cd api && npm run test:sqlite` (36 tests)

## Manual (operator)

```bash
cp api/.env.example api/.env   # JWT_SECRET + DATABASE_URL Compose
./scripts/generate-dev-tls.sh
npm run compose:prod
./scripts/smoke-prod-proxy.sh
curl -kfsS https://localhost/api/health
```

## Requirements

- PROD-02 — same-origin prod `/api` ✓
- PROD-04 — dev host preserved ✓
- PROD-06 — OAuth reachable via `/api/auth/*` (smoke script) ✓

## Deferred to phase 43

- `trust proxy` en Express
- Login con cookie `Secure` E2E en HTTPS prod
- Historia de confianza TLS en navegador
