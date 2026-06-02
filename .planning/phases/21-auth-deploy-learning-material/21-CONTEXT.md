# Phase 21: Auth & Deploy Learning Material - Context

**Gathered:** 2026-06-02
**Status:** Ready for planning
**Source:** ROADMAP v1.5 Phase 21 + REQUIREMENTS DOCS-01..04 (plan-phase synthesis)

<domain>
## Phase Boundary

Close the **v1.5 learning path** with documentation and missions — **no new API or dashboard features**:

- Publish/finalize `docs/17-autenticacion.md` (DOCS-01)
- New Mission 14: login → CRUD → logout → cookie inspection (DOCS-02)
- Update `docs/00-indice.md` and `README.md`; auth/deploy track **advanced after frameworks** (DOCS-03)
- Record real auth/CORS/deploy errors in `NOTEBOOK.md` (DOCS-04)
- Milestone UAT checklist referencing vanilla auth path (ROADMAP success criterion 4)

**Not in this phase:** React/Vue login UI, OAuth, new endpoints, code changes in `api/` or `dashboard/`.

**Filename note:** The repo uses Spanish `docs/17-autenticacion.md` (not `17-authentication.md` from early REQUIREMENTS draft). All plans and index entries use the Spanish filename.

</domain>

<decisions>
## Implementation Decisions

### Auth doc (DOCS-01)
- **D-01:** Treat `docs/17-autenticacion.md` as **mostly written** during phases 18–19; phase 21 **finalizes** gaps: bcrypt/password storage, JWT in httpOnly cookie, `credentials: 'include'`, link to `docs/18-production-deploy.md`.
- **D-02:** Do not rename to `17-authentication.md` — keep Spanish naming consistent with `16-frameworks.md`, `14-docker-compose.md`.

### Mission 14 (DOCS-02)
- **D-03:** Create `missions/14-auth-vanilla-login-crud.md` — vanilla `:5173` only (not React/Vue login).
- **D-04:** Mission steps: arrancar API + dashboard → login gate → CRUD smoke → logout → DevTools Cookie/Network on `/users`.
- **D-05:** Link Mission 14 from index under **Misiones avanzadas** after Mission 13; prerequisite missions 01–03.

### Navigation (DOCS-03)
- **D-06:** **Recorrido inicial** (missions 01–07) stays vanilla-first without auth gate confusion.
- **D-07:** **Ruta avanzada v1.5** after frameworks: doc 17 → Mission 14 → doc 18 → missions 11–12 (Compose).
- **D-08:** Add `docs/18-production-deploy.md` to index (deferred from Phase 20).
- **D-09:** README: new subsection **Ruta avanzada: autenticación y despliegue (v1.5)** with ordered links.

### NOTEBOOK (DOCS-04)
- **D-10:** Add `## Autenticación y despliegue (v1.5)` with ≥3 entries from real implementation:
  - 401 on `/users` without `credentials: 'include'` or without login
  - Production fail-fast without JWT_SECRET
  - git-secrets blocking JWT secret assignment lines in committed files (Phase 20)
- **D-11:** Follow NOTEBOOK síntoma/causa/solución/aprendizaje pattern (like Frameworks v1.4 block).

### UAT (ROADMAP criterion 4)
- **D-12:** Create `21-UAT.md` that **consolidates** Phase 19 vanilla auth UAT (6 scenarios) plus 2 deploy-doc smoke items (read doc 18, verify compose env prerequisite in README).
- **D-13:** Reference existing `19-UAT.md` (already complete) — do not re-run unless spot-check fails.

### Claude's Discretion
- Minor cross-links in `docs/02-puesta-en-marcha.md` or `CHANGELOG.md` if natural; not required unless they improve discoverability.
- Update root `ROADMAP.md` one-liner for v1.5 if still stale.

</decisions>

<canonical_refs>
## Canonical References

- `.planning/REQUIREMENTS.md` — DOCS-01..04
- `docs/17-autenticacion.md` — draft exists (untracked or partial)
- `docs/18-production-deploy.md` — Phase 20
- `missions/13-frameworks-network-tab.md` — mission format reference
- `.planning/phases/19-vanilla-dashboard-login/19-UAT.md` — auth UAT source
- `.planning/phases/17-framework-learning-material/17-02-PLAN.md` — index/NOTEBOOK/UAT pattern
- `NOTEBOOK.md` — Frameworks (v1.4) section pattern

</canonical_refs>

<deferred>
## Deferred Ideas

- Mission for React/Vue login implementation → v1.6+
- Full milestone v1.5 ship / complete-milestone → after Phase 21 execute + verify

</deferred>

---

*Phase: 21-auth-deploy-learning-material*
*Context gathered: 2026-06-02 (plan-phase synthesis)*
