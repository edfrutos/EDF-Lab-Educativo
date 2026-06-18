# Phase 43 Verification

**Phase:** 43-tls-local-proxy-trust  
**Verified:** 2026-06-17  
**Status:** passed

## Success criteria (ROADMAP)

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | Login operador por HTTPS local (cert autofirmado documentado) | pass | `docs/18-production-deploy.md`; smoke login |
| 2 | Cookie `edf_session` con `Secure` en prod y CRUD persiste | pass | smoke verifica `Secure` + `GET /api/users` |
| 3 | API no asume HTTPS directo detrás de nginx | pass | `TRUST_PROXY=1` + `trust proxy` en `api/index.js` |

## Automated checks

- [x] `cd api && npm run test:sqlite` (36 tests)
- [x] `rg "trust proxy" api/index.js`
- [x] `rg NODE_ENV docker-compose.prod.yml`
- [x] `./scripts/smoke-prod-proxy.sh` — PASS

## Requirements

- PROD-03 — HTTPS local + login Secure bajo `NODE_ENV=production` ✓
- PROD-05 — trust proxy / `X-Forwarded-Proto` ✓

## Operator notes

- Puerto host configurable: `PROD_HTTPS_PORT` en `.env` raíz (ej. `9443` si `:443`/`:8443` ocupados).
- Tras cambiar `docker-compose.prod.yml`, recrear API: `docker compose ... up -d --build edf-lab-api`.
