# Phase 38: Auth advanced foundation - Context

**Gathered:** 2026-06-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Kick off post-v2.2 work by opening the auth-advanced track with a focused, didactic foundation phase. Scope is limited to establishing the next increment after cookie-based auth: password change flow for operator accounts, keeping current login/session behavior stable.

</domain>

<decisions>
## Implementation Decisions

### Scope for phase 38
- **D-01:** Phase 38 targets **AUTH-ADV-03** first (`password change API for operator accounts`) before OAuth/social providers and refresh-token rotation.
- **D-02:** Preserve current session model (JWT httpOnly cookie) and existing `/auth/login` + `/auth/logout` contracts.
- **D-03:** Keep operator/accounts boundary intact (do not mix with CRUD `users` domain).
- **D-04:** Additive implementation only: no breaking changes in current dashboard auth flow.

### Didactic constraints
- **D-05:** Any new auth behavior must be mirrored in docs and mission-oriented guidance style.
- **D-06:** Real auth-related errors discovered during implementation must be captured in `NOTEBOOK.md`.
- **D-07:** Validation path must include API tests (SQLite and Postgres where applicable), following existing quality gates.

### Out-of-scope in this phase
- **D-08:** OAuth/social login providers (AUTH-ADV-01) deferred to later phase.
- **D-09:** Refresh-token rotation architecture (AUTH-ADV-02) deferred to later phase.
- **D-10:** Production deploy items (TLS automation, compose reverse proxy) remain deferred tracks.

### Claude's Discretion
- Exact API shape for password change (`PATCH /auth/password` vs equivalent) as long as contracts are explicit and test-covered.
- Migration strategy for existing seeded operator credential in development env.
- Whether UI support lands in this phase or in a follow-up phase, provided API learning value is preserved.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Current baseline
- `.planning/STATE.md` — post-v2.2 shipped state
- `.planning/ROADMAP.md` — completed milestones and phase numbering continuity
- `.planning/REQUIREMENTS.md` — future requirements AUTH-ADV-01/02/03
- `.planning/PROJECT.md` — core value and constraints

### Existing auth implementation
- `api/index.js` — auth endpoints and middleware behavior
- `api/auth.js` (if present) and related auth helpers
- `docs/17-autenticacion.md` — documented current auth contract
- `missions/14-auth-vanilla-login-crud.md`
- `missions/15-framework-auth-login-crud.md`
- `NOTEBOOK.md` — historical auth friction patterns

### Test/CI surface
- `api/index.test.js`
- `api/index.pg.test.js`
- `api/test-auth-helpers.js`
- `.github/workflows/ci.yml`
- `docs/10-tests.md`

</canonical_refs>

<code_context>
## Existing Code Insights

### Stable base available
- Cookie-based operator auth is already shipped and used by vanilla/React/Vue flows.
- CI and E2E gates are mature after v2.2, reducing integration risk for additive backend auth work.

### Gap to close
- No password-change flow is currently documented as shipped capability.
- Future requirements list auth-advanced items but no phase context existed yet.

### Integration points
- Backend auth routes + tests are the primary integration surface.
- Documentation alignment in auth docs/missions is required for didactic consistency.

</code_context>

<specifics>
## Specific Ideas

- Start with a backend-only phase (API + tests + docs), then decide if dashboard UI for password change is a separate phase.
- Reuse current operator seed setup to test old-password/new-password validation paths.

</specifics>

<deferred>
## Deferred Ideas

- OAuth providers and social login onboarding.
- Refresh token rotation and session invalidation matrix.
- Multi-factor authentication and account recovery workflows.

</deferred>

---

*Phase: 38-Auth advanced foundation*
*Context gathered: 2026-06-17*
