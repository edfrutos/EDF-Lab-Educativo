# Phase 2: File Persistence - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-27
**Phase:** 02-file-persistence
**Areas discussed:** Arranque y semilla, Momento de escritura, Errores de I/O, Estructura del archivo JSON

---

## Arranque y semilla

| Opción | Descripción | Seleccionada |
|--------|-------------|--------------|
| Crear con datos semilla | Si no existe el archivo, se crea con John Doe y Jane Smith. El alumno arranca siempre con algo visible. | ✓ |
| Crear vacío | Se crea un array vacío []. El alumno ve la tabla vacía al arrancar por primera vez. | |
| Fallar con error claro | La API no arranca y muestra un mensaje de error explicativo. | |

**User's choice:** Crear con datos semilla

---

| Opción | Descripción | Seleccionada |
|--------|-------------|--------------|
| Recrear con semilla y avisar | Sobrescribe el archivo corrupto, arranca con semilla, loguea aviso en consola. | ✓ |
| Fallar con error claro | La API no arranca y muestra el error de parse. | |
| Claude decide | La opción más sencilla que sea segura y observable. | |

**User's choice:** Recrear con semilla y avisar (si JSON corrupto)

---

| Opción | Descripción | Seleccionada |
|--------|-------------|--------------|
| Sí, misión de corrupción y restauración | Misión guiada donde el alumno borra/corrompe el archivo, reinicia y observa la recuperación. | ✓ |
| No, solo la misión de restart | El caso de corrupción queda como reto extra, no paso guiado. | |

**User's choice:** Incluir misión explícita de corrupción y restauración

---

## Momento de escritura

| Opción | Descripción | Seleccionada |
|--------|-------------|--------------|
| Inmediato, async (fs.writeFile) | Cada POST/PUT/DELETE llama a saveUsers() con async/await. Simple y legible. | ✓ |
| Inmediato, síncrono (fs.writeFileSync) | Escribe de forma bloqueante. Útil para introducir el anti-patrón bloqueante. | |

**User's choice:** Inmediato tras cada mutación, async

---

| Opción | Descripción | Seleccionada |
|--------|-------------|--------------|
| Dos funciones en api/index.js | loadUsers() y saveUsers() en el mismo archivo. Consistente con single-file. | ✓ |
| Módulo separado api/persistence.js | Extrae load/save a un archivo aparte. Introduce módulos Node.js. | |

**User's choice:** Dos funciones en api/index.js

---

## Errores de I/O

| Opción | Descripción | Seleccionada |
|--------|-------------|--------------|
| HTTP 500 con mensaje educativo | Mutación revertida en memoria, respuesta { error: '...' }. | ✓ |
| Aceptar la mutación aunque no persista | Responde 200/201 aunque no se haya escrito el archivo. | |
| Claude decide | La opción más sencilla que sea correcta y observable. | |

**User's choice:** HTTP 500 con mensaje educativo (saveUsers falla)

---

| Opción | Descripción | Seleccionada |
|--------|-------------|--------------|
| Arrancar con semilla y loguear el error | Coherente con la decisión de arranque: arranca con semilla si el archivo es ilegible. | ✓ |
| No arrancar y mostrar el error | La API falla si el archivo existe pero no se puede leer. | |

**User's choice:** Arrancar con semilla y loguear el error (loadUsers falla)

---

## Estructura del archivo JSON

| Opción | Descripción | Seleccionada |
|--------|-------------|--------------|
| Objeto con users y nextId | `{ "users": [...], "nextId": 3 }`. Guarda el contador de IDs. | ✓ |
| Solo el array de usuarios | `[{ "id": 1, ... }]`. nextId se recalcula como max(id)+1. | |

**User's choice:** Objeto wrapper con users y nextId

---

| Opción | Descripción | Seleccionada |
|--------|-------------|--------------|
| Indentado con 2 espacios | JSON.stringify(data, null, 2). Legible en cualquier editor. | ✓ |
| Minificado (una línea) | JSON.stringify(data). Más eficiente pero ilegible. | |

**User's choice:** Indentado con 2 espacios

---

| Opción | Descripción | Seleccionada |
|--------|-------------|--------------|
| Comprometido con datos semilla | El archivo inicial va en git. Clon funcional inmediato. | ✓ |
| En .gitignore | El archivo se genera al arrancar y no se trackea. | |

**User's choice:** Comprometido en git con datos semilla

---

## Claude's Discretion

- Ningún área delegada explícitamente a Claude. Todas las decisiones fueron tomadas por el usuario.

## Deferred Ideas

- Módulo separado `api/persistence.js` — introduce módulos Node.js pero añade complejidad innecesaria en esta fase.
- Versionado del archivo JSON (campo `version`) — no aporta valor educativo claro en esta fase.
- Data en `.gitignore` — interesante pedagógicamente, pero se prioriza que un clon funcione inmediatamente.
- Base de datos SQLite/PostgreSQL — deferred según PROJECT.md Out of Scope.
