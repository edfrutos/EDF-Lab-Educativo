# Phase 22: React Dashboard Auth - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-02
**Phase:** 22-react-dashboard-auth
**Areas discussed:** Arquitectura de componentes, Aspecto visual, 401 en mutaciones, Qué ocultar sin sesión

---

## Arquitectura de componentes

| Option | Description | Selected |
|--------|-------------|----------|
| LoginGate.jsx dedicado | Separación clara; App legible; patrón para Vue | ✓ |
| Todo inline en App.jsx | Menos archivos | |
| useState en App | isAuthenticated, loginError en App.jsx | ✓ |
| Custom hook useAuth() | Más abstracción | |
| login/logout en api.js | Junto a fetchJson | ✓ |
| fetch directo en LoginGate | Menos reutilizable | |
| useEffect bootstrap en App | health → probe /users → gate o load | ✓ |
| Hook useAuthBootstrap() | Encapsulado | |

**User's choice:** LoginGate.jsx + useState en App + api.js helpers + useEffect bootstrap en App
**Notes:** User skipped "Tú decides" options; all explicit recommendations accepted.

---

## Aspecto visual

| Option | Description | Selected |
|--------|-------------|----------|
| Card centrada tipo vanilla | Card Tailwind con borde/sombra | ✓ |
| Formulario mínimo sin card | Solo inputs | |
| Mostrar hint credenciales lab | admin@lab.local / changeme | ✓ |
| Sin hint en pantalla | | |
| Paleta Tailwind React existente | indigo/slate coherente con App | ✓ |
| Aproximar colores vanilla | | |
| Logout en toolbar | Junto a Recargar datos | ✓ |
| Logout en cabecera/hero | | |

**User's choice:** Card gate, lab hint visible, React Tailwind theme, logout in toolbar
**Notes:** Visual parity with vanilla structure but React styling stack (Phase 15 decision).

---

## 401 en mutaciones

| Option | Description | Selected |
|--------|-------------|----------|
| Volver al gate al instante | Ocultar shell, limpiar datos, gate con mensaje | ✓ |
| Error inline en formulario primero | | |
| Mensaje del API en loginError | error.message de fetchJson | ✓ |
| Mensaje fijo «Sesión expirada» | | |

**User's choice:** Immediate gate flip; API Spanish message on gate
**Notes:** Aligns with vanilla Phase 19 D-11; applies to loadDashboardData and CRUD mutations.

---

## Qué ocultar sin sesión

| Option | Description | Selected |
|--------|-------------|----------|
| Ocultar todo el shell | Solo LoginGate (+ bootstrap loading) | ✓ |
| Mostrar hero y conexión | CRUD oculto | |
| Estado de carga durante probe | «Comprobando sesión…» | ✓ |
| Sin estado intermedio | | |

**User's choice:** Full hide + bootstrap loading state
**Notes:** Prevents dashboard flash before 401 on first visit.

---

## Claude's Discretion

- Prop naming, minor Tailwind tweaks, bootstrap loading presentation, optional README auth note.

## Deferred Ideas

- Vue auth (Phase 23), CI/rate limit (Phase 24), framework auth docs (Phase 25)
- useAuth hook, React Context — deferred for teaching visibility
