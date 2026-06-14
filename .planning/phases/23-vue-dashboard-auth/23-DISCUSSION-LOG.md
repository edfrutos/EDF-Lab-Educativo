# Phase 23: Vue Dashboard Auth - Discussion Log

> **Audit trail only.** Decisions captured in CONTEXT.md.

**Date:** 2026-06-02
**Phase:** 23-vue-dashboard-auth
**Areas discussed:** LoginGate.vue SFC, Comunicación emit, Render condicional, Visibilidad del shell

---

## LoginGate.vue como SFC

| Option | Selected |
|--------|----------|
| LoginGate.vue dedicado | ✓ |
| Formulario inline en App.vue | |

**User's choice:** Dedicated `LoginGate.vue` mirroring React `LoginGate.jsx`.

---

## Comunicación LoginGate → App

| Option | Selected |
|--------|----------|
| emit('login', email, password) | ✓ |
| Prop onLogin callback (React style) | |

**User's choice:** Vue emit pattern for didactic contrast with React callback prop.

---

## Render condicional

| Option | Selected |
|--------|----------|
| v-if en template único | ✓ (Claude discretion) |
| — | User selected "Tú decides" |

**Resolution:** Single template with `v-if` / `v-else-if` / `v-else` for bootstrap, gate, dashboard.

---

## Qué ocultar sin sesión

| Option | Selected |
|--------|----------|
| Ocultar todo el shell | ✓ |
| Mostrar hero + conexión | |

**User's choice:** Full hide — parity with Phase 22 and vanilla 19.

---

## Carried forward without discussion

- Bootstrap health → /users probe
- 401 immediate gate, 403 inline
- login/logout in api.js
- Lab hint, logout in toolbar
- Plan split 23-01 / 23-02 like Phase 22

## Deferred Ideas

- Framework auth docs (Phase 25), CI (Phase 24), Pinia/useAuth composable
