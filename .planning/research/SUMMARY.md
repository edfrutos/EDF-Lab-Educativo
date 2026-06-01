# Project Research Summary

**Project:** EDF Lab Educativo  
**Domain:** Educational full-stack lab (Express + static/framework frontends)  
**Researched:** 2026-06-01  
**Confidence:** HIGH

## Executive Summary

v1.4 should add **two parallel Vite apps** (`dashboard-react/`, `dashboard-vue/`) that reproduce the vanilla dashboard's CRUD and health/load flow against the existing API. The vanilla `dashboard/` remains the primary learning path; frameworks are an **advanced branch** for comparing state and forms.

Stack changes are frontend-only: Vite dev servers on **5174/5175**, optional `cors()` origin extension, no database or Express redesign. A three-phase milestone (React → Vue → learning material) mirrors v1.1/v1.3 structure.

## Key Findings

### Recommended Stack

- **Vite + React** and **Vite + Vue 3** in sibling folders
- **`VITE_API_BASE_URL=http://localhost:3100`** per app
- **No** Redux/Pinia/Next/Nuxt in v1.4

### Expected Features

**Must have:** CRUD parity, health/api info load, loading/error/offline states, 409 duplicate email surfaced  
**Should have:** Comparison doc (state + forms), mission with Network tab  
**Defer:** Compose for framework apps, auth, E2E grid across three UIs

### Architecture

Separate folders; `api/` untouched except possible one-line CORS; host-run dev servers; build order React → Vue → docs.

### Critical Pitfalls

1. CORS — add new dev origins  
2. Port clashes — don't use 5173 for Vite  
3. Don't replace vanilla as default narrative  
4. Keep `fetch` visible — no hidden HTTP layers

## Implications for Roadmap

| Phase | Focus |
|-------|--------|
| 15 | React dashboard parity + CORS/ports |
| 16 | Vue dashboard parity |
| 17 | `docs/16-frameworks.md`, Mission 13, README/index, NOTEBOOK |

**Requirements estimate:** ~12 FRWK-* items across persistence N/A, two implementations, docs/mission.
