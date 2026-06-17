# Phase 36: CI visual regression - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-17
**Phase:** 36-CI visual regression
**Areas discussed:** Alcance del job CI visual, estrategia de artefactos, flujo de actualización de baselines

---

## Alcance del job CI visual

| Option | Description | Selected |
|--------|-------------|----------|
| Job dedicado `visual-regression` | Nuevo job aislado en `ci.yml` para snapshots | ✓ |
| Mezclar visual dentro de `e2e-smoke` | Reusar job existente y añadir tests visuales | |
| Workflow separado | Nuevo archivo workflow solo para visual | |

| Option | Description | Selected |
|--------|-------------|----------|
| Chromium only | Mantener costo/tiempo de CI controlado en fase 36 | ✓ |
| Chromium + Firefox | Visual multi-browser en v2.2 | |
| Full matrix (Chromium/Firefox/WebKit) | Cobertura máxima inmediata | |

**Decision note:** Se prioriza señal rápida y estable en PR sin aumentar demasiado el tiempo de CI.

---

## Estrategia de artefactos en fallo

| Option | Description | Selected |
|--------|-------------|----------|
| Upload artefactos Playwright en fallo | Diffs revisables cuando hay mismatch | ✓ |
| Solo logs de consola | Sin adjuntos visuales | |
| Upload siempre | Más trazabilidad, mayor costo de almacenamiento | |

**Decision note:** El criterio minimo de la fase es que un fallo visual sea revisable en PR checks.

---

## Flujo baseline update en PR

| Option | Description | Selected |
|--------|-------------|----------|
| Flujo manual documentado | `--update-snapshots` local + commit consciente | ✓ |
| Auto-update en CI | CI reescribe baselines automaticamente | |
| Script bot dedicado | Automatizacion con aprobación extra | |

**Decision note:** Mantener control humano didáctico sobre cambios visuales intencionales.

---

## Claude's Discretion

- Flags exactos de Playwright para `test:visual:ci`.
- Política final de upload (`if: failure()` o upload siempre) según balance costo/diagnóstico.
- Orden exacto de pasos de instalación en el nuevo job.

## Deferred Ideas

- Expandir visual CI a más navegadores en milestone futuro.
- Automatizar baseline approvals con governance de PR.
