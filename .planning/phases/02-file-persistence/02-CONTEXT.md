# Phase 2: File Persistence - Context

**Gathered:** 2026-05-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Esta fase añade persistencia de usuarios en `data/users.json`. La API deja de perder datos al reiniciarse. Los alumnos observan directamente el archivo, entienden qué se guarda y por qué, y practican la diferencia entre estado en memoria y estado en disco mediante misiones ejecutables.

En scope:
- Helper `loadUsers()` que lee `data/users.json` al arrancar la API.
- Helper `saveUsers()` que escribe `data/users.json` tras cada mutación CRUD.
- Manejo de ausencia del archivo (crear con semilla) y de JSON corrupto (recrear con semilla + log).
- Manejo de error de escritura (HTTP 500, revertir en memoria).
- Documentación: explicación de memoria vs persistencia con ejemplos ejecutables.
- Misión de restart: crear usuarios, reiniciar la API, comprobar que persisten.
- Misión de corrupción y restauración: romper el archivo, observar recuperación.

Fuera de scope:
- Módulo separado para persistencia — queda todo en `api/index.js`.
- Base de datos (SQLite, PostgreSQL) — deferred a fases posteriores.
- Autenticación, concurrencia o locking de archivo.
- Cambios en `dashboard/` — los contratos de respuesta no cambian.

</domain>

<decisions>
## Implementation Decisions

### Arranque y semilla

- **D-01:** Si `data/users.json` no existe al arrancar, la API lo crea automáticamente con los datos semilla (`John Doe`, `Jane Smith`, `nextId: 3`). El alumno arranca siempre con datos visibles.
- **D-02:** Si `data/users.json` existe pero contiene JSON inválido (corrupto), la API lo sobrescribe con los datos semilla, arranca normalmente y loguea un aviso en consola (e.g. `[warn] data/users.json corrupto — restaurando semilla`). El alumno no queda bloqueado.
- **D-03:** La fase incluye una misión explícita de corrupción y restauración: el alumno borra o corrompe el archivo, reinicia la API y observa la recuperación automática. Convierte el caso de error en aprendizaje documentado, como la misión de CORS.

### Momento de escritura

- **D-04:** La API escribe `data/users.json` de forma inmediata tras cada mutación (POST/PUT/DELETE) usando `fs.writeFile` con `async/await`. Sin diferido ni batch. El alumno ve exactamente dónde y cuándo ocurre la persistencia.
- **D-05:** Los helpers de persistencia `loadUsers()` y `saveUsers()` viven en `api/index.js`, no en un módulo separado. Consistente con el patrón single-file actual. El alumno ve el flujo completo sin saltar entre archivos.

### Errores de I/O

- **D-06:** Si `saveUsers()` falla al escribir el archivo, la mutación se revierte en memoria y la API responde HTTP 500 con un mensaje educativo en español: `{ "error": "No se pudo persistir el cambio. Comprueba los permisos del archivo." }`. El estado en memoria y en disco permanece consistente.
- **D-07:** Si `loadUsers()` falla al leer el archivo al arrancar (error de permisos, etc.), la API arranca con los datos semilla y loguea el error en consola. El alumno no queda bloqueado, pero el aviso es visible.

### Estructura del archivo JSON

- **D-08:** El archivo tiene formato objeto wrapper, no array plano:
  ```json
  {
    "users": [
      { "id": 1, "name": "John Doe", "email": "john@example.com" },
      { "id": 2, "name": "Jane Smith", "email": "jane@example.com" }
    ],
    "nextId": 3
  }
  ```
  Guardar `nextId` evita que los IDs se repitan tras un restart y el alumno entiende por qué se persiste el estado completo, no solo los datos visibles.
- **D-09:** El archivo se escribe con `JSON.stringify(data, null, 2)` — indentado con 2 espacios. El alumno puede abrirlo con cualquier editor y leer los datos directamente. La persistencia es observable, no una caja negra.
- **D-10:** `data/users.json` se incluye en el repositorio con los datos semilla. Quien clone el repo tiene un estado de partida funcional inmediatamente.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Direction
- `.planning/PROJECT.md` — Valor central, audiencia (principiantes), restricciones (sin dependencias innecesarias, claridad didáctica), orden de prioridades.
- `.planning/REQUIREMENTS.md` — Requisitos PERS-01..05 que esta fase debe satisfacer.
- `.planning/ROADMAP.md` — Goal, success criteria y plan split de Phase 2.

### Codebase Actual
- `api/index.js` — Entrypoint completo: estructura actual de `users`, `nextUserId`, helpers `parseUserId`, `validateUserPayload`, `findUserIndexById`, `getSortedUsers`, y todos los route handlers. Aquí viven los nuevos helpers `loadUsers`/`saveUsers`.
- `api/package.json` — Sin dependencias de I/O adicionales (Node.js `fs` es built-in). No añadir paquetes.
- `.planning/codebase/CONVENTIONS.md` — Patrones de naming, orden de funciones, estilo de código.
- `.planning/codebase/CONCERNS.md` — Deuda técnica conocida que no debe tocarse en esta fase.

### Learning Material
- `NOTEBOOK.md` — Destino obligatorio para errores reales y decisiones de esta fase.
- `docs/` — Capítulos existentes a extender con explicación de memoria vs persistencia.
- `missions/` — Misiones existentes; añadir misión de restart y misión de corrupción/restauración.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `users` (array en memoria) + `nextUserId` (counter): la fase los reemplaza con estado cargado desde archivo. Los nombres de variable pueden mantenerse.
- `getSortedUsers()`: sigue funcionando igual, opera sobre el array `users` en memoria.
- `parseUserId()`, `validateUserPayload()`, `findUserIndexById()`: sin cambios.
- Route handlers de POST/PUT/DELETE: añadir `await saveUsers()` al final de cada uno tras la mutación.

### Established Patterns
- Single-file API: toda la lógica en `api/index.js`. Los helpers de persistencia siguen este patrón.
- `async/await` en route handlers: ya en uso, `saveUsers()` se integra de forma natural.
- Guard clauses con return temprano: mantener en loadUsers/saveUsers para casos de error.
- Mensajes de error en español: `{ "error": "..." }` con texto descriptivo.

### Integration Points
- `app.listen(...)` al final de `api/index.js`: sustituir por inicialización async que llame a `loadUsers()` antes de arrancar el servidor.
- `users` y `nextUserId`: inicializados por `loadUsers()` en lugar de hardcodeados.
- Cada route handler de mutación: añadir `await saveUsers()` y manejo del error 500.

</code_context>

<specifics>
## Specific Ideas

- El alumno debe poder abrir `data/users.json` en cualquier momento mientras la API corre y ver los datos actuales.
- El feedback en consola para casos de error/warning debe ser distinguible: usar `[warn]` o `[error]` como prefijo.
- La misión de corrupción puede reutilizar la estructura de `missions/04-romper-y-arreglar-cors.md` como referencia de formato.
- El documento de documentación conceptual explicando memoria vs persistencia debe incluir un diagrama o comparación textual directa de los dos comportamientos (antes/después).

</specifics>

<deferred>
## Deferred Ideas

- Módulo separado `api/persistence.js`: introduce conceptos de módulos Node.js pero añade complejidad innecesaria en esta fase. Deferred a Phase 3 o posterior si el archivo crece.
- Versionado del archivo JSON (campo `version`): no añade valor educativo en esta fase.
- Locking de archivo para escrituras concurrentes: fuera de scope para un lab local de un solo proceso.
- Base de datos SQLite/PostgreSQL: deferred hasta que la persistencia en fichero esté bien entendida (confirmado en PROJECT.md Out of Scope).
- Data en `.gitignore`: interesante como enseñanza de "datos de runtime no van en git", pero deferred — en esta fase priorizamos que un clon funcione inmediatamente.

</deferred>

---

*Phase: 02-file-persistence*
*Context gathered: 2026-05-27*
