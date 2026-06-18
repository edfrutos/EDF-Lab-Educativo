---
gsd_state_version: 1.0
milestone: v2.5
milestone_name: Production Deploy
status: ready
last_updated: "2026-05-31T12:00:00.000Z"
last_activity: 2026-05-31 -- Production VPS documented (Plesk + lab.edefrutos2020.com)
progress:
  total_phases: 4
  completed_phases: 2
  total_plans: 12
  completed_plans: 4
  percent: 33
stopped_at: Phase 44 planned — prod live on Plesk variant (certbot optional)
---

# Project State

## Project Reference

See: `.planning/PROJECT.md` (updated 2026-06-17)

**Core value:** Make the backend -> JSON -> frontend flow visible, executable, and teachable, turning real errors into documented learning.

**Current focus:** Milestone v2.5 — prod stack live at `https://lab.edefrutos2020.com` (Plesk LE + Docker); phase 44 certbot scripts optional for this host

## Production deployment (operator)

| Item | Value |
|------|--------|
| URL | https://lab.edefrutos2020.com |
| VPS path | `/var/www/vhosts/edefrutos2020.com/lab.edefrutos2020.com/edf-lab/` |
| Compose | `npm run compose:prod:vps` (or three-file compose with `--profile prod`) |
| TLS edge | Plesk Let's Encrypt |
| TLS internal | `127.0.0.1:9443` (edf-lab-proxy, autofirmado) |
| Docs | [`NOTEBOOK.md`](../NOTEBOOK.md) — *Production Deploy v2.5*; [`docs/18-production-deploy.md`](../docs/18-production-deploy.md) |

## Current Position

Phase: 44
Plan: 44-01 (wave 1)
Status: Planned — 2/2 plans (certbot path; **not required** for current Plesk deployment)
Last activity: 2026-05-31 — NOTEBOOK + docker-compose.vps.yml + README VPS section

## Milestone Status

| Milestone | Status | Shipped / Started |
|-----------|--------|---------------------|
| v2.5 Production Deploy | In progress | 2026-06-17 |
| v2.4 OAuth Foundation | Shipped | 2026-06-17 |
| v2.3 Auth Advanced | Shipped | 2026-06-17 |
| v2.2 Visual Regression | Shipped | 2026-06-17 |
| v2.1 Advanced E2E | Shipped | 2026-06-16 |
| v2.0 Quality & CI | Shipped | 2026-06-15 |
| v1.6 Framework Auth & CI | Shipped | 2026-06-14 |
| v1.5 Production Auth & Deployment | Shipped | 2026-06-02 |
| v1.4 Frontend Framework Comparison | Shipped | 2026-06-01 |
| v1.3 PostgreSQL Persistence | Shipped | 2026-06-01 |
| v1.2 Docker & Compose | Shipped | 2026-05-31 |
| v1.1 SQLite Persistence | Shipped | 2026-05-30 |
| v1.0 Educational Lab MVP | Shipped | 2026-05-30 |

## Session Continuity

Last session: 2026-05-31
Stopped at: Production documented — login + CRUD OK on lab.edefrutos2020.com
Next suggested command: `/gsd-execute-phase 44` (optional; Plesk already provides LE) or `/gsd-execute-phase 45` (docs/misión milestone close)

## Deferred Items

| Item | Reason | Status |
|------|--------|--------|
| Kubernetes manifests (PROD-07) | Post-v2.5 | Deferred |
| Real Google/GitHub OAuth | Out of scope v2.4 | Deferred |
| OAuth UI in React/Vue dashboards | Vanilla-first teaching | Deferred |
| Phase 11 UAT artifact | Pre-existing | Open |

---
*Last updated: 2026-05-31 — prod VPS documented; phase 44 optional for Plesk hosts*
