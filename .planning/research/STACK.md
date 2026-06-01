# Research: Stack — v1.4 Framework Dashboards

**Researched:** 2026-06-01  
**Milestone:** v1.4 Frontend Framework Comparison

## Recommendation

Use **Vite** as the dev/build tool for each framework app — standard, fast HMR, minimal config, aligns with educational "see changes instantly" goals.

## Stack additions

| Piece | Choice | Rationale |
|-------|--------|-----------|
| React app | Vite + React 19 (or 18 LTS) | Industry default; hooks map cleanly to vanilla patterns |
| Vue app | Vite + Vue 3 | Composition API parallels `ref`/`reactive` teaching |
| Location | `dashboard-react/`, `dashboard-vue/` | Preserves `dashboard/` vanilla; keeps `api/` untouched (CLAUDE.md) |
| Dev ports | 5174 (React), 5175 (Vue) | Avoid clash with vanilla `:5173` and API `:3100` |
| API URL | `VITE_API_BASE_URL` env | Same contract as hardcoded `API_BASE_URL` in vanilla |

## What NOT to add

- No monorepo tooling (pnpm workspaces) unless maintenance becomes painful — YAGNI for a lab
- No SSR/Next/Nuxt — obscures `fetch()` and CORS learning
- No state libraries (Redux, Pinia) in v1.4 — compare framework primitives first
- No changes to Express or database layers for framework milestone

## Integration

- `npm run dev` per folder; document in README
- Optional later: static `dist/` served by nginx in Compose (defer to phase or v1.5)
- CORS already allows `localhost:5173`; extend `cors()` origin list when framework ports are fixed

## Confidence

HIGH for Vite + separate folders; MEDIUM for exact port/CORS list (verify at implementation).
