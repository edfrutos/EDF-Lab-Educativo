# Phase 37: Material didáctico visual - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-17
**Phase:** 37-Material didáctico visual
**Areas discussed:** Enfoque de misión 18, cobertura documental v2.2, captura de fricciones en NOTEBOOK

---

## Mission 18

| Option | Description | Selected |
|--------|-------------|----------|
| Misión guiada completa | Ejecutar visual, provocar fallo controlado, revisar diff y actualizar baseline | ✓ |
| Misión corta solo comandos | Lista mínima sin troubleshooting | |
| Sin misión nueva | Reusar misión 17 | |

**Decision note:** Se prioriza aprendizaje práctico y repetible del ciclo completo de regresión visual.

---

## Cobertura documental

| Option | Description | Selected |
|--------|-------------|----------|
| Ampliar `docs/10-tests.md` | Reforzar sección visual con setup/update/flake/CI | ✓ |
| Documento nuevo v2.2 | Crear doc separado para visual | |
| Solo README | Añadir notas resumidas sin guía técnica | |

| Option | Description | Selected |
|--------|-------------|----------|
| Actualizar índice + README | Ruta v2.2 visible desde puntos de entrada | ✓ |
| Solo índice | Mantener README sin cambios | |

---

## NOTEBOOK v2.2

| Option | Description | Selected |
|--------|-------------|----------|
| ≥2 fricciones reales con formato síntoma/causa/solución/aprendizaje | Patrón histórico del repo | ✓ |
| Resumen breve sin detalle de errores | Menos didáctico | |
| Entrada única agregada | No cumple requisito DOCS-06 | |

**Decision note:** El foco es convertir incidencias reales en conocimiento reutilizable.

---

## Claude's Discretion

- Nivel de profundidad de la misión (paso a paso vs checkpoints).
- Qué fricciones v2.2 priorizar en NOTEBOOK según valor didáctico.
- Dónde insertar exactamente la ruta v2.2 en README/índice sin romper flujo actual.

## Deferred Ideas

- Video walkthrough de revisión de snapshot diffs.
- Plantilla reusable para futuras misiones de regresión visual avanzada.
