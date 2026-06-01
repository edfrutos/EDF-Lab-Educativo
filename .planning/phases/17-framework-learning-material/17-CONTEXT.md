# Phase 17: Framework Learning Material - Context

**Gathered:** 2026-06-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver **documentation and guided practice** that closes milestone v1.4: compare vanilla, React, and Vue dashboards for **state** and **forms**; add Mission 13 with Network tab inspection; update index/README as **advanced optional** paths; record framework integration pitfalls in NOTEBOOK; provide a **unified UAT** across three frontends on the same API.

**No new dashboard application code** in this phase (no changes to `dashboard/`, `dashboard-react/`, `dashboard-vue/` behavior unless a one-line doc fix). No `docs/17-*.md` numbering for the comparison doc — use **`docs/16-frameworks.md`** per v1.4 research and FRWK-09.

</domain>

<decisions>
## Implementation Decisions

### Comparison doc (`docs/16-frameworks.md`) — FRWK-09
- **D-01:** Create **`docs/16-frameworks.md`** in Spanish, same tone as `docs/04-dashboard-fetch.md` and `docs/05-cors-explicado.md`.
- **D-02:** Structure:
  1. Intro — three apps, ports table (5173 / 5174 / 5175 / 3100), vanilla as primary path
  2. **Estado** — vanilla globals + `elements` vs React `useState` in `App.jsx` vs Vue `ref()` in `App.vue`
  3. **Formularios** — edit mode, submit handlers, 409 dual feedback (same UX, different syntax)
  4. **HTTP** — shared `fetchJson` pattern in three apps; `VITE_API_BASE_URL` vs hardcoded vanilla URL
  5. **Estilos** — vanilla `styles.css` vs Tailwind in React/Vue (explicit teaching moment from phase 15)
  6. **Qué no incluimos en v1.4** — Pinia, Redux, routers, axios (one short paragraph)
- **D-03:** Include **real code excerpts** from this repo with file paths and line ranges (trimmed, not full files).
- **D-04:** Use **tables + short narrative** (not essay-length); target ~same reading time as `docs/13-sqlite.md` (medium depth).

### Mission 13 — FRWK-10
- **D-05:** New file **`missions/13-frameworks-network-tab.md`** (Mission 13).
- **D-06:** **Required path:** API on `:3100` + **one** framework app (learner chooses React **or** Vue); complete load + one CRUD + Network tab inspection on at least **GET /users** and **POST /users**.
- **D-07:** **Reto extra:** repeat inspection on the other framework app, or compare request headers with vanilla `:5173`.
- **D-08:** Mission sections: Objetivo, Pasos, Resultado esperado, Reto extra (per `AGENTS.md`).
- **D-09:** Link to `docs/16-frameworks.md`, `docs/05-cors-explicado.md`, and framework READMEs.

### Index & README — FRWK-11
- **D-10:** Update **`docs/00-indice.md`** — add `16-frameworks.md` in recommended reading **after** vanilla/dashboard docs, labeled *(avanzado, opcional)*; mention `dashboard-react/` and `dashboard-vue/` in intro or a short “Rutas opcionales” bullet.
- **D-11:** Update **root `README.md`** — ensure vanilla-first narrative; optional subsections for React and Vue already present — add link to Mission 13 and `docs/16-frameworks.md`.
- **D-12:** If **`missions/`** is listed in README or index, add Mission 13 entry.

### NOTEBOOK — FRWK-12
- **D-13:** Add section **`## Frameworks (v1.4)`** in `NOTEBOOK.md` with dated sub-entries.
- **D-14:** Document at minimum these real lab patterns (symptom → cause → fix):
  - CORS error when opening `:5174` / `:5175` without API or wrong origin
  - `EADDRINUSE` / port clash (5173 vs Vite ports)
  - Wrong or missing `VITE_API_BASE_URL`
  - `strictPort` failure when 5174/5175 busy
- **D-15:** Incorporate any **actual errors** encountered during phases 15–16 execution; if none logged, use PITFALLS.md + verification notes as teaching entries (label as “patrón documentado” vs “error vivido”).

### Unified UAT — FRWK-13
- **D-16:** Create **`.planning/phases/17-framework-learning-material/17-UAT.md`** — single checklist covering **5173, 5174, 5175** against one API instance.
- **D-17:** Scenarios: per-app initial load, one CRUD cycle (can be abbreviated on 2nd/3rd app after full test on first), 409 on any one app, CORS console check per app, api unchanged note.
- **D-18:** Reference existing `15-UAT.md` and `16-UAT.md` but **17-UAT** is the milestone-level sign-off for FRWK-13.

### Claude's Discretion
- Exact excerpt line counts and table formatting in `16-frameworks.md`.
- Whether to add a one-line cross-link in `docs/07-retos.md` or `docs/04-dashboard-fetch.md`.
- Mission 13 filename minor variant if `13-frameworks-network-tab.md` is too long (keep number **13**).
- Plan split (~2 plans): doc+mision vs index+NOTEBOOK+UAT per ROADMAP hint.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & roadmap
- `.planning/REQUIREMENTS.md` — FRWK-09 through FRWK-13
- `.planning/ROADMAP.md` — Phase 17 success criteria
- `.planning/research/SUMMARY.md`, `PITFALLS.md`, `STACK.md`

### Three dashboards (excerpt sources)
- `dashboard/app.js`, `dashboard/index.html`
- `dashboard-react/src/App.jsx`, `dashboard-react/src/api.js`, `dashboard-react/README.md`
- `dashboard-vue/src/App.vue`, `dashboard-vue/src/api.js`, `dashboard-vue/README.md`

### Existing docs & missions (style)
- `docs/04-dashboard-fetch.md`, `docs/05-cors-explicado.md`, `docs/13-sqlite.md`
- `docs/00-indice.md`, `README.md`, `NOTEBOOK.md`
- `missions/02-arrancar-dashboard.md`, `missions/12-postgres-compose-crud.md` — mission format
- `AGENTS.md` — mission structure, didactic rules

### Prior phase UAT
- `.planning/phases/15-react-dashboard-parity/15-UAT.md`
- `.planning/phases/16-vue-dashboard-parity/16-UAT.md`

</canonical_refs>

<code_context>
## Existing Code Insights

### Shipped in v1.4
- Full parity on three UIs; dual 409 feedback on React/Vue
- Ports and env documented per app README

### Gaps this phase fills
- No `docs/16-frameworks.md` yet
- No Mission 13
- NOTEBOOK has no frameworks section yet
- No unified three-dashboard UAT

### Patterns
- Docs numbered in `docs/`; missions numbered in `missions/`
- Optional/advanced labeling in index (OpenAPI, Docker, Postgres precedent)

</code_context>

<specifics>
## Specific Ideas

- User interrupted area selection — **defaults applied** from FRWK-09–13, phase 15–16 deferred items, and `PITFALLS.md`.
- Phase 15 explicitly required **Tailwind vs styles.css** callout in comparison doc.
- Mission should reinforce **visible `fetch`** and Network tab (research teaching mistake avoidance).

</specifics>

<deferred>
## Deferred Ideas

- **Compose / Docker for Vite apps** — document as out of scope in `16-frameworks.md`, not implement
- **E2E test grid across three UIs** — future milestone
- **Auth, shared component library** — not v1.4
- **Renumbering doc to 17-frameworks** — rejected; keep `16-frameworks.md` per research

</deferred>

---

*Phase: 17-framework-learning-material*
*Context gathered: 2026-06-01*
