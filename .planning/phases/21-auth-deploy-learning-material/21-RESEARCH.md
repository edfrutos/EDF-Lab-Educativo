# Phase 21 Research: Auth & Deploy Learning Material

**Phase:** 21-auth-deploy-learning-material
**Researched:** 2026-06-02
**Status:** Ready for planning

## Summary

Phase 21 is **docs-only** — closes v1.5 (DOCS-01..04). Most auth narrative already exists in `docs/17-autenticacion.md` (~148 lines). Gaps: bcrypt mention, production/deploy cross-link, index ordering, Mission 14, NOTEBOOK v1.5 block, milestone UAT artifact.

## Current artifact state

| Artifact | Status | Gap |
|----------|--------|-----|
| `docs/17-autenticacion.md` | Exists, substantial | Untracked; add bcrypt/hash note; link doc 18; verify DOCS-01 checklist |
| `docs/18-production-deploy.md` | Shipped Phase 20 | Missing from `docs/00-indice.md` |
| `docs/00-indice.md` | Partially updated | Auth at position 6 in **initial** path — should move to **advanced v1.5** after frameworks |
| `missions/14-*` | Missing | DOCS-02 |
| `NOTEBOOK.md` | Frameworks v1.4 block | No Auth/Deploy v1.5 section |
| `19-UAT.md` | Complete (6/6 pass) | Needs consolidation into `21-UAT.md` for milestone |
| `README.md` | Auth one-liner present | Needs ordered v1.5 advanced path; endpoints list missing `/auth/*` |

## DOCS-01 coverage map (`docs/17-autenticacion.md`)

| Topic | Present | Action |
|-------|---------|--------|
| Passwords (bcrypt, accounts table) | Partial (operador vs users) | Add short bcrypt subsection |
| JWT | Yes (cookie, not localStorage) | Keep |
| Cookies httpOnly | Yes | Keep |
| CORS credentials | Yes | Keep |
| Protected fetch | Yes (`credentials: 'include'`) | Keep |
| Deploy/secrets | No | Link `docs/18-production-deploy.md` |

## Mission 14 pattern

Follow `missions/02-arrancar-dashboard.md` + `missions/13-frameworks-network-tab.md`:

- Objetivo / Requisitos previos / Pasos numerados / Resultado esperado / Reto extra
- DevTools: Application → Cookies + Network → Request Headers → Cookie
- CRUD smoke: create one user or edit existing after login
- Explicit: **do not** use `AUTH_DISABLED=1` in this mission

## Index restructuring (DOCS-03)

**Recorrido inicial** (unchanged core): 01-arquitectura → … → 05-cors → 06-debugging → …

**Ruta avanzada v1.5** (new subsection in index):

1. `16-frameworks.md` *(opcional)*
2. `17-autenticacion.md` *(avanzado, v1.5)*
3. `18-production-deploy.md` *(avanzado, v1.5)*
4. Missions 14, 11, 12 as applicable

Remove auth from position 6 in the beginner numbered list (or mark as "salta hasta frameworks").

## NOTEBOOK entries (from Phase 18–20 work)

Real errors to document:

1. **401 en `/users` tras login aparente** — fetch sin `credentials: 'include'`
2. **`[fatal] JWT_SECRET es obligatorio`** — `NODE_ENV=production` sin secret
3. **git-secrets rechaza commit con asignación JWT** — hook en `.env.example` / docs

Optional pattern: **403 Credenciales inválidas** vs **401 sesión expirada** (dashboard UX, Phase 19).

## UAT consolidation

Source: `.planning/phases/19-vanilla-dashboard-login/19-UAT.md` (6 tests, all pass).

Add for v1.5 milestone:

7. README/doc 18 discoverable from index
8. Compose prerequisite (`api/.env`) documented (grep README)

## Out of scope

- Code changes in `api/`, `dashboard/`, frameworks
- New npm dependencies
- Renaming `17-autenticacion.md`

## Plan split recommendation

| Wave | Plan | Requirements |
|------|------|--------------|
| 1 | 21-01 | DOCS-01, DOCS-02 |
| 2 | 21-02 | DOCS-03, DOCS-04 + 21-UAT |

Mirrors Phase 17 (content first, then navigation/NOTEBOOK/UAT).
