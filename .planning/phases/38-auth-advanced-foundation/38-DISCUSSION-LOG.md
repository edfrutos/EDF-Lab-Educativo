# Phase 38: Auth advanced foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves alternatives considered.

**Date:** 2026-06-17
**Phase:** 38-Auth advanced foundation
**Areas discussed:** Priorización post-v2.2, alcance auth avanzado, límites de fase

---

## Priorización post-v2.2

| Option | Description | Selected |
|--------|-------------|----------|
| AUTH-ADV-03 primero | Cambio de contraseña para operador como siguiente paso incremental | ✓ |
| AUTH-ADV-01 primero | OAuth/social login como primer frente | |
| PROD deferred primero | TLS/proxy/deploy antes de auth avanzado | |

**Decision note:** Se prioriza un incremento auth con valor didáctico alto y riesgo acotado.

---

## Alcance funcional de fase 38

| Option | Description | Selected |
|--------|-------------|----------|
| Backend auth API + tests | Cambio de contraseña en API con cobertura | ✓ |
| Backend + UI en dashboards | API y pantalla de cambio en la misma fase | |
| Solo investigación | Sin implementación inmediata | |

**Decision note:** Mantener foco en base técnica y contrato primero.

---

## Límites y no-objetivos

| Option | Description | Selected |
|--------|-------------|----------|
| Mantener cookie JWT actual | Sin rediseñar sesión completa | ✓ |
| Introducir refresh rotation ya | Cambiar arquitectura de sesión ahora | |
| Incluir OAuth en paralelo | Mezclar dos tracks de auth en una fase | |

**Decision note:** Evitar expansión de alcance; fase aditiva y compatible.

---

## Claude's Discretion

- Diseño exacto del endpoint de cambio de contraseña.
- Estrategia de documentación/misión asociada según impacto didáctico.
- Distribución en waves entre API, tests y documentación.

## Deferred Ideas

- OAuth/social login.
- Refresh token rotation y políticas de revocación.
- MFA y recuperación de cuenta.
