---
status: complete
phase: 21-auth-deploy-learning-material
source:
  - 19-UAT.md
  - 21-01-SUMMARY.md
  - 21-02-SUMMARY.md
started: 2026-06-02T19:00:00Z
updated: 2026-06-02T19:00:00Z
---

## Current Test

number: -
name: UAT v1.5 learning material
expected: |
  Material didáctico de auth/deploy publicado; auth vanilla verificado (fase 19).
awaiting: none

## Block A — Vanilla auth (Phase 19)

Fuente: [`.planning/phases/19-vanilla-dashboard-login/19-UAT.md`](../19-vanilla-dashboard-login/19-UAT.md) — 6/6 pass (2026-06-02).

| # | Escenario | Result |
|---|-----------|--------|
| 1 | Puerta de login al cargar :5173 | pass |
| 2 | Contraseña incorrecta → error inline | pass |
| 3 | Login correcto → panel CRUD | pass |
| 4 | Cookie `edf_session` en Network | pass |
| 5 | Logout → gate visible | pass |
| 6 | Cookie borrada → gate + mensaje ES | pass |

## Block B — Learning material (Phase 21)

| # | Escenario | Expected | Result |
|---|-----------|----------|--------|
| 7 | Doc 17 en índice | `docs/00-indice.md` enlaza `17-autenticacion.md` en ruta v1.5 | pass |
| 8 | Misión 14 publicada | `missions/14-auth-vanilla-login-crud.md` existe con pasos login/CRUD/logout | pass |
| 9 | Doc 18 en índice | `docs/00-indice.md` enlaza `18-production-deploy.md` | pass |
| 10 | README ruta v1.5 | README menciona v1.5, Mission 14, `api/.env` antes de compose | pass |

## Block C — Milestone DOCS sign-off

| Requirement | Criterion | Status |
|-------------|-----------|--------|
| DOCS-01 | `docs/17-autenticacion.md` (bcrypt, JWT, cookies, CORS, fetch) | pass |
| DOCS-02 | Mission 14 login → CRUD → logout → cookie | pass |
| DOCS-03 | Index + README ruta avanzada tras frameworks | pass |
| DOCS-04 | NOTEBOOK v1.5 auth/deploy errors | pass |

## Summary

total: 10
passed: 10
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none]
