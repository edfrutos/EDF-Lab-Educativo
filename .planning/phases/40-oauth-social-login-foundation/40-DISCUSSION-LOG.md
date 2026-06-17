# Phase 40: OAuth social login foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves alternatives considered.

**Date:** 2026-06-17
**Phase:** 40-OAuth social login foundation
**Areas discussed:** next auth increment, scope boundaries, didactic sequencing

---

## Next increment after v2.3

| Option | Description | Selected |
|--------|-------------|----------|
| AUTH-ADV-01 first | Start OAuth/social login track | ✓ |
| Additional hardening first | Extend refresh rotation before OAuth | |
| Switch to production track | Pause auth work and move to deploy concerns | |

**Decision note:** Complete remaining auth-advanced requirement in incremental fashion.

---

## Functional scope for phase 40

| Option | Description | Selected |
|--------|-------------|----------|
| Backend OAuth foundation + docs | Establish contract and testable flow first | ✓ |
| Full backend + frontend UX | Include complete UI onboarding immediately | |
| Research-only | Defer implementation to later phase | |

**Decision note:** Keep first OAuth phase bounded and test-focused.

---

## Provider strategy

| Option | Description | Selected |
|--------|-------------|----------|
| One-provider foundation | Minimal provider-specific path to teach flow | ✓ |
| Multi-provider from phase start | Google + GitHub + others in same phase | |
| Provider-agnostic stubs only | No concrete provider semantics | |

**Decision note:** Favor teachable minimal path over broad integration.

---

## Claude's Discretion

- Choose concrete route contracts for OAuth start/callback.
- Decide practical local testing strategy (sandbox provider vs mock adapter).
- Decide if UI touchpoints land in this phase or immediate follow-up.

## Deferred Ideas

- Multi-provider federation and account linking.
- Advanced token threat response matrix.
- MFA and recovery.
