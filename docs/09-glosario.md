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

## Persistencia y tests

### memoria vs disco

**Memoria**: los datos viven en un array JavaScript mientras el proceso está activo. Al reiniciar el servidor, se pierden. **Disco**: los datos se escriben en un archivo JSON (`api/data/users.json`) y sobreviven a los reinicios.

```bash
# Comprobar el archivo de datos en disco
cat api/data/users.json
```

> Ver más: [`docs/08-memoria-vs-persistencia.md`](./08-memoria-vs-persistencia.md)

---

### fixture

Conjunto de datos de prueba conocido y controlado que se carga antes de cada test para garantizar que todos los tests partan del mismo estado.

```js
// Fixture del laboratorio (api/index.test.js)
const TEST_SEED = [
  { id: 1, name: 'John Doe',  email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
];
```

> Ver más: [`docs/08-memoria-vs-persistencia.md`](./08-memoria-vs-persistencia.md)

---

### suite de tests

Conjunto de tests organizados que verifican el comportamiento de un sistema. En el laboratorio, la suite vive en `api/index.test.js` y cubre todos los endpoints con 12 casos.

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
