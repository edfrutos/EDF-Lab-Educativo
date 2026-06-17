# Phase 39: Refresh token rotation foundation - Context

**Gathered:** 2026-06-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Advance the auth-advanced track after phase 38 by introducing a didactic foundation for session hardening: refresh-token rotation for operator sessions. Scope is limited to backend contract + tests + documentation alignment without introducing OAuth providers yet.

</domain>

<decisions>
## Implementation Decisions

### Scope for phase 39
- **D-01:** Phase 39 targets **AUTH-ADV-02** (`refresh tokens and token rotation`) as the next auth increment after password change.
- **D-02:** Keep current operator login contract (`/auth/login`) as entry point, extending session lifecycle behavior additively.
- **D-03:** Maintain operator/accounts boundary; CRUD `users` domain remains untouched.
- **D-04:** Prefer minimum viable rotation flow (issue refresh token, rotate on refresh, invalidate previous token).

### Didactic constraints
- **D-05:** New auth lifecycle behavior must be reflected in `docs/17-autenticacion.md` and mission-oriented guidance.
- **D-06:** Any real friction (token invalidation edge cases, cookie confusion, test race) must be captured in `NOTEBOOK.md`.
- **D-07:** Validation path must include API tests (SQLite + Postgres where available), following existing quality gates.

### Out-of-scope in this phase
- **D-08:** OAuth/social providers (**AUTH-ADV-01**) remain deferred.
- **D-09:** MFA/recovery flows remain deferred.
- **D-10:** Production TLS/proxy deploy tracks remain deferred.

### Claude's Discretion
- Exact route shape for refresh operation (`POST /auth/refresh` or equivalent) as long as contract is explicit and test-covered.
- Token persistence strategy (single valid refresh token vs family chain) for this educational phase.
- Cookie naming and expiration policy details if they remain coherent with existing auth docs.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Current baseline
- `.planning/STATE.md` — phase 38 verified baseline
- `.planning/ROADMAP.md` — auth-advanced milestone continuity
- `.planning/REQUIREMENTS.md` — AUTH-ADV-01/02/03 progression
- `.planning/PROJECT.md` — educational constraints and value

### Existing auth implementation
- `api/index.js` — auth route wiring
- `api/auth.js` — current session handlers and password change
- `api/db-sqlite.js` / `api/db-pg.js` — account persistence surface
- `docs/17-autenticacion.md`
- `missions/14-auth-vanilla-login-crud.md`
- `missions/15-framework-auth-login-crud.md`
- `NOTEBOOK.md`

### Test/CI surface
- `api/index.test.js`
- `api/index.pg.test.js`
- `api/test-auth-helpers.js`
- `docs/10-tests.md`
- `.github/workflows/ci.yml`

</canonical_refs>

<code_context>
## Existing Code Insights

### Stable base available
- Cookie-based auth with operator account boundary is already shipped and tested.
- Password change flow (`AUTH-ADV-03`) has established additive auth evolution pattern.

### Gap to close
- Current sessions are login/logout centered; no refresh rotation contract is documented or tested.
- Future requirement AUTH-ADV-02 is pending with no phase context before this discussion.

### Integration points
- `api/auth.js` and auth tests are the primary implementation surface.
- Docs/missions alignment is required for didactic consistency.

</code_context>

<specifics>
## Specific Ideas

- Start with backend-only rotation foundation (endpoint + tests + docs) and defer UI controls if needed.
- Keep refresh lifecycle observable (clear response/cookie behavior) to maximize teaching value.

</specifics>

<deferred>
## Deferred Ideas

- OAuth/social login onboarding.
- Multi-provider identity linking.
- MFA and account recovery workflows.

</deferred>

---

*Phase: 39-Refresh token rotation foundation*
*Context gathered: 2026-06-17*
