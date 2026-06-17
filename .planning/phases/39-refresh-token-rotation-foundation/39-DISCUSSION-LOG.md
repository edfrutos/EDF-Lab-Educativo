# Phase 39: Refresh token rotation foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves alternatives considered.

**Date:** 2026-06-17
**Phase:** 39-Refresh token rotation foundation
**Areas discussed:** Auth-advanced sequencing, refresh scope boundaries, didactic rollout

---

## Auth sequence after phase 38

| Option | Description | Selected |
|--------|-------------|----------|
| AUTH-ADV-02 first | Introduce refresh token rotation before OAuth | ✓ |
| AUTH-ADV-01 first | Jump directly to OAuth/social providers | |
| Pause auth track | Shift to production/deploy track | |

**Decision note:** Sequence stays incremental: password change (done) -> refresh rotation -> OAuth.

---

## Functional scope for phase 39

| Option | Description | Selected |
|--------|-------------|----------|
| Backend contract + tests + docs | Rotation behavior in API with didactic traceability | ✓ |
| Backend + full UI flow | Add dashboard controls for refresh/session management immediately | |
| Research-only phase | Gather strategy without implementation | |

**Decision note:** Keep phase focused on backend mechanics and contract clarity first.

---

## Rotation strategy boundaries

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal rotation | One refresh token active, rotate and invalidate old token | ✓ |
| Full token-family graph | Multi-step reuse detection and family invalidation matrix | |
| Stateless-only refresh | No persistence, just re-signing tokens | |

**Decision note:** Choose an educationally understandable rotation baseline with room to extend.

---

## Claude's Discretion

- Select route naming and cookie policy details for refresh flow.
- Choose minimal persistence model that is testable in SQLite and Postgres.
- Decide whether mission updates happen in same phase or immediate follow-up, as long as docs stay coherent.

## Deferred Ideas

- OAuth/social login.
- Advanced reuse detection and breach response matrix.
- MFA and recovery features.
