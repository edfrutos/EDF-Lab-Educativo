# Vanilla, React y Vue: mismo panel, distintas formas de estado

A partir de la versión **v1.4**, el laboratorio incluye **tres frontends** que consumen la misma API Express. El objetivo no es elegir “el mejor framework”, sino **ver el mismo flujo** (cargar JSON, CRUD, errores) con herramientas distintas.

> El camino principal sigue siendo el dashboard **vanilla** en `dashboard/`. Las carpetas `dashboard-react/` y `dashboard-vue/` son **opcionales y avanzadas**.

Lecturas previas recomendadas: [`04-dashboard-fetch.md`](./04-dashboard-fetch.md), [`05-cors-explicado.md`](./05-cors-explicado.md).

---

## Tres apps, cuatro puertos

| Qué | Carpeta | URL dev | Cómo arrancar |
|-----|---------|---------|---------------|
| API | `api/` | http://localhost:3100 | `cd api && PORT=3100 npm start` |
| Dashboard vanilla | `dashboard/` | http://localhost:5173 | `python3 -m http.server 5173` |
| Dashboard React | `dashboard-react/` | http://localhost:5174 | `cd dashboard-react && npm run dev` |
| Dashboard Vue | `dashboard-vue/` | http://localhost:5175 | `cd dashboard-vue && npm run dev` |

Cada frontend es un **origen distinto** para el navegador. Por eso CORS importa cuando pasas de `:5173` a `:5174` o `:5175`. Ver [`05-cors-explicado.md`](./05-cors-explicado.md).

Práctica guiada con pestaña Network: [`missions/13-frameworks-network-tab.md`](../missions/13-frameworks-network-tab.md).

---

## Estado: quién guarda los datos de la UI

Los tres paneles muestran lo mismo (health, info de la API, tabla de usuarios), pero **organizan el estado** de forma distinta.

| Enfoque | Dónde vive el estado | Qué pasa cuando cambia un dato |
|---------|---------------------|--------------------------------|
| **Vanilla** | Variables del módulo + objeto `elements` que apunta al DOM | Tú llamas funciones `render*` o cambias `.textContent` |
| **React** | `useState` en `App.jsx` | React vuelve a renderizar el componente |
| **Vue** | `ref()` en `App.vue` | El template se actualiza al cambiar `.value` |

### Vanilla: variables y `elements`

En `dashboard/app.js` el estado de negocio y la carga están en variables de nivel superior; el DOM se toca a través de referencias reunidas en un objeto:

```js
const API_BASE_URL = 'http://localhost:3100';
let currentUsers = [];
let editingUserId = null;

const elements = {
  healthStatus: document.getElementById('health-status'),
  usersTableBody: document.getElementById('users-table-body'),
  // ...
};

async function loadDashboardData() {
  const [health, apiInfo, users] = await Promise.all([
    fetchJson('/health'),
    fetchJson('/'),
    fetchJson('/users')
  ]);
  renderHealth(health);
  renderApiInfo(apiInfo);
  renderUsers(users);
}
```

**Idea clave:** no hay “reactividad automática”. Si cambias `currentUsers`, la tabla no se actualiza sola hasta que llamas a `renderUsers` o recargas con `loadDashboardData()`.

### React: `useState` en el componente raíz

En `dashboard-react/src/App.jsx` el mismo flujo usa hooks; el estado y la UI viven en un solo componente que se re-renderiza:

```jsx
const [users, setUsers] = useState([]);
const [editingUserId, setEditingUserId] = useState(null);
const [isLoading, setIsLoading] = useState(true);

const loadDashboardData = useCallback(async () => {
  const [health, apiInfo, usersResponse] = await Promise.all([
    fetchJson('/health'),
    fetchJson('/'),
    fetchJson('/users')
  ]);
  setUsers(Array.isArray(usersResponse) ? usersResponse : []);
  // ...
}, []);
```

**Idea clave:** describes *qué datos hay* (`users`, `isLoading`) y React actualiza el JSX cuando llamas a los setters.

### Vue: `ref()` y template declarativo

En `dashboard-vue/src/App.vue` el patrón es paralelo a React, con la sintaxis Composition API:

```js
const users = ref([]);
const editingUserId = ref(null);
const isLoading = ref(true);

async function loadDashboardData() {
  const [health, apiInfo, usersResponse] = await Promise.all([
    fetchJson('/health'),
    fetchJson('/'),
    fetchJson('/users')
  ]);
  users.value = Array.isArray(usersResponse) ? usersResponse : [];
}
```

**Idea clave:** en `<script setup>` lees y escribes `nombre.value`; el template usa `{{ users }}` sin `.value`.

### Tabla comparativa rápida

| Concepto | Vanilla | React | Vue |
|----------|---------|-------|-----|
| Lista de usuarios | `currentUsers` | `users` + `setUsers` | `users` ref |
| Modo edición | `editingUserId` | `editingUserId` state | `editingUserId` ref |
| Carga inicial | `loadDashboardData()` al final del script | `useEffect(..., [])` | `onMounted(...)` |
| Hijos | manipulación DOM / listeners | props + callbacks | props + `emit` |

---

## Formularios: mismo flujo, distinta sintaxis

Los tres implementan:

1. **Crear** con `POST /users`
2. **Editar** (rellenar formulario → `PUT /users/:id`)
3. **Eliminar** con `confirm()` y `DELETE /users/:id`
4. **Recargar** la tabla tras un éxito (`loadDashboardData`)

### Envío del formulario

Vanilla escucha el submit del `<form>` y lee los inputs del DOM:

```js
async function handleUserFormSubmit(event) {
  event.preventDefault();
  const name = elements.userNameInput.value.trim();
  const email = elements.userEmailInput.value.trim();
  // POST o PUT según editingUserId
  await loadDashboardData();
}
```

React centraliza en `App.jsx` y pasa valores al hijo `UserForm`:

```jsx
<UserForm
  name={name}
  onSubmit={handleUserFormSubmit}
  onNameChange={setName}
/>
```

Vue usa props y eventos con nombres explícitos:

```vue
<UserForm
  :name="name"
  @submit="handleUserFormSubmit"
  @update:name="name = $event"
/>
```

### Modo edición

En los tres, al pulsar **Editar** en una fila:

- Se guarda el `id` en edición
- Se copian `name` y `email` al formulario
- El botón pasa a «Guardar cambios» y aparece «Cancelar edición»

Vanilla (`startEditingUser`):

```js
editingUserId = user.id;
elements.userNameInput.value = user.name;
elements.formModeMessage.textContent = `Editando usuario ${user.id}`;
```

### Email duplicado (409)

La API responde **409 Conflict** con JSON `{ "error": "..." }` cuando el email ya existe.

| App | Feedback global | Error bajo el campo email |
|-----|-----------------|---------------------------|
| Vanilla | Sí (`mutation-feedback`) | No (solo mensaje general) |
| React | Sí | Sí, si `error.status === 409` |
| Vue | Sí | Sí, igual que React |

React (`dashboard-react/src/App.jsx`):

```jsx
const handleMutationError = (error) => {
  showMutationFeedback(getMutationErrorMessage(error), 'error');
  if (error.status === 409) {
    setEmailFieldError(error.message);
  }
};
```

Vue (`dashboard-vue/src/App.vue`):

```js
function handleMutationError(error) {
  showMutationFeedback(getMutationErrorMessage(error), 'error');
  if (error.status === 409) {
    emailFieldError.value = error.message;
  }
}
```

**Aprendizaje:** el contrato HTTP es el mismo; los frameworks solo cambian **dónde** pintas el error.

Mensajes de éxito visibles (iguales en React y Vue):

```txt
POST /users -> usuario creado
PUT /users/:id -> usuario actualizado
DELETE /users/:id -> usuario eliminado
```

---

## HTTP: `fetch` visible en los tres

Ninguna variante usa axios ni capas ocultas en v1.4.

| App | URL de la API | Módulo HTTP |
|-----|---------------|-------------|
| Vanilla | Constante en `app.js` | `fetchJson` en el mismo archivo |
| React / Vue | `import.meta.env.VITE_API_BASE_URL` | `src/api.js` exporta `fetchJson` |

Ejemplo compartido (`dashboard-react/src/api.js` — Vue es equivalente):

```js
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3100';

export async function fetchJson(path, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const error = new Error(`La petición a ${url} ha fallado: ${detail}`);
    error.status = response.status;  // importante para 409
    throw error;
  }
  return response.json();
}
```

En vanilla la URL está fijada en código:

```js
const API_BASE_URL = 'http://localhost:3100';
```

En React/Vue puedes sobreescribir con `.env`:

```txt
VITE_API_BASE_URL=http://localhost:3100
```

---

## Estilos: `styles.css` frente a Tailwind

| App | Estilos | Archivo principal |
|-----|---------|-------------------|
| Vanilla | CSS propio del lab | `dashboard/styles.css` |
| React | Tailwind CSS v4 | `dashboard-react/src/index.css` (`@import 'tailwindcss'`) |
| Vue | Tailwind CSS v4 | `dashboard-vue/src/index.css` |

**No es un requisito de la API:** es una decisión didáctica. Vanilla enseña HTML+CSS clásico; los frameworks usan utilidades Tailwind para iterar rápido sin copiar todo el CSS del panel original.

La **estructura de secciones** (hero, tarjetas health/API, tabla, formulario) está alineada entre React y Vue; vanilla usa las mismas ideas con clases distintas.

---

## Qué no incluimos en v1.4

Para mantener el foco en **fetch, estado local y formularios**:

- **Redux**, **Pinia**, **Vuex** — estado global (futuro milestone si hace falta)
- **React Router** / **Vue Router** — una sola página basta
- **axios** o clientes HTTP que oculten `fetch`
- **SSR** (Next, Nuxt) — ensuciaría el aprendizaje de CORS en dev
- **Dockerizar** los dev servers de Vite — los frameworks se ejecutan en el host; Compose sigue sirviendo API + vanilla/nginx según [`14-docker-compose.md`](./14-docker-compose.md)

---

## Siguiente paso

1. Completa [`missions/13-frameworks-network-tab.md`](../missions/13-frameworks-network-tab.md) con la pestaña Network.
2. Compara en vivo: abre vanilla, React y Vue con la API en marcha y localiza en código `loadDashboardData` / `handleUserFormSubmit` en cada carpeta.
3. Si algo falla (CORS, puerto ocupado, variable de entorno), revisa la sección **Frameworks (v1.4)** en [`NOTEBOOK.md`](../NOTEBOOK.md).
