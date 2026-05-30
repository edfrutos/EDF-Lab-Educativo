# Tests de la API

El laboratorio incluye una suite de tests automatizados que verifica que la API se comporta como se espera. Este documento explica por qué existen esos tests, cómo ejecutarlos y cómo añadir uno nuevo.

## Por qué existen los tests

Cuando cambias código en la API —añades un endpoint, corriges un bug, refactorizas un helper— lo más natural es abrir el navegador o lanzar un `curl` y comprobar que todo sigue funcionando. Eso funciona bien para un cambio puntual, pero cuando el proyecto crece, repetir esa comprobación manual a mano cada vez se vuelve lento y propenso a errores.

Los tests automatizados resuelven ese problema: en lugar de comprobar cada endpoint uno por uno, un solo comando ejecuta todas las verificaciones y te indica exactamente qué funciona y qué no. Cuando un test falla, el mensaje de error señala el caso concreto —por ejemplo, `POST /users responde 400 si name está vacío`— y puedes localizar el problema sin tener que explorar toda la API.

## Cómo ejecutar la suite

Desde la carpeta `api/`:

```bash
cd api
npm test
```

Ejemplo de output de una ejecución correcta:

```
▶ GET /health
  ✔ responde 200 con status healthy y timestamp
▶ Email duplicado
  ✔ POST /users responde 409 si el email ya existe

ℹ tests 16
ℹ pass 16
ℹ fail 0
```

**Cómo leer el output:**

- `✔` — el test pasó: la API respondió exactamente lo esperado.
- `✗` — el test falló: algo no coincide. El mensaje de error indica qué valor se obtuvo y qué se esperaba.
- La línea `ℹ fail 0` es la que importa al final: si es `0`, la suite está en verde.

**Nota sobre `--test-force-exit`:** El script de `npm test` incluye el flag `--test-force-exit`. Supertest mantiene abierta la conexión HTTP del servidor mientras está en uso. Sin este flag, el runner de Node.js (`node:test`) esperaría indefinidamente a que el servidor cerrara, y el proceso nunca terminaría.

## JSON vs SQLite (cuándo usar cada uno)

Un archivo JSON (`users.json`) basta para aprender persistencia en disco con pocos datos y un solo proceso: es fácil de abrir, editar y entender. SQLite entra cuando necesitas reglas en el esquema (por ejemplo `UNIQUE` en email), consultas más expresivas o preparar el terreno para acceso concurrente. En este laboratorio, `users.json` sigue siendo la **fuente de semilla** al arrancar con una base vacía; el **almacén en runtime** es `data/users.db`.

## Cómo está estructurado index.test.js

### Setup: el orden de importación importa

El archivo empieza asignando la variable de entorno `DB_FILE` **antes** de importar `index.js`. Este orden es crítico:

```javascript
const TEST_DB = path.join(__dirname, 'data', 'users.test.db');
process.env.DB_FILE = TEST_DB;

const app = require('./index.js');
const request = require('supertest');
```

Node.js cachea los módulos la primera vez que se importan. Si `index.js` se importara antes de asignar `DB_FILE`, el módulo usaría `data/users.db` de producción en lugar del archivo aislado `data/users.test.db`.

### beforeEach y afterEach: estado limpio en cada test

```javascript
beforeEach(async () => {
  await unlink(TEST_DB).catch(() => {});
  await app.initDb();
});

afterEach(async () => {
  await unlink(TEST_DB).catch(() => {});
});
```

`beforeEach` elimina el `.db` de test y llama a `initDb()`, que crea la tabla y, si está vacía, importa desde `users.json`. Para probar una base **sin filas**, un test puede llamar `await app.initDb({ skipSeed: true })` después del `unlink`.

### Patrón Arrange-Act-Assert

Cada test sigue el patrón AAA (Arrange-Act-Assert): preparar estado, ejecutar la petición HTTP, comprobar la respuesta.

### Grupos describe de la suite

1. `GET /health` — estado del servidor
2. `GET /users` — listado de usuarios
3. `POST /users` — creación y validación
4. `PUT /users/:id` — actualización y 404
5. `DELETE /users/:id` — borrado y 404
6. `Validación de IDs` — rechazo de IDs malformados
7. `Base de datos vacía` — listado con cero usuarios
8. `Email duplicado` — respuestas 409 y PUT con el mismo email

## Cómo añadir un test nuevo

Añade un bloque `describe`/`it` al final de `api/index.test.js` y ejecuta `npm test`. El contador de tests subirá en uno.
