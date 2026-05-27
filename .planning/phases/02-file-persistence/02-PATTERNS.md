# Phase 02: File Persistence - Pattern Map

**Mapped:** 2026-05-27
**Files analyzed:** 6 (1 modificado + 2 nuevos en docs + 2 nuevos en missions + 1 nuevo dato)
**Analogs found:** 5 / 6

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `api/index.js` | service + route | file-I/O + request-response | `api/index.js` (propio) | exact — se modifica sobre sí mismo |
| `api/data/users.json` | data | file-I/O | ninguno (archivo nuevo de datos) | no analog |
| `docs/08-memoria-vs-persistencia.md` | doc | — | `docs/03-api-express.md` | role-match |
| `missions/05-restart-y-persistencia.md` | mission | — | `missions/04-romper-y-arreglar-cors.md` | exact |
| `missions/06-corrupcion-y-restauracion.md` | mission | — | `missions/04-romper-y-arreglar-cors.md` | exact |

---

## Pattern Assignments

### `api/index.js` — modificación (service, file-I/O + request-response)

**Analog:** `api/index.js` (el propio archivo; se extiende, no se reemplaza)

**Imports pattern** — líneas 1-3 actuales, extender con:
```javascript
const { readFile, writeFile, mkdir } = require('fs/promises');
const path = require('path');
// mantener en orden: built-ins primero, luego externos (express, cors, lodash)
```
Convención del proyecto (CONVENTIONS.md §Import Organization): built-ins al principio del bloque `require`, antes de `express`/`cors`/`lodash`.

**Constantes de configuración** — insertar después de imports, antes de `app`:
```javascript
const DATA_DIR  = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'users.json');

const SEED_DATA = {
  users: [
    { id: 1, name: 'John Doe',   email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ],
  nextId: 3
};
```
Convención: UPPER_SNAKE_CASE para constantes de configuración fija (CONVENTIONS.md §Variables).

**Inicialización de estado** — sustituir las líneas 7-11 actuales:
```javascript
// ANTES (líneas 7-11):
let users = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
];
let nextUserId = 3;

// DESPUÉS: inicialización vacía; loadUsers() asignará los valores
let users      = [];
let nextUserId = 0;
```

**Core helper: loadUsers()** — insertar en la sección de helpers, antes de los routes:
```javascript
async function saveUsersData(data) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

async function loadUsers() {
  try {
    const raw  = await readFile(DATA_FILE, 'utf8');
    const data = JSON.parse(raw);
    users      = data.users;
    nextUserId = data.nextId;
  } catch (err) {
    if (err instanceof SyntaxError) {
      console.warn('[warn] data/users.json corrupto — restaurando semilla');
      await saveUsersData(SEED_DATA);
    } else if (err.code === 'ENOENT') {
      console.info('[info] data/users.json no encontrado — creando con semilla');
      await saveUsersData(SEED_DATA);
    } else {
      console.error('[error] No se pudo leer data/users.json:', err.message);
    }
    users      = [...SEED_DATA.users];
    nextUserId = SEED_DATA.nextId;
  }
}

async function saveUsers() {
  await saveUsersData({ users, nextId: nextUserId });
}
```
Patrón del proyecto: guard clauses + return temprano para errores, mensajes en español (CONVENTIONS.md §Error Handling). Prefijos `[warn]`/`[info]`/`[error]` añadidos para distinguir severidad (CONTEXT.md §Specific Ideas).

**Core pattern: mutación con saveUsers() + rollback** — cada route handler de mutación:

POST (analog: líneas 84-101 actuales):
```javascript
app.post('/users', async (req, res) => {
  const validationError = validateUserPayload(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const user = {
    id: nextUserId,
    name: req.body.name.trim(),
    email: req.body.email.trim()
  };
  nextUserId += 1;
  users.push(user);

  try {
    await saveUsers();
  } catch (err) {
    users.pop();
    nextUserId -= 1;
    console.error('[error] saveUsers() falló en POST /users:', err.message);
    return res.status(500).json({ error: 'No se pudo persistir el cambio. Comprueba los permisos del archivo.' });
  }

  res.status(201).json(user);
});
```

PUT (analog: líneas 103-129 actuales) — guardar copia antes de sobrescribir:
```javascript
app.put('/users/:id', async (req, res) => {
  // ... (validaciones sin cambio) ...
  const previousUser = { ...users[userIndex] };
  users[userIndex] = { id: userId, name: req.body.name.trim(), email: req.body.email.trim() };

  try {
    await saveUsers();
  } catch (err) {
    users[userIndex] = previousUser;
    console.error('[error] saveUsers() falló en PUT /users/:id:', err.message);
    return res.status(500).json({ error: 'No se pudo persistir el cambio. Comprueba los permisos del archivo.' });
  }

  res.json(users[userIndex]);
});
```

DELETE (analog: líneas 131-150 actuales) — guardar usuario e índice antes de splice:
```javascript
app.delete('/users/:id', async (req, res) => {
  // ... (validaciones sin cambio) ...
  const [deletedUser] = users.splice(userIndex, 1);

  try {
    await saveUsers();
  } catch (err) {
    users.splice(userIndex, 0, deletedUser);
    console.error('[error] saveUsers() falló en DELETE /users/:id:', err.message);
    return res.status(500).json({ error: 'No se pudo persistir el cambio. Comprueba los permisos del archivo.' });
  }

  res.json({ message: 'Usuario eliminado correctamente.', user: deletedUser });
});
```

**Arranque asíncrono** — sustituir líneas 181-185 actuales:
```javascript
// ANTES (líneas 181-185):
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
module.exports = app;

// DESPUÉS:
module.exports = app;  // DEBE ir antes de startServer() para que futuros tests importen app sin ejecutar el servidor

async function startServer() {
  await loadUsers();
  app.listen(PORT, () => {
    console.log(`Servidor arrancado en http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[error] No se pudo arrancar el servidor:', err);
  process.exit(1);
});
```
Atención: `module.exports = app` debe permanecer ANTES de `startServer()` (RESEARCH.md Pitfall 4).

---

### `api/data/users.json` — nuevo (data, file-I/O)

**Analog:** ninguno en el proyecto.

**Contenido semilla** (D-08, D-09, D-10):
```json
{
  "users": [
    { "id": 1, "name": "John Doe",   "email": "john@example.com" },
    { "id": 2, "name": "Jane Smith", "email": "jane@example.com" }
  ],
  "nextId": 3
}
```
Indentado con 2 espacios (coherente con `JSON.stringify(data, null, 2)` y la convención de 2 espacios del proyecto). Incluir en git con la semilla (D-10).

---

### `docs/08-memoria-vs-persistencia.md` — nuevo (doc)

**Analog:** `docs/03-api-express.md`

**Estructura del analog** (patrón observado en docs/03-api-express.md):
```markdown
# <Título del concepto>

<Párrafo de contexto breve>

## <Sección conceptual 1>

### `<Símbolo o concepto>`

<Explicación corta>

## Ejemplos

```bash / js
<código ejecutable>
```
```

**Patrón de heading:** título H1 con el concepto, secciones H2 para bloques temáticos, H3 para elementos individuales. Sin frontmatter YAML. Sin numeración en el nombre del archivo cuando es conceptual (convención observada: `03-api-express.md`, no `03-api-express-v2.md`).

**Contenido mínimo requerido para este archivo:**
- Sección "Antes: estado en memoria" — describe el comportamiento actual con diagrama textual
- Sección "Después: estado en disco" — describe el nuevo comportamiento con diagrama textual
- Comparación directa antes/después observable
- Ejemplos ejecutables: curl + cat `api/data/users.json` + restart + curl de nuevo
- Referencia a misiones 05 y 06

---

### `missions/05-restart-y-persistencia.md` — nuevo (mission)

**Analog:** `missions/04-romper-y-arreglar-cors.md`

**Estructura exacta del analog** (lines 1-32):
```markdown
# Misión 04: romper y arreglar CORS

## Objetivo

<Una frase que describe qué se va a aprender observando.>

## Pasos

1. <Acción concreta>
2. <Acción concreta>
...

## Resultado esperado

<Qué debe ver el alumno si todo ha ido bien.>

## Reto extra

<Variación opcional para alumnos que quieran ir más lejos.>
```

**Patrón de naming del archivo:** `NN-kebab-case-del-titulo.md` — el número es secuencial respecto a las misiones existentes (01-04), por tanto este es `05-restart-y-persistencia.md`.

**Contenido mínimo requerido para este archivo:**
- Objetivo: verificar que los usuarios sobreviven un restart
- Pasos: crear usuario via curl → ver `api/data/users.json` → Ctrl+C → `PORT=3100 npm start` → curl `/users`
- Resultado esperado: el usuario creado sigue presente
- Reto extra: crear 3 usuarios, reiniciar, comprobar que los 3 persisten

---

### `missions/06-corrupcion-y-restauracion.md` — nuevo (mission)

**Analog:** `missions/04-romper-y-arreglar-cors.md` (mismo formato exacto)

**Patrón de naming:** `06-corrupcion-y-restauracion.md`

**Contenido mínimo requerido para este archivo:**
- Objetivo: observar la recuperación automática ante un archivo corrupto
- Pasos: parar API → editar `api/data/users.json` con texto inválido → arrancar API → observar `[warn]` en consola → curl `/users`
- Resultado esperado: la API arranca con la semilla y loguea el aviso
- Reto extra: borrar el archivo completamente y observar el mensaje `[info]`

---

## Shared Patterns

### Orden de secciones en `api/index.js`

**Source:** `api/index.js` líneas 1-185 + CONVENTIONS.md §Import Organization
**Aplica a:** `api/index.js` modificado

Orden obligatorio tras la refactorización:
```
1. requires (built-ins: fs/promises, path — luego externos: express, cors, lodash)
2. Constantes de configuración (PORT, DATA_DIR, DATA_FILE, SEED_DATA)
3. Inicialización de estado (let users, let nextUserId)
4. Middleware (app.use)
5. Helpers síncronos (getSortedUsers, parseUserId, findUserIndexById, validateUserPayload)
6. Helpers asíncronos de I/O (saveUsersData, loadUsers, saveUsers)
7. Routes
8. Error middleware
9. module.exports = app
10. startServer() + startServer().catch(...)
```

### Mensajes de error JSON en español

**Source:** `api/index.js` líneas 70-72, 107-109, 118-120 (guard clauses existentes)
**Aplica a:** todos los `res.status(500)` nuevos en POST, PUT, DELETE

Formato establecido:
```javascript
res.status(400).json({ error: 'El parámetro ":id" debe ser un número entero.' });
res.status(404).json({ error: 'Usuario no encontrado.' });
// Nuevo 500:
res.status(500).json({ error: 'No se pudo persistir el cambio. Comprueba los permisos del archivo.' });
```
Una sola clave `"error"`, texto descriptivo en español, punto final.

### Guard clauses con return temprano

**Source:** `api/index.js` líneas 69-82 (GET /users/:id)
**Aplica a:** todos los route handlers de mutación (ya existente, confirmar que se mantiene)

```javascript
if (userId === null) {
  return res.status(400).json({ error: 'El parámetro ":id" debe ser un número entero.' });
}
// ... siguiente validación ...
if (userIndex === -1) {
  return res.status(404).json({ error: 'Usuario no encontrado.' });
}
// happy path
```

### Logging con prefijo de severidad

**Source:** decisión nueva (CONTEXT.md §Specific Ideas, RESEARCH.md Pattern 1)
**Aplica a:** `loadUsers()`, `saveUsers()` en `api/index.js`

```javascript
console.info('[info] data/users.json no encontrado — creando con semilla');
console.warn('[warn] data/users.json corrupto — restaurando semilla');
console.error('[error] No se pudo leer data/users.json:', err.message);
console.error('[error] saveUsers() falló en POST /users:', err.message);
```
Prefijos: `[info]` informativo, `[warn]` recuperable, `[error]` acción requerida.

### Formato de misión educativa

**Source:** `missions/04-romper-y-arreglar-cors.md` (formato completo)
**Aplica a:** `missions/05-restart-y-persistencia.md`, `missions/06-corrupcion-y-restauracion.md`

Estructura fija: H1 título → H2 Objetivo → H2 Pasos (lista numerada) → H2 Resultado esperado → H2 Reto extra.
Sin frontmatter, sin badges, sin tabla de contenidos. Tono imperativo en los pasos.

### Formato de doc conceptual

**Source:** `docs/03-api-express.md` (estructura observada)
**Aplica a:** `docs/08-memoria-vs-persistencia.md`

H1 concepto → H2 secciones temáticas → H3 elementos individuales → bloques de código bash/js ejecutables. Sin frontmatter YAML.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|---|---|---|---|
| `api/data/users.json` | data | file-I/O | No hay archivos de datos persistidos en el proyecto; es el primero |

---

## Critical Pitfalls to Surface in Plans

Extraídos de RESEARCH.md para que el planificador los incluya en los pasos de verificación:

1. **`module.exports = app` antes de `startServer()`** — si se desplaza después, los tests de Fase 3 no podrán importar `app`.
2. **`await` obligatorio en `saveUsers()`** — omitirlo hace que el archivo no se escriba antes de responder al cliente.
3. **Copia de semilla por valor** — usar `[...SEED_DATA.users]`, no `SEED_DATA.users` directamente (referencia compartida).
4. **Rollback de DELETE con `splice(index, 0, deletedUser)`** — `push` al final rompe el orden.
5. **`path.join(__dirname, 'data', 'users.json')`** — nunca ruta relativa `'./data/users.json'`.
6. **`try/catch` explícito en cada `await saveUsers()`** — Express 4 no captura promesas rechazadas en handlers async.

---

## Metadata

**Analog search scope:** `api/`, `docs/`, `missions/`
**Files scanned:** `api/index.js`, `api/package.json`, `docs/03-api-express.md`, `missions/04-romper-y-arreglar-cors.md`, `.planning/codebase/CONVENTIONS.md`, `.planning/codebase/CONCERNS.md`
**Pattern extraction date:** 2026-05-27
