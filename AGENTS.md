# AGENTS

Roles conceptuales del laboratorio educativo.

No son personas reales necesariamente: son responsabilidades para mantener el proyecto ordenado.

---

## Arquitecto didáctico

Responsable de:

- ordenar la ruta de aprendizaje,
- dividir el proyecto en fases,
- decidir qué se enseña antes y qué después,
- evitar complejidad innecesaria.

---

## Backend mentor

Responsable de:

- explicar Express,
- diseñar endpoints,
- introducir validación,
- enseñar errores HTTP,
- preparar tests de API.

---

## Frontend mentor

Responsable de:

- explicar `fetch()`,
- renderizar JSON en HTML,
- gestionar estados de carga/error,
- mejorar accesibilidad,
- hacer visible el flujo de datos.

---

## Documentalista

Responsable de:

- mantener `README.md`,
- mantener `NOTEBOOK.md`,
- crear documentación conceptual,
- convertir errores reales en aprendizaje,
- mantener las misiones prácticas.

---

## Reglas de trabajo

1. Todo cambio debe tener una explicación didáctica.
2. Todo concepto debe ir acompañado de un ejemplo ejecutable.
3. Todo error real relevante debe documentarse en `NOTEBOOK.md`.
4. Toda misión debe tener objetivo, pasos, resultado esperado y reto extra.
5. No añadir dependencias si no aportan valor educativo claro.
6. Validar siempre que sea posible.

---

<!-- GSD:project-start source:.planning/PROJECT.md -->
## Contexto GSD del proyecto

**Proyecto:** EDF Lab Educativo

Laboratorio práctico para aprender el flujo backend Express -> JSON -> frontend estático. La audiencia principal es el propietario del proyecto y alumnos principiantes.

**Valor central:** hacer visible, ejecutable y enseñable el flujo backend -> JSON -> frontend, convirtiendo errores reales en aprendizaje documentado.

### Restricciones

- Mantener claridad didáctica en cada cambio.
- Acompañar conceptos nuevos con ejemplos ejecutables.
- Documentar errores reales relevantes en `NOTEBOOK.md`.
- Mantener misiones con objetivo, pasos, resultado esperado y reto extra.
- Evitar dependencias sin valor educativo claro.
- Validar siempre que sea práctico con checks, endpoints, auditorías o tests.
- Mantener Express + HTML/CSS/JS vanilla como base inmediata.
- Aceptar frameworks más adelante solo cuando ayuden a la ruta de aprendizaje.
<!-- GSD:project-end -->

<!-- GSD:workflow-start source:.planning -->
## Workflow GSD

Antes de cambios grandes, usar los artefactos de `.planning/` como fuente de contexto:

- `.planning/PROJECT.md`: intención, valor central, restricciones y decisiones.
- `.planning/REQUIREMENTS.md`: requisitos trazables.
- `.planning/ROADMAP.md`: fases y criterios de éxito.
- `.planning/STATE.md`: posición actual.
- `.planning/codebase/`: mapa del estado técnico.

Entrada recomendada para la siguiente fase:

```txt
$gsd-discuss-phase 1
```

También disponible:

```txt
$gsd-plan-phase 1
```
<!-- GSD:workflow-end -->
