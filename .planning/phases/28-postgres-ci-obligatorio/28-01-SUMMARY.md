---
phase: 28-postgres-ci-obligatorio
plan: 01
subsystem: ci
tags: [github-actions, postgres, test-pg]

provides:
  - Mandatory test-postgres CI job with postgres:16 service

key-files:
  modified:
    - .github/workflows/ci.yml

requirements-completed: [QA-CI-01]

completed: 2026-06-15
one_liner: "GitHub Actions test-postgres job runs test:pg against postgres:16 with pg_isready healthcheck."
---

# Phase 28 Plan 01 Summary

**Postgres CI job on every PR.**

## Accomplishments

- Added `test-postgres` job parallel to `test-sqlite` and `e2e-smoke`.
- Service `postgres:16` with `edf_lab_test`, healthcheck `pg_isready -d edf_lab_test`.
- `npm run test:pg` with explicit `DATABASE_URL` (AUTH_DISABLED via script in package.json).

## Verification

- CI YAML greps — pass

## Self-Check: PASSED
