# Research: Pitfalls — v1.4 Framework Dashboards

**Researched:** 2026-06-01

## Pitfalls when adding frameworks to this lab

| Pitfall | Warning sign | Prevention | Phase |
|---------|--------------|------------|-------|
| Hiding `fetch()` behind ORM-like clients | Learners can't trace HTTP | Keep raw `fetch` in framework apps; mirror vanilla `fetchJson` | 15–16 |
| Breaking CORS | Blank table, browser console CORS error | Add framework dev origins to `cors()`; document in NOTEBOOK | 15 |
| Port collisions | EADDRINUSE on 5173 | Fixed ports 5174/5175 in docs and `.env.example` | 15 |
| Replacing vanilla as "the" dashboard | README only mentions React | README: vanilla primary; frameworks advanced | 17 |
| Massive dependency trees | `node_modules` in repo root | Separate `package.json` per dashboard-* folder | 15 |
| Over-abstracting state | Redux/Pinia before hooks/refs | Ban global state libs in v1.4 requirements | 15–16 |
| Compose scope creep | Trying to containerize Vite HMR | Host-run framework dev servers in v1.4 | 17 doc |
| API changes for DX | Backend "helpers" for frontend | Requirement: HTTP contract unchanged | 15 |

## Teaching mistakes to avoid

- Don't delete or gut `dashboard/app.js` — it's the reference implementation
- Don't teach framework CLI magic without showing generated file structure
- Document "open Network tab" for each framework app same as vanilla mission flow

## Confidence

HIGH — these match prior milestone NOTEBOOK patterns (CORS, ports, EADDRINUSE).
