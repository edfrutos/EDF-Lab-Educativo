# Phase 41: oauth-dashboard-integration-foundation - Research

**Researched:** 2026-06-17
**Domain:** OAuth mock UX integration in existing dashboard auth gates
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
### Scope for phase 41
- **D-01:** Phase 41 continues **AUTH-ADV-01** through dashboard integration (vanilla/framework auth missions aligned to the existing OAuth backend contract).
- **D-02:** Preserve backend routes from phase 40 (`/auth/oauth/start`, `/auth/oauth/callback`) without breaking login/refresh/password endpoints.
- **D-03:** Keep CRUD `users` behavior untouched; this phase is auth-entry UX and flow wiring only.
- **D-04:** Implement a minimal OAuth UX path (single mock provider handoff) before any real provider onboarding.

### Didactic constraints
- **D-05:** Documentation must explain clearly when to use classic login vs OAuth mock path.
- **D-06:** OAuth frontend friction (cookie/state mismatch, callback flow confusion, local URL pitfalls) must be captured in `NOTEBOOK.md`.
- **D-07:** Validation must include runnable checks for auth flow continuity (at minimum existing API suite and targeted UI/manual mission verification).

### Out-of-scope in this phase
- **D-08:** Real external provider credentials/secrets management.
- **D-09:** Multi-provider federation and account linking.
- **D-10:** MFA/recovery and production deploy concerns (TLS/proxy/k8s).

### Claude's Discretion
- Exact UI touchpoint shape (button copy/placement) as long as it keeps didactic clarity.
- Whether framework dashboards receive full parity in this phase or documented staged parity with explicit follow-up.
- How much of OAuth callback handling is demonstrated in UI vs mission scripts, provided behavior stays testable.

### Deferred Ideas (OUT OF SCOPE)
- Real Google/GitHub provider onboarding.
- Account linking between password and social identities.
- Advanced OAuth threat matrix and incident response.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AUTH-ADV-01 | OAuth / social login providers | Preserve phase-40 OAuth API contract and add dashboard OAuth entry flow + callback continuity checks without regressing login/refresh/password paths. [VERIFIED: `.planning/REQUIREMENTS.md`] |
</phase_requirements>

## Summary

Phase 41 should be planned as a frontend integration phase, not a backend auth phase: OAuth mock endpoints already exist and are tested (`GET /auth/oauth/start`, `GET /auth/oauth/callback`), while dashboard UX currently exposes only email/password entry points. [VERIFIED: `api/index.js`, `api/test-auth-helpers.js`, `dashboard/app.js`]

The safest strategy is to keep all existing auth paths as-is (login, refresh, password change, logout) and add a parallel OAuth mock handoff from the login gate. The dashboard should call `/auth/oauth/start`, then navigate to returned `authUrl`, and on successful callback rely on the same cookie-based session bootstrap already used today. [VERIFIED: `api/auth.js`, `dashboard/app.js`; CITED: https://developer.mozilla.org/en-US/docs/Web/API/Request/credentials]

Given milestone risk and didactic scope, split work into two plans: Plan A for vanilla dashboard + docs/mission/NOTEBOOK synchronization, Plan B for framework parity (React/Vue) or explicitly documented staged parity if deferred by discretion. [VERIFIED: `41-CONTEXT.md`, `docs/17-autenticacion.md`, `missions/14-auth-vanilla-login-crud.md`, `missions/15-framework-auth-login-crud.md`; ASSUMED]

**Primary recommendation:** Implement OAuth mock as a second login path in the same gate, reusing current cookie-session lifecycle and auth error handling, then validate no regression on classic login + refresh + password flows.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| OAuth start initiation from UI | Browser / Client | API / Backend | UI triggers intent and navigation; backend issues state/authUrl contract. [VERIFIED: `dashboard/app.js`, `api/auth.js`] |
| OAuth state validation | API / Backend | Browser / Client | Security-critical comparison is server-side via cookie + query state. [VERIFIED: `api/auth.js`; CITED: https://www.rfc-editor.org/rfc/rfc6749] |
| Session issuance after callback | API / Backend | Browser / Client | Backend sets `edf_session`/`edf_refresh` cookies; browser includes them on future requests. [VERIFIED: `api/auth.js`; CITED: https://developer.mozilla.org/en-US/docs/Web/API/Request/credentials] |
| Gate visibility/login mode switching | Browser / Client | — | Dashboard controls gate/panel hidden state and inline errors. [VERIFIED: `dashboard/app.js`, `dashboard/index.html`] |
| CRUD protection continuity | API / Backend | Browser / Client | `/users` remains protected by `requireAuth`; UI reacts to 401 by returning to gate. [VERIFIED: `api/index.js`, `dashboard/app.js`] |
| Didactic narrative consistency | Browser / Client | Documentation | Users learn from visible UI paths and mission/doc guidance. [VERIFIED: `41-CONTEXT.md`, `docs/17-autenticacion.md`, missions 14/15] |

## Project Constraints (from .cursor/rules/)

- No `.cursor/rules/` directory exists in this workspace, so no additional local rule files constrain planning beyond `CLAUDE.md`/`AGENTS.md`. [VERIFIED: glob search in repo]
- Keep API and dashboard separated, avoid coupling beyond explicit contract changes. [VERIFIED: `CLAUDE.md`]
- Preserve CORS and cross-origin cookie behavior (`credentials: include` patterns remain mandatory). [VERIFIED: `CLAUDE.md`, `dashboard/app.js`, `api/index.js`]
- If observable behavior changes, update docs/missions/NOTEBOOK as product artifacts. [VERIFIED: `CLAUDE.md`, `41-CONTEXT.md`]
- Avoid unnecessary new dependencies. [VERIFIED: `CLAUDE.md`, `AGENTS.md`]

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `express` | 5.2.1 (published 2025-12-01) | HTTP routing for auth + CRUD endpoints | Existing API foundation; no re-platforming needed for phase 41. [VERIFIED: npm registry, `npm view express version/time`; VERIFIED: `api/index.js`] |
| `cookie-parser` | 1.4.7 (published 2024-10-08) | Reads auth/session cookies for handlers | Required for OAuth state cookie + session cookies. [VERIFIED: npm registry; VERIFIED: `api/index.js`, `api/auth.js`] |
| `jsonwebtoken` | 9.0.3 (published 2025-12-04) | Signs/verifies session + refresh tokens | Session continuity path shared by password and OAuth mock callback. [VERIFIED: npm registry; VERIFIED: `api/auth.js`] |
| Browser `fetch` + `credentials: 'include'` | baseline since 2017 | Sends cookies cross-origin (`5173/5174/5175` -> `3100`) | Mandatory for existing and OAuth-derived sessions to work in dashboard calls. [CITED: https://developer.mozilla.org/en-US/docs/Web/API/Request/credentials; VERIFIED: `dashboard/app.js`, `dashboard-react/src/api.js`, `dashboard-vue/src/api.js`] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@playwright/test` | 1.61.0 (published 2026-06-15) | E2E smoke/visual verification | Use for regression checks on auth gate UX after OAuth button/path changes. [VERIFIED: npm registry; VERIFIED: root `package.json`, `e2e/tests/auth-smoke.*.spec.js`] |
| `supertest` | 7.2.2 (published 2026-01-06) | API-level auth contract tests | Use to preserve OAuth start/callback + login/refresh/password behavior. [VERIFIED: npm registry; VERIFIED: `api/test-auth-helpers.js`] |
| `express-rate-limit` | 8.5.2 (published 2026-05-14) | Protects login endpoint from brute-force | Must keep classic login path intact while adding OAuth option. [VERIFIED: npm registry; VERIFIED: `api/auth.js`] |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `window.location` handoff after `/auth/oauth/start` | popup + `postMessage` | Popup adds complexity and race conditions, low educational value in this phase. [ASSUMED] |
| Keep OAuth only as curl/manual flow | UI CTA in login gate | Manual-only flow hides core didactic comparison login vs OAuth in dashboard UX. [VERIFIED: `41-CONTEXT.md`; ASSUMED] |
| Framework parity in same plan | Two-plan split (vanilla first, frameworks second) | Single plan is faster to author but riskier for regression scope and review clarity. [ASSUMED] |

**Installation:**
```bash
# No nuevas dependencias para la fase 41 (reusar stack actual)
```

**Version verification:** versions and publish timestamps above were confirmed via `npm view <package> version` + `npm view <package> time[<version>]`. [VERIFIED: npm registry]

## Architecture Patterns

### System Architecture Diagram

```text
Usuario en login gate
   ↓ elige ruta
 ┌───────────────────────────────┬──────────────────────────────┐
 │ Email/password                 │ OAuth mock                   │
 │ POST /auth/login               │ GET /auth/oauth/start        │
 │                                │  ↓ {state, authUrl}          │
 │                                │ Navegación a authUrl         │
 │                                │ GET /auth/oauth/callback     │
 └───────────────────────────────┴──────────────────────────────┘
                   ↓
         API emite cookies httpOnly
       (edf_session + edf_refresh)
                   ↓
 Dashboard bootstrapAuth/loadDashboardData
 GET /users con credentials: include
       ↓ 200 => panel   ↓ 401 => gate
```

### Recommended Project Structure
```text
dashboard/
├── index.html              # login gate markup (añadir CTA OAuth mock)
└── app.js                  # handlers auth (login + oauth start/handoff)

docs/
└── 17-autenticacion.md     # narrativa login clásico vs OAuth mock

missions/
├── 14-auth-vanilla-login-crud.md
└── 15-framework-auth-login-crud.md  # pasos y validación actualizados
```

### Pattern 1: Dual Auth Entry Gate (single source of truth)
**What:** Mantener un único gate con dos acciones explícitas: login clásico y OAuth mock. [VERIFIED: `41-CONTEXT.md`; ASSUMED]  
**When to use:** Cuando backend OAuth ya existe y se necesita comparación didáctica sin reescribir sesión. [VERIFIED: `api/auth.js`, `docs/17-autenticacion.md`]  
**Example:**
```javascript
// Source: existing auth fetch pattern in dashboard/app.js
async function startOAuthMock() {
  const start = await fetchJson('/auth/oauth/start?provider=mock');
  window.location.assign(`${API_BASE_URL}${start.authUrl}`);
}
```

### Pattern 2: Auth-error convergence on existing 401 gate behavior
**What:** Cualquier fallo de sesión tras callback o refresh termina en el mismo `showLoginGate()` + mensaje inline. [VERIFIED: `dashboard/app.js`]  
**When to use:** Para evitar rutas de error divergentes entre login y OAuth. [ASSUMED]  
**Example:**
```javascript
// Source: current 401 handling pattern in dashboard/app.js
if (error.status === 401) {
  showLoginGate();
  showLoginError(error.message || 'Inicia sesión para ver y gestionar usuarios.');
}
```

### Anti-Patterns to Avoid
- **Bypass de `bootstrapAuth`:** saltar verificación de sesión y forzar panel tras callback produce estados inconsistentes. [VERIFIED: `dashboard/app.js`; ASSUMED]
- **Modificar endpoints backend en fase 41:** rompe decisión D-02 y riesgo de regresión auth avanzada. [VERIFIED: `41-CONTEXT.md`]
- **Ocultar OAuth solo en docs o solo en curl:** contradice objetivo de integración UX. [VERIFIED: `41-CONTEXT.md`; ASSUMED]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Validación anti-CSRF OAuth | Comparador state improvisado en frontend | state cookie + callback validation ya en `api/auth.js` | Server-side validation already implemented and aligned with OAuth guidance. [VERIFIED: `api/auth.js`; CITED: https://www.rfc-editor.org/rfc/rfc6749] |
| Gestión de sesión en cliente | localStorage JWT custom | Cookie httpOnly + `credentials: include` actual | Lower XSS exposure and already used across dashboards. [VERIFIED: `docs/17-autenticacion.md`, dashboard api clients; CITED: MDN credentials URL] |
| Nuevo flujo auth paralelo en tests | Suite nueva aislada desde cero | Extender smoke Playwright y manual mission checks existentes | Reuses proven contracts and reduces maintenance burden. [VERIFIED: `e2e/helpers/auth-smoke-flow.js`, `docs/10-tests.md`; ASSUMED] |

**Key insight:** Phase 41 should wire existing auth primitives, not invent new auth primitives. [VERIFIED: phase context + codebase]

## Common Pitfalls

### Pitfall 1: `state` mismatch in callback
**What goes wrong:** Callback returns 400 despite valid `code=mock-admin`. [VERIFIED: `api/auth.js`, `NOTEBOOK.md`]  
**Why it happens:** `state` query does not match `edf_oauth_state` cookie. [VERIFIED: `api/auth.js`]  
**How to avoid:** Always derive callback navigation from `/auth/oauth/start` response and preserve cookies. [VERIFIED: `api/auth.js`; ASSUMED]  
**Warning signs:** `State OAuth inválido o ausente.` in API response. [VERIFIED: `api/auth.js`, tests]

### Pitfall 2: Regressing classic login path while adding OAuth CTA
**What goes wrong:** Login form submission or inline 403/401 messaging changes unexpectedly. [VERIFIED: `dashboard/app.js`; ASSUMED]  
**Why it happens:** Shared gate event wiring or DOM IDs are modified carelessly. [VERIFIED: `dashboard/index.html`, `dashboard/app.js`; ASSUMED]  
**How to avoid:** Keep current form IDs and handler paths stable; add OAuth as additive control. [VERIFIED: current files]  
**Warning signs:** Auth smoke tests fail on `Entrar`/`Cerrar sesión` sequence. [VERIFIED: `e2e/helpers/auth-smoke-flow.js`]

### Pitfall 3: Teaching drift between code and missions/docs
**What goes wrong:** Learners see OAuth button but docs still describe curl-only flow. [VERIFIED: context constraints D-05/D-06]  
**Why it happens:** UI changes shipped without docs/mission/NOTEBOOK updates. [VERIFIED: `CLAUDE.md`, `AGENTS.md`]  
**How to avoid:** Bundle docs and mission edits in same plan or same PR slice. [ASSUMED]  
**Warning signs:** Mission steps no longer map to visible UI actions. [ASSUMED]

## Code Examples

Verified patterns from official sources and current code:

### Existing OAuth backend contract
```javascript
// Source: api/auth.js
function oauthStartHandler(req, res) {
  const state = crypto.randomUUID();
  res.cookie(OAUTH_STATE_COOKIE_NAME, state, getOAuthStateCookieOptions());
  return res.json({
    provider: 'mock',
    state,
    authUrl: `/auth/oauth/callback?provider=mock&code=mock-admin&state=${encodeURIComponent(state)}`
  });
}
```

### Cross-origin cookie transport
```javascript
// Source: dashboard/app.js
const response = await fetch(url, {
  credentials: 'include',
  ...options
});
```

### OAuth `state` security guidance
```text
// Source: RFC 6749
"state" ... RECOMMENDED ... used by the client to maintain state between request and callback
... should be used for preventing cross-site request forgery.
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Email/password-only visible in dashboard gate | Co-existing classic login + OAuth mock entry in same gate | Planned in phase 41 (backend foundation in phase 40) | Better didactic comparison without external providers. [VERIFIED: context + existing code; ASSUMED] |
| Manual OAuth validation via curl only | UI-driven OAuth handoff from dashboard | Planned in phase 41 | Makes flow observable to learners in browser UX. [VERIFIED: mission/docs currently curl-oriented; ASSUMED] |

**Deprecated/outdated:**
- “OAuth only as backend endpoint demo” as sole learning path becomes outdated once gate integration lands. [ASSUMED]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Splitting into two plans (vanilla first, framework parity second) is the lowest-risk delivery sequence. | Summary / Open Questions | Planning may over-fragment if team prefers one integrated plan. |
| A2 | `window.location.assign` is the intended didactic OAuth handoff for this phase. | Architecture Patterns | If UX expects in-page callback handling, planned tasks need rework. |
| A3 | Framework parity may be staged via discretion rather than mandatory in same implementation wave. | Open Questions | Could leave React/Vue guidance temporarily behind code expectations. |

## Open Questions (RESOLVED)

1. **¿Paridad React/Vue en fase 41 o en follow-up inmediato? — RESOLVED**
   - Decision: Se mantiene dentro de fase 41 como **Plan 41.2** (wave 2), dependiente de completar primero vanilla + docs en **Plan 41.1**.
   - Why: Preserva alcance didáctico incremental sin dejar la fase con paridad ambigua entre dashboards.
   - Traceability: D-01 y D-07 en `41-CONTEXT.md`; requisito `AUTH-ADV-01`.

2. **¿Callback OAuth visible en UI (query params) o solo implícito por bootstrap? — RESOLVED**
   - Decision: El detalle del callback queda principalmente en docs/misiones; la UI muestra solo soporte mínimo (entry OAuth + feedback claro), sin sobrecargar el gate con internals.
   - Why: Mantiene simplicidad del dashboard y desplaza la explicación técnica al material didáctico donde ya vive el contrato.
   - Traceability: D-05 y D-06 en `41-CONTEXT.md`; `docs/17-autenticacion.md` + missions 14/15.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | API + dashboard scripts | ✓ | v22.22.3 | — |
| npm | test/build scripts | ✓ | 10.9.8 | — |
| Python 3 | static server for vanilla dashboard | ✓ | 3.14.3 | `npx http-server` (if needed) |
| Playwright CLI | E2E auth smoke regression | ✓ | 1.60.0 | Manual mission verification |
| Docker | optional PG/CI-like verification | ✓ | 29.3.0 | SQLite-only verification path |

**Missing dependencies with no fallback:**
- None. [VERIFIED: local availability audit]

**Missing dependencies with fallback:**
- None currently missing. [VERIFIED: local availability audit]

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | Session/login/oauth handlers in `api/auth.js`. [VERIFIED: codebase] |
| V3 Session Management | yes | httpOnly cookies + refresh rotation + logout invalidation. [VERIFIED: `api/auth.js`, tests] |
| V4 Access Control | yes | `requireAuth` middleware on `/users` routes. [VERIFIED: `api/index.js`] |
| V5 Input Validation | yes | Payload checks and provider/state/code checks in auth handlers. [VERIFIED: `api/auth.js`] |
| V6 Cryptography | yes | JWT signing + bcrypt password hashing + SHA-256 refresh hash. [VERIFIED: `api/auth.js`] |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| OAuth callback CSRF/state tampering | Tampering | Validate callback `state` against server cookie; reject mismatches. [VERIFIED: `api/auth.js`; CITED: RFC6749 URL] |
| Session theft via JS-accessible tokens | Information Disclosure | Keep session in httpOnly cookies, avoid localStorage token handling. [VERIFIED: docs/code] |
| Refresh token replay | Elevation of Privilege | Rotate refresh token and invalidate reused token path. [VERIFIED: `api/auth.js`, auth tests] |
| Brute-force login attempts | Denial of Service | `express-rate-limit` on `/auth/login`. [VERIFIED: `api/auth.js`] |

## Sources

### Primary (HIGH confidence)
- `.planning/phases/41-oauth-dashboard-integration-foundation/41-CONTEXT.md` - locked scope, discretion, out-of-scope.
- `api/auth.js` - OAuth start/callback, cookies, refresh/password/login handlers.
- `api/index.js` - route wiring and protected `/users` access model.
- `dashboard/app.js`, `dashboard/index.html` - current vanilla auth gate and integration points.
- `dashboard-react/src/*`, `dashboard-vue/src/*` - framework auth-gate parity baseline.
- `api/test-auth-helpers.js`, `api/index.test.js`, `api/index.pg.test.js` - auth contract coverage.
- [RFC 6749](https://www.rfc-editor.org/rfc/rfc6749) - OAuth `state` recommendation and CSRF rationale.
- [MDN Request.credentials](https://developer.mozilla.org/en-US/docs/Web/API/Request/credentials) - cross-origin credential behavior.
- npm registry via `npm view` - latest package versions and publish dates.

### Secondary (MEDIUM confidence)
- `docs/17-autenticacion.md`, `docs/10-tests.md` - current didactic and validation practices.
- `missions/14-auth-vanilla-login-crud.md`, `missions/15-framework-auth-login-crud.md` - learner workflows to keep synchronized.
- `NOTEBOOK.md` - recorded auth/OAuth friction and regression history.

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - verified against npm registry + current repo usage.
- Architecture: HIGH - derived from concrete current code paths and locked phase context.
- Pitfalls: HIGH - backed by existing tests and NOTEBOOK incidents.

**Research date:** 2026-06-17  
**Valid until:** 2026-07-17 (30 days; stack is relatively stable)

## Recommended plan split (actionable)

- **Plan 41.1 (required):** Vanilla dashboard OAuth mock entry integration + docs/mission/NOTEBOOK updates + regression checks on classic login/refresh/password continuity. [VERIFIED: phase scope and constraints]
- **Plan 41.2 (conditional by discretion lock):** React/Vue OAuth entry parity + auth smoke adaptation if selectors or text change. [ASSUMED]
