# Phase 25 Patterns

Maps v1.6 learning material to Phase 21 analogs.

| New/updated artifact | Closest analog | Notes |
|---------------------|----------------|-------|
| `docs/16-frameworks.md` auth section | Phase 21 updated `docs/17-autenticacion.md` | Expand in place; Spanish educational tone |
| `missions/15-framework-auth-login-crud.md` | `missions/14-auth-vanilla-login-crud.md` | Same sections: Objetivo, Pasos, Resultado, Reto extra, Enlaces |
| `missions/13-frameworks-network-tab.md` patch | Self — add «Actualización v1.6» note | Keep CRUD-with-auth-disabled as optional fast path |
| `docs/00-indice.md` v1.6 block | v1.5 block in same file | After frameworks + auth deploy sections |
| `NOTEBOOK.md` v1.6 section | «Autenticación y despliegue (v1.5)» | Same ### síntoma/causa/solución/aprendizaje format |
| README CI badge | Phase 24 text link | Add badge above or beside existing CI sentence |
| `CHANGELOG.md` v1.6 | v1.5 entry pattern | Phases 22–25 summary |

## Mission numbering

| # | Focus |
|---|-------|
| 13 | Network tab — CRUD (can use AUTH_DISABLED for speed) |
| 14 | Vanilla auth |
| 15 | Framework auth (React or Vue) |

## Cross-link graph

```
docs/00-indice.md
  → docs/16-frameworks.md (auth section)
  → missions/15-framework-auth-login-crud.md
  → docs/10-tests.md (CI)
  → docs/17-autenticacion.md

missions/15
  → dashboard-react/README or dashboard-vue/README
  → docs/16-frameworks.md

dashboard-react/README + dashboard-vue/README
  → missions/15
  → docs/10-tests.md#ci-en-github-actions
```
