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

## Cursor Cloud specific instructions

### Servicios para desarrollo (flujo principal)

| Servicio | Puerto | Arranque |
|---|---|---|
| API Express (`api/`) | 3100 | `cd api && PORT=3100 npm start` |
| Dashboard vanilla (`dashboard/`) | 5173 | `cd dashboard && python3 -m http.server 5173` |

El dashboard consume `http://localhost:3100` (hardcodeado en `dashboard/app.js`). Sin `DATABASE_URL`, la API usa SQLite en `api/data/users.db` (requiere Node.js 22+).

Usa sesiones **tmux** para procesos en segundo plano (API y servidor estático). Ejemplo: `edf-api` y `edf-dashboard`.

### Validación y tests

Comandos estándar en `README.md` y `CLAUDE.md`:

- Sintaxis: `node --check index.js` (api), `node --check app.js` (dashboard)
- Tests SQLite (**36**): `cd api && npm install && npm run test:sqlite`
- Tests PostgreSQL (32 total): requieren Postgres en marcha (`npm run test:db:prepare` desde la raíz, luego `cd api && npm test`)

### Opcional (no necesario para el flujo principal)

- **Docker Compose** (`npm run compose:up`): Postgres + API + dashboard nginx en 3100/5173/5432
- **dashboard-react** (5174) y **dashboard-vue** (5175): requieren `npm install` en cada carpeta
