# Phase 41: OAuth dashboard integration foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves alternatives considered.

**Date:** 2026-06-17
**Phase:** 41-OAuth dashboard integration foundation
**Areas discussed:** milestone continuity, frontend OAuth scope, didactic rollout

---

## Next increment after phase 40

| Option | Description | Selected |
|--------|-------------|----------|
| Dashboard integration first | Make OAuth foundation visible in learner-facing UI flow | ✓ |
| Jump to real providers | Configure external OAuth credentials now | |
| Leave OAuth backend-only | Keep UI unchanged and defer all visibility | |

**Decision note:** Keep v2.4 incremental and teachable by exposing OAuth in dashboard workflow before external provider complexity.

---

## Functional scope for phase 41

| Option | Description | Selected |
|--------|-------------|----------|
| Auth UX + docs/missions alignment | Minimal frontend handoff to existing OAuth routes | ✓ |
| Full auth redesign | Rework complete login UX in one phase | |
| API-only continuation | No dashboard changes in this phase | |

**Decision note:** Phase remains bounded to OAuth entry/handoff and didactic coherence.

---

## Provider strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Keep single mock provider | Preserve local, deterministic educational flow | ✓ |
| Add Google + GitHub now | Multi-provider rollout in same phase | |
| Pure stub with no callback | UI placeholder only without end-to-end flow | |

**Decision note:** Prioritize deterministic local validation over breadth.

---

## Claude's Discretion

- Choose final UX copy and control placement for OAuth action.
- Decide parity strategy across vanilla/framework dashboards within phase boundaries.
- Balance UI implementation detail vs mission-guided execution while preserving testability.

## Deferred Ideas

- Real provider credentials and secrets lifecycle.
- Account linking / federation.
- MFA and recovery extensions.
