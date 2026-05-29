# Phase 4: Learning Material Hardening - Pattern Map

**Mapped:** 2026-05-28
**Files analyzed:** 7 (2 new, 4 modified, 1 rename+update x2)
**Analogs found:** 7 / 7

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `docs/09-glosario.md` | doc-conceptual | reference-lookup | `docs/05-cors-explicado.md` + `docs/03-api-express.md` | role-match |
| `docs/10-tests.md` | doc-conceptual | reference-lookup | `docs/03-api-express.md` | exact |
| `docs/00-indice.md` | index | list-update | itself (existing pattern lines 19-38) | exact |
| `missions/06-restart-y-persistencia.md` | mission | rename+update | `missions/05-restart-y-persistencia.md` (lines 1, 5) | exact |
| `missions/07-corrupcion-y-restauracion.md` | mission | rename+update | `missions/06-corrupcion-y-restauracion.md` (lines 1, 5) | exact |
| `docs/08-memoria-vs-persistencia.md` | doc-conceptual | cross-ref-update | itself (lines 128, 141) | exact |
| `NOTEBOOK.md` | dev-diary | append | `NOTEBOOK.md` lines 363-414 (entrada parseUserId) | exact |

---

## Pattern Assignments

### `docs/09-glosario.md` (doc-conceptual, reference-lookup)

**Analogs combinados:** `docs/05-cors-explicado.md` (estructura sección + ejemplo) y `docs/03-api-express.md` (patrón entrada de concepto: nombre + definición breve + ejemplo ejecutable bash/js)

**Estructura de documento** (patrón de `docs/05-cors-explicado.md` líneas 1-32):
```markdown
# Título en español, sin frontmatter YAML

Párrafo introductorio de 1-3 líneas.

## Sección temática

### Concepto

[Definición 2-4 líneas]

```bash
# Ejemplo ejecutable con localhost:3100
curl http://localhost:3100/health
```
```

**Patrón de entrada de glosario** — copiar de `docs/03-api-express.md` líneas 21-30 (patrón `### Término` + bloque de ejemplo):
```markdown
### `res.json()`

Envía una respuesta JSON.

```js
res.json({ status: 'healthy' });
```
```

**Patrón de enlace cruzado al doc fuente** — añadir al final de cada entrada (nuevo, no tiene analog directo; se basa en decisión D-specifics del CONTEXT.md):
```markdown
> Ver más: [`docs/05-cors-explicado.md`](./05-cors-explicado.md)
```

**Estructura de bloques del glosario** (4 bloques según D-01):
```markdown
# Glosario

[Intro 1-2 líneas]

---

## Backend, HTTP y API

### endpoint
...

### puerto
...

---

## Frontend y navegador

### fetch()
...

---

## Persistencia y tests

### fixture
...

---

## Herramientas del entorno

### npm
...
```

**Restricciones de estilo** verificadas en todos los docs existentes:
- Sin frontmatter YAML — el archivo empieza directamente con `# Título`
- Bloques de código con triple backtick + lenguaje (`bash`, `js`, `json`)
- Ejemplos usan `localhost:3100` (la API del lab), no ejemplos genéricos
- Datos de ejemplo: `john@example.com`, `jane@example.com` (ficticios, coherentes con el lab)

---

### `docs/10-tests.md` (doc-conceptual, reference-lookup)

**Analog:** `docs/03-api-express.md` — mismo rol: doc de referencia de una parte de la arquitectura, con secciones temáticas, ejemplos bash y extractos de código real.

**Estructura de documento** (patrón de `docs/03-api-express.md` líneas 1-18):
```markdown
# Título descriptivo

Párrafo de 1-3 líneas sobre qué cubre el documento.

## Sección 1 — concepto

[Explicación 2-5 líneas]

```bash
# Comando ejecutable
npm test
```

## Sección 2 — ...
```

**Los 4 bloques del doc** (según D-05) y su fuente de código real:

**Bloque 1 — Por qué existen los tests:** redactar (no hay analog de código; sí de tono en `docs/03-api-express.md` párrafos introductorios).

**Bloque 2 — Cómo ejecutar** — fuente: `api/package.json` (scripts npm test). Patrón de bloque bash de `docs/08-memoria-vs-persistencia.md` líneas 100-111:
```bash
# Desde api/
cd api
npm test
```

**Bloque 3 — Estructura de `api/index.test.js`** — extractos reales a copiar literalmente:

Patrón setup DATA_FILE (`api/index.test.js` líneas 1-16):
```javascript
// CRÍTICO: DATA_FILE debe asignarse ANTES del require de index.js.
// Node.js cachea módulos en el primer require — si index.js se importa antes
// de setear la variable, DATA_FILE_PATH quedará con el valor por defecto.
const TEST_FILE = path.join(__dirname, 'data', 'users.test.json');
process.env.DATA_FILE = TEST_FILE;
const app = require('./index.js');
```

Patrón beforeEach/afterEach (`api/index.test.js` líneas 29-39):
```javascript
beforeEach(async () => {
  // Arrange: restaurar fixture limpio antes de cada test y recargar estado en memoria.
  // Necesario porque users[] es un array en memoria; sin startServer() el array está vacío.
  await writeFile(TEST_FILE, JSON.stringify(TEST_SEED, null, 2), 'utf8');
  await app.loadUsers();
});

afterEach(async () => {
  // Cleanup: eliminar fixture tras cada test
  await unlink(TEST_FILE).catch(() => {});
});
```

Patrón AAA completo (`api/index.test.js` líneas 74-85):
```javascript
describe('POST /users', () => {
  it('crea un usuario válido y responde 201 con el objeto creado', async () => {
    // Arrange
    const payload = { name: 'Nueva Persona', email: 'nueva@example.com' };
    // Act
    const res = await request(app).post('/users').send(payload);
    // Assert
    assert.equal(res.status, 201);
    assert.equal(res.body.name, payload.name);
    assert.ok(typeof res.body.id === 'number', 'id debe ser número');
  });
});
```

**Bloque 4 — Cómo añadir un test nuevo:** usar el patrón AAA de arriba como plantilla. El ejemplo debe ser un caso no presente en la suite actual (p. ej. `GET /about`) modelado sobre el patrón de `GET /health` (`api/index.test.js` líneas 43-53).

---

### `docs/00-indice.md` (index, list-update)

**Analog:** sí mismo — el patrón ya existe en líneas 9-38.

**Patrón de entrada en "Orden recomendado"** (líneas 9-15, copiar formato exacto):
```markdown
8. [`08-memoria-vs-persistencia.md`](./08-memoria-vs-persistencia.md) para entender cómo persisten los datos entre reinicios.
9. [`09-glosario.md`](./09-glosario.md) para consultar los términos clave del laboratorio.
10. [`10-tests.md`](./10-tests.md) para entender la suite de tests de la API.
```

**Patrón de entrada en sección "Documentos"** (líneas 19-38, copiar formato exacto):
```markdown
8. [`08-memoria-vs-persistencia.md`](./08-memoria-vs-persistencia.md)
   Explica la diferencia entre estado en memoria y estado en disco, con ejemplos ejecutables.

9. [`09-glosario.md`](./09-glosario.md)
   Define los términos clave del laboratorio organizados en cuatro bloques temáticos.

10. [`10-tests.md`](./10-tests.md)
    Explica la suite de tests de la API: cómo ejecutarla, leer el output y añadir un test nuevo.
```

**Restriccion crítica** (Pitfall 3 del RESEARCH.md): cada doc nuevo requiere DOS entradas en el índice — una en "Orden recomendado" y otra en "Documentos". No actualizar solo una de las dos secciones.

---

### `missions/06-restart-y-persistencia.md` (mission, rename+update)

**Analog:** `missions/05-restart-y-persistencia.md` — es el mismo archivo; solo cambia el número.

**Cambios mínimos requeridos** — dos ocurrencias, verificadas en el archivo fuente:

Línea 1 — título H1:
```markdown
# Misión 06: restart y persistencia
```
(era: `# Misión 05: restart y persistencia`)

El cuerpo completo del archivo (líneas 3-45) se conserva sin cambios. La acción es renombrar el archivo en disco y actualizar solo la línea 1.

**Formato canónico conservado** (verificado en `missions/01-arrancar-api.md` líneas 1-32):
```markdown
# Misión NN: título descriptivo

## Objetivo
## Pasos
## Resultado esperado
## Reto extra
```

---

### `missions/07-corrupcion-y-restauracion.md` (mission, rename+update)

**Analog:** `missions/06-corrupcion-y-restauracion.md` — mismo archivo, solo cambia el número.

**Cambios mínimos requeridos:**

Línea 1 — título H1:
```markdown
# Misión 07: corrupción y restauración
```
(era: `# Misión 06: corrupción y restauración`)

El cuerpo completo del archivo (líneas 3-46) se conserva sin cambios. La acción es renombrar el archivo en disco y actualizar solo la línea 1.

---

### `docs/08-memoria-vs-persistencia.md` (doc-conceptual, cross-ref-update)

**Analog:** sí mismo — solo se actualizan dos referencias textuales.

**Línea 128** — referencia a misión 05 → 06:
```markdown
Sigue los pasos detallados en la **Misión 06: Restart y Persistencia**.
```
(era: `**Misión 05: Restart y Persistencia**`)

**Línea 141** — referencia a misión 06 → 07:
```markdown
Sigue los pasos detallados en la **Misión 07: Corrupción y Restauración**.
```
(era: `**Misión 06: Corrupción y Restauración**`)

El resto del archivo (150 líneas) se conserva sin cambios.

**Comando de validación post-cambio** (del RESEARCH.md):
```bash
grep -n "Misión 05\|Misión 06" docs/08-memoria-vs-persistencia.md
# Resultado esperado: sin salida (ninguna referencia antigua debe quedar)
```

---

### `NOTEBOOK.md` (dev-diary, append)

**Analog:** `NOTEBOOK.md` líneas 363-414 — entrada `Fase 3 — Fix: parseUserId` (Variante B). Es la entrada más reciente y más didáctica del NOTEBOOK. Las tres entradas nuevas deben seguir exactamente esta estructura.

**Patrón Variante B completo** (líneas 363-414, estructura a replicar):
```markdown
## Fase N — [Fix|Decisión|Observación]: descripción breve

**Fecha:** YYYY-MM-DD
**Archivo:** `ruta/archivo` — descripción del símbolo o función relevante

### Error encontrado / Contexto

[Situación que generó el problema o la decisión — 2-5 líneas]

### Comportamiento incorrecto / Decisión aplicada

```[lenguaje]
// ANTES (bug o sin el cambio):
[código]

// DESPUÉS (fix o con el cambio):
[código]
```

### Aprendizaje

[Lección generalizable — 2-4 líneas]

### Tests que documentan el fix  ← solo si aplica (bugs con tests)

```bash
npm test
# descripción de los casos relevantes
```
```

**Entrada 1 — `loadUsers()` en `beforeEach`:**
- Título: `## Fase 3 — Fix: loadUsers() necesario en beforeEach cuando no hay startServer()`
- Archivo: `api/index.test.js` — función `beforeEach` (líneas 29-34) + `api/index.js` (línea 251)
- Código antes/después: ver extractos en RESEARCH.md sección "Extracto para docs/10-tests.md — patrón beforeEach"
- Fuente primaria: `api/index.test.js` líneas 29-34 y `api/index.js` línea 251

**Entrada 2 — Guard `require.main === module`:**
- Título: `## Fase 3 — Decisión: guard require.main === module en api/index.js`
- Archivo: `api/index.js` — bloque condicional final (líneas 260-265)
- Código antes/después: ver extracto completo en RESEARCH.md sección "Patrón de entrada NOTEBOOK para require.main"
- Fuente primaria: `api/index.js` líneas 249-265

**Entrada 3 — Observación Fase 2 memoria vs restart:**
- Puede usar Variante A (con fecha en heading) — es un momento pedagógico, no un bug con código antes/después
- Título: `## 2026-05-27 · Observación: los datos en memoria desaparecen al reiniciar la API`
- Fuente primaria: `docs/08-memoria-vs-persistencia.md` sección "Antes: estado en memoria" (líneas 9-30)
- No requiere bloque antes/después de código; sí un ejemplo ejecutable que demuestra el fenómeno

---

## Shared Patterns

### Patrón de documento Markdown (todos los docs nuevos)

**Fuente:** `docs/05-cors-explicado.md` líneas 1-32 y `docs/03-api-express.md` líneas 1-7
**Aplica a:** `docs/09-glosario.md`, `docs/10-tests.md`

Reglas invariables:
- Primera línea: `# Título` (sin frontmatter YAML, sin línea en blanco antes del H1)
- Párrafo introductorio inmediato tras el H1
- Bloques de código con triple backtick + lenguaje explícito (`bash`, `js`, `json`)
- Español de España en todo el contenido educativo
- Ejemplos ejecutables usan `localhost:3100` y datos ficticios del lab (`john@example.com`, `jane@example.com`)

### Patrón de misión canónico

**Fuente:** `missions/01-arrancar-api.md` líneas 1-32
**Aplica a:** Las misiones renumeradas conservan este formato; no se altera el contenido

Secciones obligatorias en orden:
1. `## Objetivo`
2. `## Pasos` (con bloques `bash` numerados)
3. `## Resultado esperado` (con bloque de output esperado)
4. `## Reto extra` (una variación para que el alumno explore por su cuenta)

### Patrón de entrada NOTEBOOK (Variante B — bugs/decisiones técnicas)

**Fuente:** `NOTEBOOK.md` líneas 363-414 (entrada `parseUserId`)
**Aplica a:** Las tres entradas nuevas de NOTEBOOK

Campos obligatorios:
- `## Fase N — [Fix|Decisión]: descripción`
- `**Fecha:** YYYY-MM-DD`
- `**Archivo:** ruta — descripción`
- `### [Contexto|Error encontrado]`
- `### [Decisión aplicada|Fix aplicado]` con bloque código antes/después
- `### Aprendizaje`
- `### Tests que documentan el fix` (solo si hay tests que lo cubren)

---

## No Analog Found

Ningún archivo de esta fase requiere un patrón sin precedente en el codebase. Todos los archivos tienen analog directo o combinado.

---

## Dependency Order (para el planner)

El orden de implementación importa por las referencias cruzadas:

1. **Primero:** Renombrar `missions/05-restart-y-persistencia.md` → `06-*` y `missions/06-corrupcion-y-restauracion.md` → `07-*` (actualizar línea 1 de cada uno)
2. **Segundo:** Actualizar `docs/08-memoria-vs-persistencia.md` líneas 128 y 141 (depende del paso 1)
3. **Tercero:** Crear `docs/09-glosario.md` (independiente)
4. **Cuarto:** Crear `docs/10-tests.md` (independiente; extrae código de `api/index.test.js`)
5. **Quinto:** Actualizar `docs/00-indice.md` con las tres entradas nuevas (depende de pasos 1-4: los archivos referenciados deben existir con el nombre correcto)
6. **Sexto:** Añadir 3 entradas a `NOTEBOOK.md` (independiente de los anteriores)

---

## Metadata

**Analog search scope:** `docs/`, `missions/`, `NOTEBOOK.md`, `api/index.js`, `api/index.test.js`
**Files scanned:** 14
**Pattern extraction date:** 2026-05-28
