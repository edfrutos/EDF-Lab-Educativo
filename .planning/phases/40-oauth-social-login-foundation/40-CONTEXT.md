# Phase 40: OAuth social login foundation - Context

**Gathered:** 2026-06-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Open the post-v2.3 track by introducing the first increment of **AUTH-ADV-01**: OAuth/social login foundation for operator accounts. Scope is limited to backend contract and didactic documentation updates, keeping current email/password + refresh rotation flows stable.

</domain>

<decisions>
## Implementation Decisions

### Scope for phase 40
- **D-01:** Phase 40 targets **AUTH-ADV-01** (`OAuth / social login providers`) as the next auth increment after refresh rotation.
- **D-02:** Preserve existing `/auth/login`, `/auth/refresh`, `/auth/logout`, and `/auth/password` contracts.
- **D-03:** Keep operator/accounts boundary intact; CRUD `users` domain remains untouched.
- **D-04:** Prefer a foundation-level implementation (provider-agnostic contract + one concrete provider flow or mockable adapter) over full multi-provider rollout.

### Didactic constraints
- **D-05:** New auth behavior must be mirrored in `docs/17-autenticacion.md` and mission-style learning material.
- **D-06:** Real OAuth integration friction (callback mismatch, state validation, local redirect issues) must be captured in `NOTEBOOK.md`.
- **D-07:** Validation path must include API tests for the new OAuth surface where practical, while preserving existing auth test guarantees.

### Out-of-scope in this phase
- **D-08:** Multi-provider federation and account linking are deferred.
- **D-09:** MFA/recovery flows remain deferred.
- **D-10:** Production deploy tracks (TLS automation, reverse proxy changes) remain deferred.

### Claude's Discretion
- Exact endpoint design (`/auth/oauth/*` vs equivalent) as long as contract and tests are explicit.
- Whether provider integration is real provider sandbox or local stub, provided educational value is preserved.
- Scope split between backend API and UI support in this phase vs follow-up phase.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Current baseline
- `.planning/STATE.md` — phase 39 verified baseline
- `.planning/ROADMAP.md` — completed auth-advanced milestone and next phase continuity
- `.planning/REQUIREMENTS.md` — AUTH-ADV-01/02/03
- `.planning/PROJECT.md` — educational constraints and value

### Existing auth implementation
- `api/index.js`
- `api/auth.js`
- `api/db-sqlite.js` / `api/db-pg.js`
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
- Email/password auth, password change, and refresh rotation are already shipped and verified.
- Auth tests and documentation have a proven additive evolution pattern.

### Gap to close
- AUTH-ADV-01 (OAuth/social login) is still pending in requirements.
- No OAuth callback/flow contract is currently exposed by API.

### Integration points
- `api/auth.js` + route wiring in `api/index.js` are primary integration points.
- `docs/17-autenticacion.md` and missions must remain aligned with real behavior.

</code_context>

<specifics>
## Specific Ideas

- Start with backend OAuth foundation and clear local testability before full UI rollout.
- Keep the implementation transparent for learners (state handling, callback validation, session issuance).

</specifics>

<deferred>
## Deferred Ideas

- Multi-provider account linking.
- Advanced OAuth threat handling matrix (token replay heuristics, risk scoring).
- MFA and recovery workflows.

</deferred>

---

*Phase: 40-OAuth social login foundation*
*Context gathered: 2026-06-17*
