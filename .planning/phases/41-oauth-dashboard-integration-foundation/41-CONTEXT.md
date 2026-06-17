# Phase 41: OAuth dashboard integration foundation - Context

**Gathered:** 2026-06-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Continue milestone v2.4 by connecting the OAuth foundation from phase 40 with the learning-facing dashboard flows. Scope is limited to frontend auth entry points and didactic coherence, preserving backend OAuth contracts and existing email/password flow.

</domain>

<decisions>
## Implementation Decisions

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

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Current baseline
- `.planning/STATE.md` — phase 40 verified baseline and current focus
- `.planning/ROADMAP.md` — milestone v2.4 continuity into phase 41
- `.planning/REQUIREMENTS.md` — auth advanced requirements status
- `.planning/PROJECT.md` — educational constraints and value

### OAuth/auth implementation
- `api/auth.js` — OAuth start/callback + session issuance
- `api/index.js` — auth route wiring and endpoint contract
- `dashboard/app.js` — auth UI flow integration surface
- `dashboard/index.html` — auth interaction entry points
- `docs/17-autenticacion.md`
- `missions/14-auth-vanilla-login-crud.md`
- `missions/15-framework-auth-login-crud.md`
- `NOTEBOOK.md`

### Validation surface
- `api/test-auth-helpers.js`
- `api/index.test.js`
- `api/index.pg.test.js`
- `docs/10-tests.md`

</canonical_refs>

<code_context>
## Existing Code Insights

### Stable base available
- OAuth foundation is already backend-complete and verified in phase 40.
- Auth test suite already includes OAuth start/callback coverage and protects prior auth contracts.
- Mission/docs pattern for auth phases is stable and additive.

### Gap to close
- Dashboard auth UX still centers on email/password; OAuth path is not yet visible as a first-class learning flow.
- Learners can call OAuth endpoints manually, but they do not yet see a guided frontend handoff path.

### Integration points
- `dashboard/app.js` and `dashboard/index.html` are the main UI surfaces for OAuth trigger/handoff.
- `docs/17-autenticacion.md` and missions 14/15 must remain synchronized with actual user-facing flow.

</code_context>

<specifics>
## Specific Ideas

- Add a minimal "Continuar con OAuth mock" path near existing login flow to keep comparison explicit.
- Keep the OAuth flow inspectable for learners (state, callback, resulting authenticated access).

</specifics>

<deferred>
## Deferred Ideas

- Real Google/GitHub provider onboarding.
- Account linking between password and social identities.
- Advanced OAuth threat matrix and incident response.

</deferred>

---

*Phase: 41-OAuth dashboard integration foundation*
*Context gathered: 2026-06-17*
