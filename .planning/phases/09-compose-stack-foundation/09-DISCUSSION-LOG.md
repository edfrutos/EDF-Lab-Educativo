# Phase 9: Compose Stack Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-31
**Phase:** 9-Compose Stack Foundation
**Areas discussed:** API URL, nginx/network, ephemeral data, compose structure

---

## API URL & CORS

| Option | Description | Selected |
|--------|-------------|----------|
| Hardcoded localhost:3100 | Browser uses published host ports; simplest | ✓ (Claude discretion) |
| Runtime config injection | envsubst / config.js for API URL | |
| Reverse proxy /api | Single origin via nginx | Deferred Phase 11 |

**User's choice:** Claude decides (×4) + implicit acceptance of hardcoded model
**Notes:** No app.js changes; CORS untouched; proxy as advanced reto only.

---

## Network & Dashboard Container

| Option | Description | Selected |
|--------|-------------|----------|
| Direct ports 5173 + 3100 | nginx static only; no proxy | ✓ (Claude discretion) |
| nginx reverse proxy | Single origin /api routing | |
| nginx:alpine | Minimal static serve | ✓ (Claude discretion) |
| Separate nginx.conf | Readable production pattern | ✓ (Claude discretion) |
| Port 5173 | Match python http.server dev port | ✓ (user) |
| Port 8080 | Distinguish compose from dev | |

**User's choice:** Port 5173 explicit; rest Claude discretion
**Notes:** Direct ports chosen for beginner clarity and zero app.js changes.

---

## Ephemeral Data (Phase 9)

| Option | Description | Selected |
|--------|-------------|----------|
| No volumes Phase 9 | Ephemeral until Phase 10 | ✓ (Claude discretion) |
| Bind mount early | Advance Phase 10 work | |
| Include users.json in image | Migration log in container | ✓ (Claude discretion) |
| UAT: CRUD + clean restart | Verify ephemeral behavior | ✓ (Claude discretion) |

**User's choice:** Claude discretion on all items
**Notes:** Volumes explicitly deferred to Phase 10 per roadmap.

---

## Compose Structure

| Option | Description | Selected |
|--------|-------------|----------|
| edf-lab-api + edf-lab-dashboard | Service names | ✓ (user) |
| api + dashboard | Simpler names | |
| docker-compose.yml at root | COMPOSE-01 | ✓ (user) |
| depends_on simple | No healthcheck Phase 9 | ✓ (Claude discretion) |
| depends_on + healthcheck | Wait for API healthy | |
| Scripts deferred Phase 10 | VOL-03 | ✓ (Claude discretion) |

**User's choice:** Service names + root compose explicit; rest Claude discretion

---

## Claude's Discretion

Resolved toward: hardcoded API URL, no app.js/CORS changes, nginx:alpine + separate conf, direct ports, ephemeral stack, users.json in image, depends_on without healthcheck, compose scripts in Phase 10, brief ephemeral docs in Phase 9 README with full treatment Phase 11.

## Deferred Ideas

- nginx reverse proxy / relative API URLs → Phase 11 advanced reto
- SQLite volumes and compose helper scripts → Phase 10
- Runtime API URL configuration → future if proxy adopted
