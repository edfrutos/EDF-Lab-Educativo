# Project State

## Project Reference

See: `.planning/PROJECT.md` (updated 2026-06-10)

**Core value:** Make the backend -> JSON -> frontend flow visible, executable, and teachable, turning real errors into documented learning.

**Current focus:** Milestone **v1.5** — Phase 19 complete; next Phase 20 (docs y misión).

## Current Position

Phase: **20** of 20 (Auth & Production Learning Material) — **milestone v1.5 in progress**
Plan: 6/8 v1.5 plans complete (Phases 18–19)
Status: Phase 19 shipped — ready for `/gsd-execute-phase 20`
Last activity: 2026-06-10 — Phase 19 executed (AUTH-08–12, login en dashboard)

Progress: [██████████] 100% (v1.4) | [██████░░░░] ~67% (v1.5)

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
| 18 | API Authentication Layer | AUTH-01–07 | 3/3 complete |
| 19 | Dashboard Login Flow | AUTH-08–12 | 3/3 complete |
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
Next suggested command: `/gsd-execute-phase 20`

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
