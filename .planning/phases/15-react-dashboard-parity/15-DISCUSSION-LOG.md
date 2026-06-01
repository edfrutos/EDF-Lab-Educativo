# Phase 15 Discussion Log

**Date:** 2026-06-01  
**Phase:** 15 — React Dashboard Parity

## Areas discussed

Visual, Estructura React, Estado y formulario, Errores HTTP, Tooling, CORS

---

## Visual

| Question | Options | Selection |
|----------|---------|-----------|
| CSS approach | same css / minimal new / **Tailwind** | **Tailwind** |
| Section layout | same sections / simplified / you decide | **You decide** (planner: parity default) |
| Copy | reuse / shorter / you decide | **Reuse vanilla index.html** |

---

## Estructura React

| Question | Options | Selection |
|----------|---------|-----------|
| Component split | **mirror** / single App / feature | **Mirror vanilla sections** |
| fetchJson location | **api.js module** / inline / hook | **src/api.js** |
| Data flow | **lifted state** / context / you decide | **Lifted in App** |

---

## Estado y formulario

| Question | Options | Selection |
|----------|---------|-----------|
| State pattern | **useState** / useReducer / both doc | **useState** |
| After mutation | reload / optimistic / you decide | **You decide** (default: reload) |
| Edit mode | same / inline / you decide | **You decide** (default: same as vanilla) |

---

## Errores HTTP

| Question | Options | Selection |
|----------|---------|-----------|
| Offline | error-box / toast / you decide | **You decide** (default: error-box) |
| 409 duplicate | mutation only / inline / **both** | **Both global + inline email** |

---

## Tooling

| Question | Options | Selection |
|----------|---------|-----------|
| React version | 18 / 19 / you decide | **You decide** (default: 18 LTS) |
| Scripts | local only / root alias / you decide | **You decide** (default: local package.json) |

---

## CORS

| Question | Options | Selection |
|----------|---------|-----------|
| API change | **no change** / explicit origins / you decide | **No API change; verify :5174** |

---

## Outcome

User confirmed ready to generate CONTEXT.md after CORS discussion.
