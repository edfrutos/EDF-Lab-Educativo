# Phase 4: Learning Material Hardening - Research

**Researched:** 2026-05-28
**Domain:** Educational documentation — Markdown authoring, content synchronization, mission/doc format conventions
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Glosario con 4 bloques: Backend + HTTP + API, Frontend + browser, Persistencia + tests, Herramientas del entorno.
- **D-02:** Formato de cada entrada: definición breve (2-4 líneas) + 1 ejemplo ejecutable (bloque de código o comando corto).
- **D-03:** Ubicación: `docs/09-glosario.md`. Referenciado desde `docs/00-indice.md` como último capítulo.
- **D-04:** Doc de tests en `docs/10-tests.md`, capítulo independiente, referenciado desde `docs/00-indice.md` después del glosario.
- **D-05:** Contenido de `docs/10-tests.md`: 4 bloques — (1) por qué existen los tests, (2) cómo ejecutar y leer el output, (3) estructura de `api/index.test.js`, (4) cómo añadir un test nuevo.
- **D-06:** Renumeración: `missions/05-restart-y-persistencia.md` → `06-restart-y-persistencia.md`; `missions/06-corrupcion-y-restauracion.md` → `07-corrupcion-y-restauracion.md`. Títulos internos (`# Misión 05:`) también se actualizan.
- **D-07:** Auditoría de `docs/00-indice.md`: añadir `08-memoria-vs-persistencia.md`, `09-glosario.md`, `10-tests.md` al orden de lectura; verificar que todos los paths apuntan a archivos existentes.
- **D-08:** Tres entradas nuevas en NOTEBOOK: (1) `loadUsers()` en `beforeEach`, (2) guard `require.main`, (3) observación Fase 2 memoria vs restart.
- **D-09:** Criterio documentado para futuras entradas NOTEBOOK: errores reales + decisiones no obvias van en NOTEBOOK; conceptos enseñables desde cero van en `docs/`.

### Claude's Discretion

- Número exacto de términos en el glosario (priorizar los que aparecen en el laboratorio).
- Longitud exacta de los ejemplos ejecutables (3-5 líneas máximo).
- Orden interno de las entradas del glosario (alfabético dentro de cada bloque o por orden de aparición en el lab).
- Contenido exacto de las entradas nuevas de NOTEBOOK (siguiendo el patrón existente).

### Deferred Ideas (OUT OF SCOPE)

- Nueva misión de tests desde cero (scaffolding insuficiente para esta fase).
- Actualización de root `README.md` (posiblemente abordable en 04-02, pero diferible si el planner lo considera fuera de scope).
- Cambios en código de `api/` o `dashboard/`.
- Doc de OpenAPI/Docker — Fase 5.
- Reescritura de docs conceptuales ya existentes (solo auditoría de sincronización).

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DOCS-01 | A beginner-friendly glossary defines core concepts used by the lab. | Estado del filesystem auditado: `docs/09-glosario.md` no existe aún — debe crearse. Términos clave identificados desde `api/index.js`, `index.test.js` y docs existentes. |
| DOCS-02 | Existing docs remain synchronized with actual paths, ports, endpoints, and commands. | Auditoría completada: `docs/00-indice.md` no menciona `08-memoria-vs-persistencia.md`; misiones 05/06 tienen conflicto de numeración; referencias a misiones en `08-memoria-vs-persistencia.md` apuntarán a nuevos números tras renumeración. |
| DOCS-03 | Every new learner-facing concept includes an executable example. | Patrón establecido en docs existentes (bloques `bash` con comandos reales). Aplicar en glosario y doc de tests. |
| DOCS-04 | Every new mission includes objective, steps, expected result, and extra challenge. | Formato canónico verificado en `missions/01-arrancar-api.md`. Las misiones renumeradas ya cumplen el formato; solo cambio de número. |
| DOCS-05 | Relevant real errors and fixes are recorded in `NOTEBOOK.md`. | Tres entradas identificadas con fuente primaria en `03-CONTEXT.md` y `api/index.js`/`api/index.test.js`. Formato de entrada existente verificado. |

</phase_requirements>

---

## Summary

La Fase 4 es una fase de documentación pura: cero cambios de código, todo el trabajo reside en crear y actualizar archivos Markdown. El estado real del filesystem muestra una deuda documental concreta y acotada: el índice `docs/00-indice.md` está desactualizado (no incluye `08-memoria-vs-persistencia.md`), hay un conflicto de numeración en `missions/` (dos archivos con prefijo `05-`), faltan dos documentos nuevos (`09-glosario.md` y `10-tests.md`), y `NOTEBOOK.md` no recoge tres decisiones técnicas no triviales de Fases 2 y 3.

Los activos de referencia están en excelente estado: el formato de misión canónico está en `missions/01-arrancar-api.md`, el patrón de entradas NOTEBOOK está bien establecido con múltiples ejemplos, y los docs existentes proporcionan modelos directos de estilo (Markdown puro, sin frontmatter, bloques de código ejecutables, ejemplos con la API del laboratorio). El código fuente de `api/index.js` e `api/index.test.js` contiene los extractos reales que necesita `docs/10-tests.md` — no hay código que inventar.

La fase se divide limpiamente en dos planes: plan 04-01 (crear glosario + conectar al índice) y plan 04-02 (auditar sincronización: renumeración de misiones, actualización de índice, nuevas entradas NOTEBOOK, y nuevo doc de tests). El orden importa: el índice debe actualizarse en el plan que crea los nuevos documentos, y las referencias cruzadas (como las que `08-memoria-vs-persistencia.md` hace a las misiones con nombre) deben actualizarse junto con la renumeración.

**Recomendación principal:** Ejecutar los dos planes en secuencia. Plan 04-01 crea `09-glosario.md` y lo conecta al índice; Plan 04-02 crea `10-tests.md`, renumera las misiones, completa el índice, y añade las entradas NOTEBOOK.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Glosario de conceptos (DOCS-01) | Documentación estática (`docs/`) | — | Archivo Markdown nuevo, sin dependencias de runtime |
| Doc de tests (DOCS-02, DOCS-03) | Documentación estática (`docs/`) | Código fuente (`api/index.test.js`) | El doc extrae extractos reales del test; no genera código nuevo |
| Sincronización del índice (DOCS-02) | Documentación estática (`docs/`) | — | Actualización de `00-indice.md` para reflejar estado real del filesystem |
| Renumeración de misiones (DOCS-04) | Material de misiones (`missions/`) | Documentación cruzada (`docs/`) | Afecta a `08-memoria-vs-persistencia.md` que referencia las misiones por número |
| Entradas NOTEBOOK (DOCS-05) | NOTEBOOK.md | Contexto de fases anteriores | Entradas históricas basadas en decisiones documentadas en `03-CONTEXT.md` |

---

## Standard Stack

### Core

Esta fase no requiere librerías adicionales. Todo el trabajo es edición de archivos Markdown.

| Herramienta | Versión | Propósito | Por qué es estándar |
|-------------|---------|-----------|---------------------|
| Markdown puro | — | Formato de todos los documentos | Patrón establecido en el proyecto; sin frontmatter YAML |
| Bash/curl | — | Ejemplos ejecutables en glosario y doc de tests | Los docs existentes usan este patrón consistentemente |

### Restricciones de stack confirmadas

- Sin frontmatter YAML — todos los docs del proyecto empiezan con `# Título` directamente. [VERIFIED: lectura de docs/01-08]
- Sin dependencias nuevas — esta fase es solo Markdown. [VERIFIED: CONTEXT.md scope]
- Bloques de código con triple backtick + lenguaje (`bash`, `json`, `javascript`). [VERIFIED: patrón en docs existentes]
- Español de España para todo el contenido educativo. [VERIFIED: docs existentes y CLAUDE.md]

---

## Architecture Patterns

### Estructura actual del material educativo

```
docs/
├── 00-indice.md          # Índice central — ACTUALIZAR en esta fase
├── 01-arquitectura.md    # Existente — OK
├── 02-puesta-en-marcha.md
├── 03-api-express.md
├── 04-dashboard-fetch.md
├── 05-cors-explicado.md
├── 06-debugging.md
├── 07-retos.md
├── 08-memoria-vs-persistencia.md  # Existente, no indexado — AÑADIR al índice
├── 09-glosario.md        # CREAR en plan 04-01
└── 10-tests.md           # CREAR en plan 04-02

missions/
├── 01-arrancar-api.md    # Formato canónico de referencia
├── 02-arrancar-dashboard.md
├── 03-consumir-json.md
├── 04-romper-y-arreglar-cors.md
├── 05-mejorar-dashboard.md           # Conserva numeración 05
├── 05-restart-y-persistencia.md      # RENOMBRAR → 06-restart-y-persistencia.md
└── 06-corrupcion-y-restauracion.md   # RENOMBRAR → 07-corrupcion-y-restauracion.md

NOTEBOOK.md                           # AÑADIR 3 entradas nuevas
```

### Pattern 1: Formato canónico de misión

Verificado en `missions/01-arrancar-api.md` y cumplido por todas las misiones existentes.

```markdown
# Misión NN: título descriptivo

## Objetivo

[1-3 frases que describen qué va a practicar el alumno]

## Pasos

[Numerados, con bloques de código bash para cada comando]

## Resultado esperado

[Qué debe ver el alumno si todo funciona — preferiblemente un bloque de código/JSON]

## Reto extra (opcional)

[Una variación o extensión que el alumno puede intentar por su cuenta]
```

**Aplicación en Fase 4:** Las misiones 05-restart y 06-corrupcion ya cumplen este formato. Al renombrar solo se actualiza el número en el encabezado H1 (`# Misión 05:` → `# Misión 06:` y `# Misión 06:` → `# Misión 07:`).

### Pattern 2: Formato de entrada NOTEBOOK

Verificado en múltiples entradas existentes en `NOTEBOOK.md`. Dos variantes presentes:

**Variante A — con fecha en heading:**
```markdown
## YYYY-MM-DD · Título descriptivo

### Contexto

[Situación que generó el problema o la decisión]

### Decisión/Error

[Qué se hizo, qué falló, código antes/después si aplica]

### Aprendizaje

[La lección generalizable, con comandos de validación si existen]
```

**Variante B — sin fecha explícita (para bugs puntuales):**
```markdown
## Fase N — Fix: descripción del bug

**Fecha:** YYYY-MM-DD
**Archivo:** ruta y nombre de función

### Error encontrado

### Comportamiento incorrecto / Fix aplicado

### Aprendizaje

### Tests que documentan el fix
```

**Recomendación:** Las tres entradas nuevas de Fase 4 son bugs/decisiones de Fase 3, así que encajan mejor en la Variante B (bug con código antes/después). La entrada sobre la observación de memoria vs restart puede usar Variante A.

### Pattern 3: Formato de entrada de glosario

No existe aún. Se crea en esta fase. Decisión D-02 establece el contrato:

```markdown
### Término

[Definición breve, 2-4 líneas, sin jerga innecesaria]

```bash
# Ejemplo ejecutable con la API del laboratorio
curl http://localhost:3100/health
```
```

El glosario debe enlazar de vuelta al doc donde el término aparece en contexto (decisión del CONTEXT.md `<specifics>`). Ejemplo: `> Ver más: [docs/05-cors-explicado.md](./05-cors-explicado.md)`

### Pattern 4: Formato de entrada en `docs/00-indice.md`

```markdown
N. [`NN-nombre-del-doc.md`](./NN-nombre-del-doc.md)
   Descripción breve de una o dos líneas de lo que explica el documento.
```

**Ejemplo real (del índice actual):**
```markdown
7. [`07-retos.md`](./07-retos.md)
   Propone ejercicios para extender el laboratorio paso a paso.
```

### Anti-Patterns a evitar

- **Frontmatter YAML:** Ningún doc del proyecto lo usa. No añadir `---\ntitle: ...\n---` al inicio.
- **Rutas absolutas en misiones nuevas:** Las misiones 01, 02 y 05-mejorar-dashboard tienen rutas absolutas (`/Users/edefrutos/Desktop/...`). Es un patrón existente — no corregir en esta fase (está fuera de scope), pero no reproducir en contenido nuevo.
- **Código inventado en docs/10-tests.md:** Extraer extractos reales de `api/index.test.js`, no parafrasear. La suite real está disponible y es didáctica tal como está.
- **Entradas NOTEBOOK sin código:** Las entradas de `parseUserId` demuestran que el valor pedagógico aumenta mucho con bloques antes/después. Aplicar a las entradas nuevas de `require.main` y `loadUsers()`.
- **Glosario enciclopédico:** Las definiciones deben ser de 2-4 líneas, no párrafos. La brevedad es didáctica.

---

## Don't Hand-Roll

| Problema | No construir | Usar en su lugar | Por qué |
|----------|-------------|------------------|---------|
| Ejemplos de código en `10-tests.md` | Código nuevo o parafraseo | Extractos directos de `api/index.test.js` | El archivo real ya tiene comentarios AAA; inventar código introduce riesgo de desincronización |
| Contenido de entradas NOTEBOOK | Reconstrucción de memoria | Contexto documentado en `03-CONTEXT.md` y `02-CONTEXT.md` | Las decisiones están ya documentadas con el razonamiento original |
| Descripción de comandos de test | Explicación genérica de testing | Comandos reales de `api/package.json` (`npm test`, `--test-force-exit`) | El alumno debe poder copiar y ejecutar exactamente lo que aparece en el doc |

---

## Hallazgos de Auditoría (estado actual verificado)

### `docs/00-indice.md` — deuda confirmada

El índice actual lista 7 documentos (01-07). El archivo `docs/08-memoria-vs-persistencia.md` existe en disco desde Fase 2 pero NO aparece en el índice. [VERIFIED: lectura de `docs/00-indice.md` y `ls docs/`]

**Cambios necesarios:**
1. Añadir entrada para `08-memoria-vs-persistencia.md` en el orden recomendado (entre `07-retos.md` y el glosario).
2. Añadir entrada para `09-glosario.md` al final del orden recomendado.
3. Añadir entrada para `10-tests.md` después del glosario.
4. Añadir las tres entradas en la sección "Documentos" con su descripción.

**Verificación de paths existentes:** Los 7 paths listados actualmente apuntan a archivos que existen en disco. [VERIFIED: `ls docs/`] No hay links rotos en el índice actual.

### `missions/` — conflicto de numeración confirmado

| Archivo en disco | Título interno actual | Acción requerida |
|------------------|-----------------------|------------------|
| `05-mejorar-dashboard.md` | `# Misión 05: mejorar el dashboard` | Sin cambios — conserva 05 |
| `05-restart-y-persistencia.md` | `# Misión 05: restart y persistencia` | Renombrar archivo a `06-restart-y-persistencia.md` + actualizar título a `# Misión 06:` |
| `06-corrupcion-y-restauracion.md` | `# Misión 06: corrupción y restauración` | Renombrar archivo a `07-corrupcion-y-restauracion.md` + actualizar título a `# Misión 07:` |

**Efecto secundario:** `docs/08-memoria-vs-persistencia.md` líneas 128 y 141 referencian estas misiones por texto libre:
- `**Misión 05: Restart y Persistencia**` → debe actualizarse a `**Misión 06: Restart y Persistencia**`
- `**Misión 06: Corrupción y Restauración**` → debe actualizarse a `**Misión 07: Corrupción y Restauración**`

[VERIFIED: grep en `docs/08-memoria-vs-persistencia.md`]

### `NOTEBOOK.md` — tres entradas identificadas

Entradas a añadir, con fuente primaria verificada:

| Entrada | Fuente primaria | Tipo |
|---------|----------------|------|
| `loadUsers()` en `beforeEach` — por qué es necesario cuando no se llama `startServer()` | `api/index.test.js` líneas 29-34 + `api/index.js` líneas 253-258 | Bug con código antes/después |
| Guard `require.main === module` — diferencia ejecutar vs importar | `api/index.js` líneas 260-264 + `03-CONTEXT.md` D-01 implícito | Decisión de diseño |
| Observación Fase 2 — datos en memoria vs reinicio | `02-CONTEXT.md` (experimento motivador), `docs/08-memoria-vs-persistencia.md` sección "Antes" | Momento pedagógico |

Formato de las entradas existentes más similares (Variante B): la entrada `parseUserId` (última del NOTEBOOK actual) tiene exactamente la estructura adecuada con fecha, archivo, código antes/después, y sección "Tests que documentan el fix". Reproducir ese patrón para la entrada de `loadUsers()`. [VERIFIED: NOTEBOOK.md líneas 363-414]

### `docs/10-tests.md` — extractos disponibles

Los cuatro bloques del doc de tests (D-05) tienen fuente directa en el código:

| Bloque | Fuente |
|--------|--------|
| Por qué existen los tests | Introducción conceptual — redactar |
| Cómo ejecutar (`npm test`, output, `--test-force-exit`) | `api/package.json` scripts + output real de la suite |
| Estructura de `index.test.js` (AAA, `describe`/`it`, `beforeEach`/`afterEach`) | `api/index.test.js` — extractar comentarios y bloques reales |
| Cómo añadir un test nuevo | Patrón de `api/index.test.js` existente — crear ejemplo mínimo basado en suite real |

**Extracto crítico para el doc** — patrón `DATA_FILE` antes de `require` (líneas 1-16 de `index.test.js`):
```javascript
// CRÍTICO: DATA_FILE debe asignarse ANTES del require de index.js.
// Node.js cachea módulos en el primer require — si index.js se importa antes
// de setear la variable, DATA_FILE_PATH quedará con el valor por defecto.
const TEST_FILE = path.join(__dirname, 'data', 'users.test.json');
process.env.DATA_FILE = TEST_FILE;
const app = require('./index.js');
```
Este bloque debe aparecer en el doc de tests porque ilustra un concepto no obvio para principiantes. [VERIFIED: `api/index.test.js`]

### Rutas absolutas en misiones (observación de auditoría)

Las misiones 01, 02 y 05-mejorar-dashboard contienen rutas absolutas hardcodeadas a `/Users/edefrutos/Desktop/EDF-Lab-Educativo/`. Esto es un problema de portabilidad, pero está fuera de scope de Fase 4 (CONTEXT.md `<domain>` lo excluye explícitamente). Se documenta para Fase 5.

---

## Common Pitfalls

### Pitfall 1: Renombrar archivos sin actualizar todas las referencias cruzadas

**Qué sale mal:** Se renombra `05-restart-y-persistencia.md` a `06-restart-y-persistencia.md` pero no se actualiza la referencia en `docs/08-memoria-vs-persistencia.md` línea 128 que menciona "Misión 05: Restart y Persistencia".
**Por qué ocurre:** El renombrado de archivo es obvio; las referencias textuales requieren grep.
**Cómo evitar:** Al renombrar, ejecutar `grep -rn "Misión 05\|Misión 06" docs/ missions/` para encontrar todas las ocurrencias.
**Señales de alerta:** Si `docs/08-memoria-vs-persistencia.md` sigue diciendo "Misión 05: Restart y Persistencia" después del renombrado.

### Pitfall 2: Glosario desacoplado del laboratorio

**Qué sale mal:** Las definiciones describen conceptos genéricos de HTTP/Node.js pero los ejemplos ejecutables no usan la API del laboratorio (`localhost:3100`).
**Por qué ocurre:** Tendencia a copiar ejemplos canónicos de la web.
**Cómo evitar:** Cada ejemplo del glosario debe usar `curl http://localhost:3100/...` o código de `api/index.js`/`dashboard/app.js`. Los docs existentes tienen el patrón correcto.

### Pitfall 3: Actualizar el índice parcialmente

**Qué sale mal:** Se añade `08-memoria-vs-persistencia.md` a la sección "Orden recomendado" pero no a la sección "Documentos" (o viceversa).
**Por qué ocurre:** `docs/00-indice.md` tiene dos listas separadas: la sección de orden recomendado con numeración y la sección "Documentos" con descripción.
**Cómo evitar:** Cada documento nuevo requiere dos entradas en el índice: una en el orden recomendado y otra en la sección Documentos con su descripción breve.

### Pitfall 4: Entradas NOTEBOOK sin estructura reconocible

**Qué sale mal:** La entrada nueva no sigue el patrón establecido y resulta difícil de escanear para el lector.
**Por qué ocurre:** El NOTEBOOK tiene variantes de formato mezcladas (algunas con fecha en heading, algunas sin). Inconsistencia acumulada.
**Cómo evitar:** Para las tres entradas nuevas de Fase 4, usar explícitamente la Variante B (con `**Fecha:**`, `**Archivo:**`, código antes/después). Es la más reciente y la más didáctica para bugs técnicos.

### Pitfall 5: `docs/10-tests.md` documenta tests que no existen o difieren del código real

**Qué sale mal:** El doc muestra un ejemplo de test que no coincide exactamente con `api/index.test.js`.
**Por qué ocurre:** Se escribe el doc de memoria en lugar de extraer el código real.
**Cómo evitar:** Todos los extractos de código en `docs/10-tests.md` deben copiarse directamente de `api/index.test.js` con sus comentarios originales.

---

## Code Examples

### Extracto para `docs/10-tests.md` — patrón beforeEach con loadUsers()

```javascript
// Fuente: api/index.test.js líneas 29-34
beforeEach(async () => {
  // Arrange: restaurar fixture limpio antes de cada test y recargar estado en memoria.
  // Necesario porque users[] es un array en memoria; sin startServer() el array está vacío.
  await writeFile(TEST_FILE, JSON.stringify(TEST_SEED, null, 2), 'utf8');
  await app.loadUsers();
});
```

### Extracto para `docs/10-tests.md` — patrón AAA completo

```javascript
// Fuente: api/index.test.js líneas 74-85
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

### Patrón de entrada NOTEBOOK para `require.main`

```markdown
## Fase 3 — Decisión: guard `require.main === module` en `api/index.js`

**Fecha:** 2026-05-28
**Archivo:** `api/index.js` — función `startServer()` y bloque condicional final

### Contexto

Los tests importan `api/index.js` con `require('./index.js')`.
Si el servidor arrancara al ser importado, el test runner abriría un puerto real
y `loadUsers()` leería del archivo de producción en lugar del fixture de tests.

### Decisión aplicada

```javascript
// Sin el guard: el servidor arranca siempre que alguien haga require('./index.js')
// Con el guard: el servidor solo arranca cuando el archivo se ejecuta directamente
if (require.main === module) {
  startServer().catch((err) => {
    console.error('[error] No se pudo arrancar el servidor:', err);
    process.exit(1);
  });
}
```

### Aprendizaje

`require.main === module` es `true` cuando Node.js ejecuta el archivo directamente
(`node index.js`), y `false` cuando otro módulo lo importa (`require('./index.js')`).
Este patrón es habitual en cualquier módulo que sea tanto una librería como un programa.
```

### Comando de validación tras renumeración

```bash
# Desde la raíz del proyecto
# Verificar que no quedan referencias a los números antiguos
grep -rn "Misión 05.*restart\|Misión 06.*corrupcion" docs/ missions/

# Verificar que los archivos nuevos existen
ls missions/06-restart-y-persistencia.md missions/07-corrupcion-y-restauracion.md

# Verificar que el archivo antiguo ya no existe
ls missions/05-restart-y-persistencia.md 2>/dev/null && echo "ERROR: archivo antiguo no eliminado"
```

---

## Runtime State Inventory

Esta fase es documentación pura. No hay bases de datos, servicios de runtime, variables de entorno ni artefactos construidos involucrados. Los únicos cambios son en archivos Markdown y en el sistema de archivos del repositorio git.

| Categoría | Elementos | Acción requerida |
|-----------|-----------|-----------------|
| Datos almacenados | Ninguno — fase solo Markdown | Ninguna |
| Config de servicio live | Ninguno | Ninguna |
| Estado registrado en el SO | Ninguno | Ninguna |
| Secrets / env vars | Ninguno | Ninguna |
| Artefactos de build | Ninguno — no hay compilación | Ninguna |

---

## Environment Availability

Esta fase es edición de archivos Markdown. Las únicas herramientas requeridas son el editor de texto y git (disponibles). No hay dependencias externas de runtime.

| Dependencia | Requerida por | Disponible | Versión | Fallback |
|-------------|--------------|-----------|---------|----------|
| git | Commit de docs | ✓ | verificado en git status | — |
| Node.js / npm | Validación con `node --check` | ✓ | v22.22.3 (nvm) | — |
| Bash / grep | Verificación de referencias | ✓ | macOS default | — |

---

## Validation Architecture

`workflow.nyquist_validation` está explícitamente en `false` en `.planning/config.json`. Esta sección se omite por configuración.

---

## Security Domain

`security_enforcement: true`, `security_asvs_level: 1` en config. Esta fase no introduce código de ningún tipo — solo archivos Markdown estáticos. No se aplica ninguna categoría ASVS relevante.

| Categoría ASVS | Aplica | Justificación |
|---------------|--------|---------------|
| V2 Authentication | No | Sin código de autenticación |
| V3 Session Management | No | Sin código de sesión |
| V4 Access Control | No | Sin código de control de acceso |
| V5 Input Validation | No | Sin código que procese inputs |
| V6 Cryptography | No | Sin código criptográfico |

**Consideración de seguridad aplicable:** Ningún ejemplo del glosario o de los docs debe incluir credenciales reales, tokens, o IPs distintas de `localhost`. Los ejemplos existentes usan datos ficticios (`john@example.com`, `jane@example.com`) — mantener ese patrón. [VERIFIED: docs existentes]

---

## Project Constraints (from CLAUDE.md)

| Directiva | Fuente | Aplicación en Fase 4 |
|-----------|--------|---------------------|
| La separación api/dashboard es intencional y educativa | CLAUDE.md | No acoplar docs de las dos partes salvo que la tarea lo pida explícitamente |
| Sin dependencias innecesarias | CLAUDE.md / AGENTS.md regla 5 | Esta fase no añade dependencias — solo Markdown |
| Documentación como producto: si cambias comportamiento observable, actualiza README.md, NOTEBOOK.md, docs/, missions/ | CLAUDE.md | La renumeración de misiones es un cambio observable que requiere actualizar todas las referencias cruzadas |
| Errores reales → NOTEBOOK.md | CLAUDE.md | Las tres entradas nuevas cumplen este criterio |
| Formato de misión: objetivo, pasos, resultado esperado, reto extra | CLAUDE.md | Las misiones renumeradas ya cumplen el formato; no hay que cambiar contenido |
| Bloques de código ejecutables en docs | Patrón establecido en docs 01-08 | Glosario y doc de tests deben incluir ejemplos ejecutables reales |

---

## Assumptions Log

| # | Claim | Sección | Riesgo si es incorrecto |
|---|-------|---------|------------------------|
| A1 | El número de misiones tras renumeración termina en 07, dejando espacio para una misión 08 de tests en Fase 5 | Architecture Patterns | Si hay más misiones no detectadas, la numeración puede chocar de nuevo |
| A2 | `docs/08-memoria-vs-persistencia.md` no tiene otras referencias a números de misión distintas de las dos encontradas (líneas 128 y 141) | Hallazgos de Auditoría | Si hay más referencias, quedarán rotas tras renumeración |

El A2 tiene bajo riesgo porque el grep completo del archivo se ejecutó durante la investigación y solo devolvió esas dos referencias.

**Claims verificados en esta sesión:** todos los paths de archivos, contenidos de archivos, formatos de entradas, y estado del índice fueron verificados mediante lectura directa de los archivos. No se usó knowledge de entrenamiento para claims factuales sobre el estado actual del repositorio.

---

## Open Questions

1. **Rutas absolutas en misiones 01, 02 y 05-mejorar-dashboard**
   - Qué sabemos: las tres misiones tienen rutas hardcodeadas a `/Users/edefrutos/Desktop/EDF-Lab-Educativo/`
   - Qué no está claro: si el plan 04-02 de auditoría debe corregirlas o diferirlas
   - Recomendación: el CONTEXT.md las considera fuera de scope ("Reescritura de docs conceptuales ya existentes"); no corregir en Fase 4, pero el planner puede incluirlo en 04-02 como mejora de sincronización si lo considera dentro del alcance de "auditoría"

2. **Glosario: términos de herramientas de entorno (bloque 4)**
   - Qué sabemos: el bloque incluye Node.js, npm, nodemon, curl, puerto, variable de entorno (D-01)
   - Qué no está claro: si `nvm` y `pyenv` deben aparecer dado que son herramientas del entorno del propietario pero no del laboratorio en sí
   - Recomendación: incluir solo herramientas que el alumno usa directamente en el lab (`node`, `npm`, `curl`, `nodemon`); excluir gestores de versiones que son setup personal

---

## Sources

### Primary (HIGH confidence)
- `docs/00-indice.md` — lectura directa, estado verificado del índice actual
- `missions/01-arrancar-api.md` — formato canónico de misión verificado
- `missions/05-restart-y-persistencia.md` y `missions/06-corrupcion-y-restauracion.md` — títulos internos verificados
- `api/index.js` — guard `require.main`, `loadUsers()`, `saveUsers()` verificados
- `api/index.test.js` — patrón AAA, `beforeEach`/`afterEach`, `DATA_FILE` verificados
- `docs/08-memoria-vs-persistencia.md` — referencias cruzadas a misiones verificadas (líneas 128, 141)
- `NOTEBOOK.md` — formato de entradas existentes verificado
- `.planning/phases/04-learning-material-hardening/04-CONTEXT.md` — decisiones bloqueadas D-01..D-09 verificadas
- `.planning/config.json` — `nyquist_validation: false`, `security_enforcement: true` verificados
- `ls docs/` y `ls missions/` — estado real del filesystem verificado

### Secondary (MEDIUM confidence)
- `.planning/phases/03-api-tests-and-quality-fixes/03-CONTEXT.md` — contexto de decisiones de Fase 3 para entradas NOTEBOOK
- `.planning/codebase/CONVENTIONS.md` — convenciones de naming verificadas

---

## Metadata

**Confidence breakdown:**
- Auditoría de estado actual del filesystem: HIGH — todos los archivos leídos directamente
- Formato de misiones y NOTEBOOK: HIGH — verificado contra múltiples ejemplos existentes
- Contenido del glosario (términos específicos): MEDIUM — selección de términos bajo discretion de Claude
- Contenido de `docs/10-tests.md`: HIGH — fuente primaria en `index.test.js` completamente disponible

**Research date:** 2026-05-28
**Valid until:** Esta fase es documentación estática; no hay dependencias externas que puedan quedar obsoletas. El RESEARCH es válido hasta el fin del proyecto.
