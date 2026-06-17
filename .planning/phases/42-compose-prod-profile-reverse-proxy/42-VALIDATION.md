---
phase: 42
slug: compose-prod-profile-reverse-proxy
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-17
---

# Phase 42 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | node:test (API) + shell smoke (prod proxy) |
| **Config file** | `api/index.test.js`, `scripts/smoke-prod-proxy.sh` |
| **Quick run command** | `cd api && npm run test:sqlite` |
| **Prod smoke command** | `./scripts/smoke-prod-proxy.sh` (requires `npm run compose:prod`) |
| **Estimated runtime** | ~60s API + ~30s manual prod smoke |

---

## Sampling Rate

- **After every task commit:** `node --check dashboard/app.js`
- **After wave 1:** `cd api && npm run test:sqlite` + manual `curl -k https://localhost/api/health`
- **After wave 2:** `./scripts/smoke-prod-proxy.sh`
- **Before `/gsd-verify-phase 42`:** API suite green + smoke prod documented

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Behavior | Test Type | Automated Command | Status |
|---------|------|------|-------------|------------|----------|-----------|-------------------|--------|
| 42-01-01 | 01 | 1 | PROD-02 | T-42-01 | Proxy + nginx.conf exist | source | `test -f proxy/nginx.conf` | ⬜ pending |
| 42-01-02 | 01 | 1 | PROD-04/06 | T-42-03 | compose:prod + /api bake | source | `grep compose:prod package.json` | ⬜ pending |
| 42-02-01 | 02 | 2 | PROD-02 | T-42-04 | Smoke /api/health via proxy | script | `test -x scripts/smoke-prod-proxy.sh` | ⬜ pending |
| 42-02-02 | 02 | 2 | PROD-04 | T-42-05 | README dual mode + SQLite green | integration | `cd api && npm run test:sqlite` | ⬜ pending |

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Browser loads dashboard via https://localhost | PROD-02 | TLS trust UX | Accept self-signed warning; confirm UI loads |
| Host dev two-terminal flow | PROD-04 | Outside compose prod | Start API+dashboard python; login CRUD |

---

## Deferred to Phase 43

- Cookie `Secure` under `NODE_ENV=production`
- Express `trust proxy` full configuration
- Login E2E through HTTPS prod proxy
