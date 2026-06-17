---
phase: 42-compose-prod-profile-reverse-proxy
plan: 01
subsystem: infra
tags: [nginx, docker-compose, tls, reverse-proxy]

requires:
  - phase: 41-oauth-dashboard-integration-foundation
    provides: OAuth mock vía fetch + /auth/oauth/*
provides:
  - Servicio edf-lab-proxy (profile prod, :443)
  - docker-compose.prod.yml sin puertos :3100/:5173 en host
  - Dashboard prod con API_BASE_URL=/api (build-arg)
affects: [43-tls-local-proxy-trust, 44-lets-encrypt, 45-docs]

tech-stack:
  added: [nginx:alpine edge proxy, openssl dev certs script]
  patterns: [nginx /api strip, compose profile prod, dual-mode dev/prod]

key-files:
  created: [proxy/nginx.conf, proxy/Dockerfile, docker-compose.prod.yml, scripts/generate-dev-tls.sh, deploy/certs/.gitkeep]
  modified: [docker-compose.yml, dashboard/Dockerfile, package.json]

key-decisions:
  - "edf-lab-proxy dedicado con profile prod — único :443 en host"
  - "Strip /api en nginx sin tocar rutas Express"
  - "API_BASE_URL=/api solo en imagen prod; app.js fuente intacto para dev host"

patterns-established:
  - "Modo dual: compose:up (dev ports) vs compose:prod (same-origin HTTPS)"
  - "Certs autofirmados en deploy/certs/ gitignored"

requirements-completed: [PROD-02, PROD-04, PROD-06]

duration: 25min
completed: 2026-06-17
---

# Phase 42 Plan 01 Summary

**Perfil Compose prod con nginx edge TLS, enrutado /api con strip y dashboard prod same-origin.**

## Accomplishments

- Servicio `edf-lab-proxy` en `docker-compose.yml` (`profiles: [prod]`, `443:443`).
- `proxy/nginx.conf`: `location /api/` → `edf-lab-api:3100/` con strip; `/` → dashboard.
- `scripts/generate-dev-tls.sh` + `deploy/certs/` para cert autofirmado de laboratorio.
- `docker-compose.prod.yml` quita puertos host de API/dashboard; build dashboard con `DASHBOARD_API_BASE_URL=/api`.
- `npm run compose:prod` en `package.json`.

## Verification

- `test -f proxy/nginx.conf` ✓
- `node --check dashboard/app.js` ✓
- `cd api && npm run test:sqlite` — 36/36 ✓
- Smoke manual: `./scripts/generate-dev-tls.sh && npm run compose:prod && ./scripts/smoke-prod-proxy.sh` (requiere Docker + `api/.env`)
