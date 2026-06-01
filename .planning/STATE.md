---
gsd_state_version: 1.0
milestone: v1.5
milestone_name: Production Auth & Deployment
status: ready_to_plan
last_updated: 2026-06-01T19:57:17.923Z
last_activity: 2026-06-01 -- Phase 19 execution started
progress:
  total_phases: 7
  completed_phases: 1
  total_plans: 17
  completed_plans: 28
  percent: 14
stopped_at: Phase 19 complete (2/2) — ready to discuss Phase 20
---

# Project State

## Project Reference

See: `.planning/PROJECT.md` (updated 2026-06-01)

**Core value:** Make the backend -> JSON -> frontend flow visible, executable, and teachable, turning real errors into documented learning.

**Current focus:** Phase 20 — secrets & deploy hardening

## Current Position

Phase: 20
Plan: Not started
Status: Ready to plan
Last activity: 2026-06-01

## Milestone Status

| Milestone | Status | Shipped |
|-----------|--------|---------|
| v1.0 Educational Lab MVP | Shipped | 2026-05-30 |
| v1.1 SQLite Persistence | Shipped | 2026-05-30 |
| v1.2 Docker & Compose | Shipped | 2026-05-31 |
| v1.3 PostgreSQL Persistence | Shipped | 2026-06-01 |
| v1.4 Frontend Framework Comparison | Shipped | 2026-06-01 |
| v1.5 Production Auth & Deployment | Planning | — |

## Performance Metrics

**Velocity (v1.5):**

- Phases defined: 4 (18–21)
- Requirements: 20 (AUTH/DEPLOY/DOCS)

**Velocity (v1.4):**

- Total plans completed (v1.4): 8
- Average duration: ~1 day (milestone executed 2026-06-01)
- Total milestone duration: 1 day (phases 15–17)

**By phase (v1.4):**

| Phase | Plans | Notes |
|-------|-------|-------|
| 15 React | 3 | dashboard-react :5174 |
| 16 Vue | 3 | dashboard-vue :5175 |
| 17 Learning | 2 | docs/16-frameworks.md, Mission 13 |

## Accumulated Decisions

Decisions logged in PROJECT.md Key Decisions table.

**v1.5 planned decisions (from research):**

- JWT in httpOnly cookie (not localStorage)
- `accounts` table separate from CRUD `users`
- bcrypt + jsonwebtoken + cookie-parser (3 deps)
- CORS `credentials: true` + explicit origins
- `AUTH_DISABLED=1` test-only bypass

## Session Continuity

Last session: 2026-06-01T19:51:09.624Z
Stopped at: Phase 19 planned
Resume file: .planning/phases/19-vanilla-dashboard-login/19-01-PLAN.md
Next suggested command: `/gsd-execute-phase 19`

## Deferred Items

| Item | Reason | Status |
|------|--------|--------|
| Phase 11 UAT artifact | Unknown if `11-UAT.md` exists | Open |
| Phase 02 HUMAN-UAT | Flagged at v1.0 close | Verified |
| OAuth / refresh tokens | v1.6+ | Deferred |

---
*Last updated: 2026-06-01 — v1.5 milestone initialized*
