# Phase 25: Framework Auth Learning Material — Research

**Researched:** 2026-06-02
**Domain:** Educational docs, missions, NOTEBOOK patterns for v1.6 closure
**Confidence:** HIGH

<user_constraints>
## User Constraints (from 25-CONTEXT.md)

### Locked Decisions
- D-01..D-05: Update doc 16 + Mission 15 + fix Mission 13; React callback vs Vue emit
- D-06..D-08: CI badge, NOTEBOOK v1.6 section, index v1.6 route

### Out of scope
- Code changes in api/ or dashboard-*

</user_constraints>

<research_summary>
## Summary

Phase 25 is **documentation-only** closing v1.6. The main gap is **stale narrative**: `docs/16-frameworks.md` and `missions/13-frameworks-network-tab.md` still describe React/Vue without login (v1.4). Phases 22–23 implemented full auth parity; Phase 24 added CI and rate limiting — neither is reflected in the frameworks learning path.

**Primary recommendation:** Plan 25-01 updates doc 16 + creates Mission 15 + patches Mission 13. Plan 25-02 wires index/README/NOTEBOOK/CHANGELOG (mirror Phase 21 structure).

</research_summary>

<content_gaps>
## Stale vs Current State

| Topic | Documented (stale) | Actual (v1.6) |
|-------|-------------------|-----------------|
| React login | No UI; use AUTH_DISABLED | LoginGate on :5174 |
| Vue login | No UI | LoginGate on :5175 |
| Mission 13 | AUTH_DISABLED required | Optional; Mission 15 uses real auth |
| doc 16 «Qué no incluimos» | Login in React/Vue | Implemented in v1.6 |
| Framework READMEs | Auth docs only | Missing CI + Mission 15 links |
| Index | No v1.6 route | Needs Mission 15 + CI |

</content_gaps>

<mission_15_outline>
## Mission 15 Structure (mirror Mission 14)

1. **Objetivo** — auth on React or Vue with DevTools cookie
2. **Requisitos previos** — Missions 01–03, doc 17, doc 16 auth section, Mission 14 optional
3. **Pasos** — API without AUTH_DISABLED; pick React :5174 or Vue :5175; login gate; credentials; CRUD smoke; Network cookie; logout; reto extra (delete cookie → 401 message)
4. **Resultado esperado** — explain callback vs emit if Vue chosen
5. **Reto extra** — rate limit: 10+ wrong logins → 429 (ties to Phase 24)
6. **Enlaces** — doc 16, 17, 10-tests CI, framework README

</mission_15_outline>

<doc_16_auth_section>
## Proposed doc 16 Auth Section

Replace table at L15–19 with:

| Panel | Login UI | Comunicación hijo→padre | Bootstrap |
|-------|----------|-------------------------|-----------|
| Vanilla :5173 | `#login-gate` en HTML | `elements` + handlers | `bootstrapAuth()` |
| React :5174 | `LoginGate.jsx` | prop `onLogin` | `useState` + `useEffect` |
| Vue :5175 | `LoginGate.vue` | `emit('login')` | `ref()` + `onMounted` |

Shared: `credentials: 'include'`, `POST /auth/login`, cookie `edf_session`, 401 → gate, logout toolbar.

Code pointers: `dashboard/app.js`, `dashboard-react/src/App.jsx`, `dashboard-vue/src/App.vue`.

</doc_16_auth_section>

<notebook_friction_candidates>
## NOTEBOOK Entries (real friction from v1.6 work)

1. **Documentación desactualizada tras auth framework** — síntoma: 401 en React/Vue siguiendo doc 16 viejo; solución: login o actualizar lectura; aprendizaje: docs son producto.

2. **HTTP 429 en login durante pruebas** — síntoma: tras muchos intentos fallidos, login devuelve 429; causa: `express-rate-limit`; solución: esperar ventana o ajustar `LOGIN_RATE_LIMIT_MAX` en dev.

3. **git-secrets en artefactos de planificación** — síntoma: commit bloqueado por patrones en `.planning/`; aprendizaje: no usar líneas que parezcan asignación de secretos en docs versionados.

Minimum 2 required (DOCS-04); include #1 and #2 as pedagogically strongest.

</notebook_friction_candidates>

<verification_commands>
```bash
# DOCS-01
grep -q "emit" docs/16-frameworks.md && grep -q "onLogin\|LoginGate" docs/16-frameworks.md
! grep -q "sin pantalla de login" docs/16-frameworks.md

# DOCS-02
test -f missions/15-framework-auth-login-crud.md
grep -q "Cookie" missions/15-framework-auth-login-crud.md

# DOCS-03
grep -q "15-framework-auth" docs/00-indice.md
grep -q "badge.svg\|GitHub Actions" README.md

# DOCS-04
grep -q "Framework Auth & CI (v1.6)" NOTEBOOK.md
```
</verification_commands>
