# Phase 25: Framework Auth Learning Material — Context

**Captured:** 2026-06-02 (derived from ROADMAP + REQUIREMENTS; closes v1.6 milestone)

## Goal

Complete the v1.6 learning path: compare auth across vanilla/React/Vue, add Mission 15, wire navigation, and document real friction in NOTEBOOK.

## In scope

- Update `docs/16-frameworks.md` — auth comparison (post phases 22–23); remove stale v1.4 «sin login» guidance
- Create `missions/15-framework-auth-login-crud.md` — login → CRUD → logout on React **or** Vue with DevTools
- Update `missions/13-frameworks-network-tab.md` — frameworks now have login; AUTH_DISABLED test-only
- `docs/00-indice.md` — v1.6 route, Mission 15, CI link
- Framework READMEs — links to auth, Mission 15, `docs/10-tests.md` CI
- Root `README.md` — CI badge + v1.6 learning path subsection
- `NOTEBOOK.md` — ≥2 entries under «Framework Auth & CI (v1.6)»
- `CHANGELOG.md` — v1.6 milestone entry

## Out of scope

- New API or frontend code (phases 22–24 complete)
- Mission 16+, new docs beyond index updates
- OAuth, refresh tokens

## Locked decisions

| ID | Decision |
|----|----------|
| D-01 | Expand «Autenticación y los tres paneles» in `docs/16-frameworks.md`; add comparison table + code pointers |
| D-02 | Mission 15 mirrors Mission 14 structure; learner picks React **or** Vue (not both required) |
| D-03 | Mission 15 requires auth **on** (no AUTH_DISABLED); credentials `admin@lab.local` / `changeme` |
| D-04 | Highlight React `onLogin` callback vs Vue `@login` emit as didactic contrast |
| D-05 | Mission 13 updated in place — not deprecated; add note pointing to Mission 15 for auth |
| D-06 | CI badge in README: `edfrutos/EDF-Lab-Educativo` workflow `ci.yml` |
| D-07 | NOTEBOOK section «Framework Auth & CI (v1.6)» with ≥2 real friction entries |
| D-08 | `docs/00-indice.md` adds «Ruta v1.6» after v1.5 block |

## Requirements mapping

| Requirement | Deliverable |
|-------------|-------------|
| DOCS-01 | `docs/16-frameworks.md` auth comparison |
| DOCS-02 | `missions/15-framework-auth-login-crud.md` |
| DOCS-03 | `docs/00-indice.md`, README badge, framework READMEs |
| DOCS-04 | `NOTEBOOK.md` v1.6 entries |

## Stale content to fix

| File | Problem |
|------|---------|
| `docs/16-frameworks.md` L15–27 | Says React/Vue have no login |
| `docs/16-frameworks.md` L296–300 | «Qué no incluimos» lists login in React/Vue |
| `missions/13-frameworks-network-tab.md` L21 | Instructs AUTH_DISABLED for frameworks |

## Reference implementations (post 22–23)

- Vanilla: `dashboard/app.js` — `bootstrapAuth`, `LoginGate` in HTML
- React: `dashboard-react/src/App.jsx`, `LoginGate.jsx` — `onLogin` prop
- Vue: `dashboard-vue/src/App.vue`, `LoginGate.vue` — `emit('login')`

## Success criteria (ROADMAP)

1. Auth comparison in doc 16 across three frontends
2. Mission 15 with cookie DevTools inspection
3. Index + READMEs link auth + CI
4. ≥2 NOTEBOOK entries for framework-auth or CI friction
