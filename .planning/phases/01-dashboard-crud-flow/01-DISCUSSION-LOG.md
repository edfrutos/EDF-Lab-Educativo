# Phase 1: Dashboard CRUD Flow - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-26
**Phase:** 1-Dashboard CRUD Flow
**Areas discussed:** CRUD Placement, Edit Flow, Delete Flow, Didactic HTTP Feedback

---

## CRUD Placement

| Option | Description | Selected |
|--------|-------------|----------|
| Formulario encima de la tabla | Mantiene el flujo visible: formulario -> petición API -> tabla actualizada. | ✓ |
| Formulario en una tarjeta separada | Más orden visual, pero separa un poco la acción del resultado. | |
| Controles principalmente por fila | Más parecido a una app real, pero más complejo para principiantes. | |

**User's choice:** Formulario encima de la tabla.
**Notes:** The phase should optimize for beginner visibility of the flow.

---

## Edit Flow

| Option | Description | Selected |
|--------|-------------|----------|
| Cargar datos en el mismo formulario | El formulario cambia a modo edición y muestra “Editando usuario X”. | ✓ |
| Editar directamente en la fila | Más inmediato, pero mezcla tabla y formulario y complica el DOM. | |
| Abrir una sección/modal de edición | Más separado visualmente, pero añade patrón nuevo. | |

**User's choice:** Cargar datos en el mismo formulario.
**Notes:** The create form also becomes the edit form. Editing state should be visible.

---

## Delete Flow

| Option | Description | Selected |
|--------|-------------|----------|
| Confirmación nativa del navegador | Simple, visible para principiantes y sin crear un componente extra. | ✓ |
| Borrado inmediato con mensaje posterior | Más rápido, pero puede sorprender. | |
| Confirmación visual dentro de la página | Más pulido, pero añade más UI y estado. | |

**User's choice:** Confirmación nativa del navegador.
**Notes:** Use `confirm()` before calling `DELETE /users/:id`.

---

## Didactic HTTP Feedback

| Option | Description | Selected |
|--------|-------------|----------|
| Mostrar método y endpoint usado | Example: `POST /users -> usuario creado`. Reinforces learning without too much noise. | ✓ |
| Mostrar solo mensajes simples | Cleaner but less didactic. | |
| Mostrar también el JSON enviado/recibido | Very didactic but may occupy too much space for this phase. | |

**User's choice:** Mostrar método y endpoint usado.
**Notes:** Keep feedback concise; do not require raw JSON display in this phase.

---

## the agent's Discretion

- Exact labels, DOM ids/classes, and styling details.
- Whether successful mutations reload all users or update local state, provided the learner-visible flow stays clear.

## Deferred Ideas

- Raw JSON sent/received display.
- Custom visual delete confirmation.
- Framework-based form state.
