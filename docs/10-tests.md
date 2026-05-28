# Tests de la API

El laboratorio incluye una suite de tests automatizados que verifica que la API se comporta como se espera. Este documento explica por qué existen esos tests, cómo ejecutarlos y cómo añadir uno nuevo.

## Por qué existen los tests

Cuando cambias código en la API —añades un endpoint, corriges un bug, refactorizas un helper— lo más natural es abrir el navegador o lanzar un `curl` y comprobar que todo sigue funcionando. Eso funciona bien para un cambio puntual, pero cuando el proyecto crece, repetir esa comprobación manual a mano cada vez se vuelve lento y propenso a errores.

Los tests automatizados resuelven ese problema: en lugar de comprobar cada endpoint uno por uno, un solo comando ejecuta las 12 verificaciones y te indica exactamente qué funciona y qué no. Cuando un test falla, el mensaje de error señala el caso concreto —por ejemplo, `POST /users responde 400 si name está vacío`— y puedes localizar el problema sin tener que explorar toda la API.

## Cómo ejecutar la suite

Desde la carpeta `api/`:

```bash
cd api
npm test
```

Ejemplo de output de una ejecución correcta:

```
▶ GET /health
  ✔ responde 200 con status healthy y timestamp (12ms)
▶ GET /users
  ✔ responde 200 con array de usuarios ordenados por nombre (8ms)
▶ POST /users
  ✔ crea un usuario válido y responde 201 con el objeto creado (6ms)
  ✔ responde 400 si name está vacío (4ms)
  ✔ responde 400 si email está vacío (4ms)
▶ PUT /users/:id
  ✔ actualiza un usuario existente y responde 200 con el objeto actualizado (5ms)
  ✔ responde 404 si el usuario no existe (4ms)
▶ DELETE /users/:id
  ✔ elimina un usuario existente y responde 200 con mensaje y datos del usuario (5ms)
  ✔ responde 404 si el usuario no existe (4ms)
▶ Validación de IDs
  ✔ GET /users/1abc responde 400 (string con prefijo numérico) (4ms)
  ✔ GET /users/0 responde 400 (cero no es ID válido) (3ms)
  ✔ GET /users/abc responde 400 (string no numérico) (3ms)

ℹ tests 12
ℹ pass 12
ℹ fail 0
```

**Cómo leer el output:**

- `✔` — el test pasó: la API respondió exactamente lo esperado.
- `✗` — el test falló: algo no coincide. El mensaje de error indica qué valor se obtuvo y qué se esperaba.
- La línea `ℹ fail 0` es la que importa al final: si es `0`, la suite está en verde.

**Nota sobre `--test-force-exit`:** El script de `npm test` incluye el flag `--test-force-exit`. Supertest mantiene abierta la conexión HTTP del servidor mientras está en uso. Sin este flag, el runner de Node.js (`node:test`) esperaría indefinidamente a que el servidor cerrara, y el proceso nunca terminaría. Con `--test-force-exit` el runner fuerza la salida en cuanto todos los tests han ejecutado.

## Cómo está estructurado index.test.js

### Setup: el orden de importación importa

El archivo empieza asignando la variable de entorno `DATA_FILE` **antes** de importar `index.js`. Este orden es crítico:

```javascript
'use strict';

// CRÍTICO: DATA_FILE debe asignarse ANTES del require de index.js.
// Node.js cachea módulos en el primer require — si index.js se importa antes
// de setear la variable, DATA_FILE_PATH quedará con el valor por defecto.

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { writeFile, unlink } = require('fs/promises');
const path = require('path');

const TEST_FILE = path.join(__dirname, 'data', 'users.test.json');
process.env.DATA_FILE = TEST_FILE;

const app = require('./index.js');
const request = require('supertest');
```

Node.js cachea los módulos la primera vez que se importan. Si `index.js` se importara antes de asignar `DATA_FILE`, el módulo leería el valor vacío de la variable y usaría el archivo de producción `data/users.json` en lugar del fixture de tests `data/users.test.json`.

### beforeEach y afterEach: estado limpio en cada test

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

`beforeEach` se ejecuta antes de cada test individual. Escribe el fixture limpio en disco y luego llama a `app.loadUsers()` para cargar esos datos en el array `users[]` en memoria. Sin este paso, el array estaría vacío —`loadUsers()` no se llama automáticamente al importar el módulo porque el guard `require.main === module` lo impide (ver `docs/NOTEBOOK.md`).

`afterEach` elimina el fixture de disco después de cada test para no dejar archivos temporales.

### Patrón Arrange-Act-Assert

Cada test individual sigue el patrón AAA (Arrange-Act-Assert):

- **Arrange** — preparar el estado inicial y los datos de entrada.
- **Act** — ejecutar la operación que se quiere verificar (la llamada HTTP).
- **Assert** — comprobar que el resultado es el esperado.

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

### Los 6 grupos describe de la suite

La suite está organizada en seis bloques `describe`, uno por área de la API:

1. `GET /health` — estado del servidor
2. `GET /users` — listado de usuarios
3. `POST /users` — creación y validación
4. `PUT /users/:id` — actualización y 404
5. `DELETE /users/:id` — borrado y 404
6. `Validación de IDs` — rechazo de IDs malformados

## Cómo añadir un test nuevo

Supón que quieres verificar que el endpoint raíz `GET /` responde con código 200 y un campo `message`. Este caso no está en la suite actual, así que es un buen ejemplo para practicar.

Añade el siguiente bloque al final de `api/index.test.js`, antes del fin del archivo:

```javascript
describe('GET /', () => {
  it('responde 200 con campo message', async () => {
    // Arrange — fixture listo por beforeEach
    // Act
    const res = await request(app).get('/');
    // Assert
    assert.equal(res.status, 200);
    assert.ok(typeof res.body.message === 'string', 'message debe ser string');
  });
});
```

Puedes verificar que el endpoint existe con:

```bash
curl -s http://localhost:3100/
```

Deberías ver una respuesta con el campo `message`. Luego ejecuta la suite para confirmar que el test pasa:

```bash
npm test
```

El output debería mostrar `ℹ tests 13` y `ℹ pass 13`.
