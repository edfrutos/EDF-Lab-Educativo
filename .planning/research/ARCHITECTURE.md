# Research: Architecture — v1.4 Framework Dashboards

**Researched:** 2026-06-01

## Current (unchanged)

```txt
Navegador → localhost:5173 → vanilla dashboard → fetch → localhost:3100 → api/
```

## Target

```txt
Navegador → :5173  → dashboard/        (primary, unchanged)
           → :5174  → dashboard-react/  (Vite dev)
           → :5175  → dashboard-vue/    (Vite dev)
                              ↓ fetch (same JSON contract)
                         localhost:3100 → api/
```

## Principles

1. **No coupling** — `api/index.js` unchanged unless CORS origin list needs one line
2. **Copy patterns, not code** — Reimplement `elements` + helpers idiomatically per framework
3. **Build order** — React first (larger ecosystem), Vue second, comparison doc last
4. **Compose** — Keep existing three-service stack; framework dashboards run on host in v1.4 (document why)

## New components

| Component | Responsibility |
|-----------|----------------|
| `dashboard-react/` | Vite React SPA, CRUD parity |
| `dashboard-vue/` | Vite Vue SPA, CRUD parity |
| `docs/16-frameworks.md` (proposed) | Comparison narrative |
| `missions/13-*.md` (proposed) | Hands-on framework path |

## Suggested phase order

1. **Phase 15** — React scaffold + parity + CORS port update
2. **Phase 16** — Vue scaffold + parity
3. **Phase 17** — Comparison doc, mission, README/index, NOTEBOOK
