# Phase 35: Visual multi-dashboard - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-16
**Phase:** 35-Visual multi-dashboard
**Areas discussed:** Paridad DOM

---

## Paridad DOM

| Option | Description | Selected |
|--------|-------------|----------|
| Añadir IDs en React/Vue | `#dashboard-panel`, `#login-gate`, `#health-timestamp`; `visual-flow.js` sin cambios | ✓ |
| Extender `visual-flow.js` | Selectores opcionales por dashboard; sin tocar UI | |
| Selectores solo en specs | Locators por spec; helper solo login genérico | |

| Option | Description | Selected |
|--------|-------------|----------|
| Mínimo visual (3 IDs) | Solo los que usa `visual-flow.js` | ✓ |
| Paridad completa vanilla | Replicar todos los IDs de `dashboard/index.html` | |

**User's choice:** Add minimal visual IDs in React/Vue components; reuse `visual-flow.js` unchanged.
**Notes:** Aligns with phase 31 CRUD ID parity pattern. React/Vue currently have login/table IDs but not panel/gate/timestamp.

---

## Areas not discussed (inherited from phase 34 / ROADMAP)

- Helper reuse, Playwright projects, baseline strategy, and `test:visual` scope — locked by phase 34 contract and ROADMAP success criteria (documented in CONTEXT.md D-04–D-10).

## Claude's Discretion

- Exact wrapper markup for `#dashboard-panel` in App components.
- Task ordering within wave 1 (IDs before specs).

## Deferred Ideas

- Cross-framework pixel comparison — each dashboard keeps separate baseline.
