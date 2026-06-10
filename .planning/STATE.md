# Project State

## Project Reference

See: `.planning/PROJECT.md` (updated 2026-06-10)

**Core value:** Make the backend -> JSON -> frontend flow visible, executable, and teachable, turning real errors into documented learning.

**Current focus:** Milestone **v1.5 Authentication & Production Readiness** — Phases 18–20 defined, implementation not started.

## Current Position

Phase: **18** of 20 (API Authentication Layer) — **milestone v1.5 planned**
Plan: 0/8 v1.5 plans complete
Status: Phase 18 planned — ready for `/gsd-execute-phase 18` (start 18-01)
Last activity: 2026-06-10 — `/gsd-plan-phase 18` completed (3 plans, PLAN-CHECK PASS)

Progress: [██████████] 100% (v1.4) | [░░░░░░░░░░] 0% (v1.5)

## Milestone Status

| Milestone | Status | Shipped / Defined |
|-----------|--------|-------------------|
| v1.0 Educational Lab MVP | Shipped | 2026-05-30 |
| v1.1 SQLite Persistence | Shipped | 2026-05-30 |
| v1.2 Docker & Compose | Shipped | 2026-05-31 |
| v1.3 PostgreSQL Persistence | Shipped | 2026-06-01 |
| v1.4 Frontend Framework Comparison | Shipped | 2026-06-01 |
| v1.5 Authentication & Production Readiness | **Planned** | 2026-06-10 |

## v1.5 Phase Overview

| Phase | Name | Requirements | Plans |
|-------|------|--------------|-------|
| 18 | API Authentication Layer | AUTH-01–07 | 0/3 |
| 19 | Dashboard Login Flow | AUTH-08–12 | 0/3 |
| 20 | Auth & Production Learning Material | DEPLOY-01–06 | 0/2 |

## Accumulated Decisions

Decisions logged in PROJECT.md Key Decisions table.

**v1.5 proposed (pending implementation):**

- `AUTH_ENABLED=false` by default — missions 01–13 unchanged
- `jsonwebtoken` for JWT signing (new runtime dependency)
- Single admin from env vars (`AUTH_USER`, `AUTH_PASSWORD`, `JWT_SECRET`)
- Protect `/users` routes when auth on; `/health` and `/` stay public
- Vanilla dashboard only for required login UI; React/Vue as Mission 14 reto extra
- Docs: `docs/17-autenticacion.md`, `docs/18-despliegue.md`, Mission 14

## Session Continuity

Last session: 2026-06-10
Stopped at: v1.5 milestone defined — no phase 18 plans yet
Resume file: None
Next suggested command: `/gsd-plan-phase 18`

## Deferred Items

| Item | Reason | Status |
|------|--------|--------|
| Phase 11 UAT artifact | Unknown if `11-UAT.md` exists | Open — see v1.2 archive |
| Phase 02 HUMAN-UAT | Flagged at v1.0 close | Verified — no action needed |
| Framework auth parity | Out of v1.5 required scope | Deferred to v1.6+ / Mission 14 reto |
| OAuth2 / refresh tokens | Advanced auth topics | Deferred to v1.6+ |
| Real TLS / cloud deploy | Conceptual doc only in v1.5 | Deferred |

---
*Last updated: 2026-06-10 after v1.5 milestone definition*
