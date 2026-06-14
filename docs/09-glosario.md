# Glosario

Términos usados en el laboratorio, agrupados por área. Consulta la sección que corresponda cuando encuentres un concepto desconocido.

---

## Backend, HTTP y API

### servidor

Proceso que se ejecuta continuamente esperando peticiones de clientes. En este laboratorio, el servidor es la API Express que arranca en el puerto 3100.

```bash
# Arrancar el servidor
cd api
PORT=3100 npm start
```

> Ver más: [`docs/01-arquitectura.md`](./01-arquitectura.md)

---

### endpoint

Ruta concreta que la API expone para que los clientes puedan interactuar con ella. Cada endpoint combina un método HTTP y una URL.

```bash
# Listar todos los usuarios
curl http://localhost:3100/users

# Consultar un usuario concreto
curl http://localhost:3100/users/1
```

> Ver más: [`docs/03-api-express.md`](./03-api-express.md)

---

### puerto

Número que identifica un proceso de red dentro de una misma máquina. Permite que varios servidores convivan en el mismo equipo sin colisionar.

```bash
# La API escucha en el puerto 3100
PORT=3100 npm start

# El dashboard se sirve en el puerto 5173
python3 -m http.server 5173
```

> Ver más: [`docs/02-puesta-en-marcha.md`](./02-puesta-en-marcha.md)

---

### request / response

La **request** (petición) es el mensaje que el cliente envía al servidor: incluye método, URL, cabeceras y opcionalmente un cuerpo. La **response** (respuesta) es el mensaje que el servidor devuelve: incluye un código de estado y un cuerpo (normalmente JSON).

```bash
# -v muestra la petición y la respuesta completas
curl -v http://localhost:3100/health
```

> Ver más: [`docs/03-api-express.md`](./03-api-express.md)

---

### código HTTP

Número de tres dígitos que el servidor incluye en la respuesta para indicar el resultado de la operación.

| Código | Significado |
|--------|-------------|
| 200 | OK — operación correcta |
| 201 | Created — recurso creado |
| 400 | Bad Request — petición mal formada |
| 404 | Not Found — recurso no existe |
| 500 | Internal Server Error — fallo del servidor |

```bash
# Ver solo el código HTTP de una petición
curl -o /dev/null -w "%{http_code}" http://localhost:3100/users
```

> Ver más: [`docs/03-api-express.md`](./03-api-express.md)

---

### JSON

Formato de texto para intercambiar datos estructurados entre cliente y servidor. Las claves van entre comillas dobles y los valores pueden ser cadenas, números, booleanos, arrays u objetos.

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com"
}
```

> Ver más: [`docs/03-api-express.md`](./03-api-express.md)

---

### CRUD

Acrónimo de las cuatro operaciones básicas sobre datos: **C**reate, **R**ead, **U**pdate, **D**elete. En la API del laboratorio se mapean a verbos HTTP.

| Operación | Verbo HTTP | Endpoint del lab |
|-----------|-----------|------------------|
| Create | POST | `POST /users` |
| Read | GET | `GET /users` / `GET /users/:id` |
| Update | PUT | `PUT /users/:id` |
| Delete | DELETE | `DELETE /users/:id` |

```bash
# Create
curl -X POST http://localhost:3100/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com"}'

# Delete
curl -X DELETE http://localhost:3100/users/1
```

> Ver más: [`docs/03-api-express.md`](./03-api-express.md)

---

### Express

Framework minimalista de Node.js para construir APIs y servidores web. Permite definir rutas, middlewares y lógica de respuesta con muy poco código.

```js
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});
```

> Ver más: [`docs/03-api-express.md`](./03-api-express.md)

---

### CORS

Cross-Origin Resource Sharing. Mecanismo de seguridad del navegador que bloquea peticiones JavaScript a un origen diferente del que sirvió la página. La API del laboratorio habilita CORS explícitamente para que el dashboard pueda consumirla.

```js
const cors = require('cors');
app.use(cors());
```

> Ver más: [`docs/05-cors-explicado.md`](./05-cors-explicado.md)

---

### módulo

Archivo JavaScript que exporta funcionalidades para que otros archivos las importen con `require()`. En Node.js, cada archivo es un módulo independiente.

```js
// Importar el módulo cors
const cors = require('cors');

// Exportar la app para los tests
module.exports = app;
```

> Ver más: [`docs/03-api-express.md`](./03-api-express.md)

---

## Frontend y navegador

### fetch()

Función nativa del navegador para hacer peticiones HTTP de forma asíncrona. Devuelve una promesa que resuelve con la respuesta del servidor.

```js
// Obtener la lista de usuarios de la API
const response = await fetch('http://localhost:3100/users');
const users = await response.json();
console.log(users);
```

> Ver más: [`docs/04-dashboard-fetch.md`](./04-dashboard-fetch.md)

---

### DOM

Document Object Model. Representación en árbol de los elementos HTML de una página que JavaScript puede leer y modificar en tiempo real.

```js
// Leer un elemento del DOM por su id
const container = document.getElementById('user-list');

// Modificar su contenido
container.textContent = 'Cargando usuarios...';
```

> Ver más: [`docs/04-dashboard-fetch.md`](./04-dashboard-fetch.md)

---

### origen

Combinación de protocolo, host y puerto que identifica de forma única una fuente de contenido web. Dos URLs tienen el mismo origen solo si los tres componentes coinciden.

```txt
http://localhost:5173  ← origen del dashboard
http://localhost:3100  ← origen de la API (origen distinto → CORS)
```

> Ver más: [`docs/05-cors-explicado.md`](./05-cors-explicado.md)

---

### async / await

Sintaxis de JavaScript para escribir código asíncrono de forma legible, sin encadenar `.then()`. Una función declarada `async` puede usar `await` para esperar que una promesa se resuelva.

```js
async function fetchUsers() {
  const response = await fetch('http://localhost:3100/users');
  const users = await response.json();
  return users;
}
```

> Ver más: [`docs/04-dashboard-fetch.md`](./04-dashboard-fetch.md)

---

### promesa

Objeto que representa el resultado futuro de una operación asíncrona. Puede estar pendiente (*pending*), resuelta con éxito (*fulfilled*) o rechazada (*rejected*).

```js
// Sintaxis con .then() / .catch()
fetch('http://localhost:3100/health')
  .then(r => r.json())
  .then(data => console.log(data.status))
  .catch(err => console.error('API no disponible', err));
```

> Ver más: [`docs/04-dashboard-fetch.md`](./04-dashboard-fetch.md)

---

### sesión del operador

Cuenta en la tabla `accounts` que **no** es un usuario CRUD. Sirve para iniciar sesión en el panel y acceder a `/users`. Se obtiene con `POST /auth/login`.

> Ver más: [`docs/17-autenticacion.md`](./17-autenticacion.md)

---

### credentials: 'include'

Opción de `fetch` que envía cookies al origen de la API. Obligatoria para que la cookie `edf_session` viaje desde `:5173`, `:5174` o `:5175` a `:3100`.

```js
fetch('http://localhost:3100/users', { credentials: 'include' });
```

> Ver más: [`docs/17-autenticacion.md`](./17-autenticacion.md), [`docs/05-cors-explicado.md`](./05-cors-explicado.md)

---

## Persistencia y tests

### memoria vs disco

**Memoria**: los datos viven en un array JavaScript mientras el proceso está activo. Al reiniciar el servidor, se pierden. **Disco (v1.1)**: los datos persisten en SQLite (`api/data/users.db`) y sobreviven a los reinicios. El archivo `api/data/users.json` es solo **semilla/migración** cuando la base arranca vacía — no se reescribe en cada CRUD.

```bash
# Inspeccionar la base en disco (v1.1)
sqlite3 api/data/users.db "SELECT id, name, email FROM users;"
```

> Ver más: [`docs/08-memoria-vs-persistencia.md`](./08-memoria-vs-persistencia.md), [`docs/13-sqlite.md`](./13-sqlite.md)

---

### fixture

Conjunto de datos de prueba conocido y controlado que se carga antes de cada test para garantizar que todos los tests parten del mismo estado. En v1.1 la suite usa una base SQLite aislada (`users.test.db`) recreada en cada `beforeEach` con `initDb()`.

```js
// Patrón en api/index.test.js (v1.1)
process.env.DB_FILE = path.join(__dirname, 'data', 'users.test.db');
beforeEach(async () => {
  await unlink(TEST_DB).catch(() => {});
  await app.initDb(); // schema + semilla John/Jane
});
```

> Ver más: [`docs/10-tests.md`](./10-tests.md)

---

### suite de tests

Conjunto de tests organizados que verifican el comportamiento de un sistema. En el laboratorio, la suite vive en `api/index.test.js` y cubre todos los endpoints con 16 casos.

```bash
# Ejecutar la suite completa desde la carpeta api/
cd api
npm test
```

> Ver más: [`docs/03-api-express.md`](./03-api-express.md)

---

### Arrange-Act-Assert

Patrón para estructurar cada test en tres fases: **Arrange** (preparar datos y estado), **Act** (ejecutar la operación bajo prueba), **Assert** (verificar el resultado).

```js
it('crea un usuario válido y responde 201', async () => {
  // Arrange
  const payload = { name: 'Jane Doe', email: 'jane@example.com' };
  // Act
  const res = await request(app).post('/users').send(payload);
  // Assert
  assert.equal(res.status, 201);
  assert.equal(res.body.email, payload.email);
});
```

> Ver más: [`docs/03-api-express.md`](./03-api-express.md)

---

### beforeEach

Hook de los frameworks de tests que se ejecuta automáticamente antes de cada test individual. Se usa para restaurar el estado inicial (fixture) y evitar que un test contamine a los siguientes.

```js
beforeEach(async () => {
  // Restaurar el fixture limpio antes de cada test
  await writeFile(TEST_FILE, JSON.stringify(TEST_SEED, null, 2), 'utf8');
  await app.loadUsers();
});
```

> Ver más: [`docs/08-memoria-vs-persistencia.md`](./08-memoria-vs-persistencia.md)

---

## Herramientas del entorno

### Node.js

Entorno de ejecución de JavaScript en el servidor. Permite ejecutar código JavaScript fuera del navegador, directamente en el sistema operativo.

```bash
# Comprobar la versión instalada
node --version

# Ejecutar un archivo JavaScript
node api/index.js
```

> Ver más: [`docs/02-puesta-en-marcha.md`](./02-puesta-en-marcha.md)

---

### npm

Node Package Manager. Gestor de paquetes de Node.js que permite instalar dependencias, ejecutar scripts y publicar módulos.

```bash
# Instalar dependencias del proyecto
npm install

# Arrancar la API
npm start

# Ejecutar los tests
npm test
```

> Ver más: [`docs/02-puesta-en-marcha.md`](./02-puesta-en-marcha.md)

---

### nodemon

Herramienta de desarrollo que reinicia automáticamente el proceso Node.js cuando detecta cambios en los archivos fuente. Evita tener que parar y volver a arrancar la API manualmente.

```bash
# Arrancar la API en modo desarrollo (con recarga automática)
cd api
npm run dev
```

> Ver más: [`docs/02-puesta-en-marcha.md`](./02-puesta-en-marcha.md)

---

### curl

Herramienta de línea de comandos para hacer peticiones HTTP desde la terminal. Indispensable para probar endpoints de la API sin necesidad de un navegador.

```bash
# Petición GET básica
curl http://localhost:3100/health

# Petición POST con cuerpo JSON
curl -X POST http://localhost:3100/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}'
```

> Ver más: [`docs/06-debugging.md`](./06-debugging.md)

---

## Base de datos y persistencia

### SQLite

Motor de base de datos relacional embebido en un archivo `.db`. En este laboratorio, los usuarios viven en `api/data/users.db`.

```bash
sqlite3 api/data/users.db "SELECT id, name, email FROM users;"
```

> Ver más: [`docs/13-sqlite.md`](./13-sqlite.md)

---

### PostgreSQL

Motor de base de datos **cliente-servidor**: un proceso Postgres escucha en un puerto (5432) y la API se conecta con `DATABASE_URL`. En Compose, el servicio `edf-lab-postgres` guarda datos en el volumen `postgres_data`.

```bash
psql postgresql://edf_lab:edf_lab_dev@localhost:5432/edf_lab \
  -c "SELECT id, name, email FROM users;"
```

> Ver más: [`docs/15-postgresql.md`](./15-postgresql.md), [`missions/12-postgres-compose-crud.md`](../missions/12-postgres-compose-crud.md)

---

### DATABASE_URL

Variable de entorno con la **cadena de conexión** a Postgres. Si está definida, `api/db.js` usa `db-pg.js`; si no, SQLite.

```txt
postgresql://edf_lab:edf_lab_dev@edf-lab-postgres:5432/edf_lab
```

En desarrollo host sin Compose, no la exportes si quieres seguir con `users.db`.

> Ver más: [`docs/15-postgresql.md`](./15-postgresql.md), [`docs/14-docker-compose.md`](./14-docker-compose.md)

---

### volumen nombrado (named volume)

Almacén gestionado por Docker (p. ej. `postgres_data`), independiente del filesystem del contenedor. Los datos de Postgres en Compose sobreviven a `docker compose down` sin `-v`.

```yaml
volumes:
  postgres_data:
```

Contraste: el **bind mount** `./api/data` enlaza una carpeta del Mac con el contenedor.

> Ver más: [`docs/14-docker-compose.md`](./14-docker-compose.md), [`docs/15-postgresql.md`](./15-postgresql.md)

---

### esquema (schema)

Definición estructurada de tablas y columnas. En este repo está en `api/schema.sql` y se aplica al arrancar con `initDb()`.

```sql
-- Fragmento de api/schema.sql
email TEXT NOT NULL UNIQUE
```

> Ver más: [`docs/13-sqlite.md`](./13-sqlite.md)

---

### prepared statement (consulta preparada)

Consulta SQL con marcadores (`?`) que se compila una vez y se ejecuta con valores distintos. Reduce errores de concatenación y enseña buenas prácticas.

```javascript
// Patrón en api/db.js
database.prepare('INSERT INTO users (name, email) VALUES (?, ?)').run(name, email);
```

> Ver más: [`docs/13-sqlite.md`](./13-sqlite.md)

---

### restricción UNIQUE

Regla del esquema que impide valores duplicados en una columna. Si intentas insertar un email ya existente, SQLite falla y la API responde **409**.

> Ver más: [`docs/13-sqlite.md`](./13-sqlite.md)

---

### migración (en este lab)

Importación automática de filas desde `users.json` a SQLite cuando la tabla `users` está vacía al arrancar. No es un script manual: ocurre dentro de `initDb()`.

```txt
Migrados 2 usuarios desde users.json
```

> Ver más: [`docs/13-sqlite.md`](./13-sqlite.md), [`missions/10-inspeccionar-sqlite.md`](../missions/10-inspeccionar-sqlite.md)

---

## Docker y Compose

### Docker Compose

Herramienta que lee `docker-compose.yml` y arranca varios contenedores como un stack. En v1.3 orquesta `edf-lab-postgres`, `edf-lab-api` y `edf-lab-dashboard` con un solo comando.

```bash
# Desde la raíz del repo
npm run compose:up
npm run compose:down
```

> Ver más: [`docs/14-docker-compose.md`](./14-docker-compose.md)

---

### servicio (Compose)

Un contenedor definido en `docker-compose.yml`. Este proyecto tiene tres: `edf-lab-postgres` (base de datos), `edf-lab-api` (Express + Postgres vía `DATABASE_URL`) y `edf-lab-dashboard` (nginx con ficheros estáticos).

```yaml
services:
  edf-lab-postgres:
    image: postgres:16-alpine
  edf-lab-api:
    build: ./api
  edf-lab-dashboard:
    build: ./dashboard
```

> Ver más: [`docs/14-docker-compose.md`](./14-docker-compose.md)

---

### bind mount

Tipo de volumen que enlaza una carpeta del **host** con una ruta **dentro del contenedor**. En Compose, `./api/data:/usr/src/app/data` hace que `users.db` escrito en el contenedor aparezca en tu Mac.

```yaml
volumes:
  - ./api/data:/usr/src/app/data
```

Contraste: un contenedor sin bind mount (Misión 09) pierde los datos al destruirse.

> Ver más: [`docs/12-docker.md`](./12-docker.md), [`docs/14-docker-compose.md`](./14-docker-compose.md)

---

### volumen efímero vs persistente

| Tipo | En este lab | ¿Sobrevive al parar el contenedor? |
|------|-------------|-------------------------------------|
| Sin volumen | `npm run docker:start` (Misión 09) | No |
| Bind mount | API en host o Compose (`./api/data`) | Sí — `users.db` / `users.json` en el Mac |
| Volumen nombrado | `postgres_data` en Compose | Sí — datos Postgres |

> Ver más: [`docs/12-docker.md`](./12-docker.md), [`docs/14-docker-compose.md`](./14-docker-compose.md), [`missions/12-postgres-compose-crud.md`](../missions/12-postgres-compose-crud.md)
