const { readFile, writeFile, mkdir } = require('fs/promises');
const path = require('path');
const express = require('express');
const cors = require('cors');
const _ = require('lodash');

const DATA_DIR       = path.join(__dirname, 'data');
const DATA_FILE_PATH = process.env.DATA_FILE
  ? path.resolve(process.env.DATA_FILE)
  : path.join(DATA_DIR, 'users.json');

const SEED_DATA = {
  users: [
    { id: 1, name: 'John Doe',   email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ],
  nextId: 3
};

const app = express();
const PORT = process.env.PORT || 3000;

let users      = [];
let nextUserId = 0;

// Middleware
app.use(cors());
app.use(express.json());

function getSortedUsers() {
  return _.sortBy(users, 'name');
}

function parseUserId(value) {
  // Number.parseInt('1abc', 10) devuelve 1 — acepta prefijo numérico.
  // Number('1abc') devuelve NaN — rechaza cualquier carácter no numérico.
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function findUserIndexById(id) {
  return users.findIndex((user) => user.id === id);
}

function validateUserPayload(body) {
  const { name, email } = body;

  if (typeof name !== 'string' || name.trim() === '') {
    return 'El campo "name" es obligatorio y debe ser texto.';
  }

  if (typeof email !== 'string' || email.trim() === '') {
    return 'El campo "email" es obligatorio y debe ser texto.';
  }

  return null;
}

// ─── Persistencia ────────────────────────────────────────────────────────────

async function saveUsersData(data) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
}

async function loadUsers() {
  try {
    const raw  = await readFile(DATA_FILE_PATH, 'utf8');
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

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Test Project API',
    version: '1.0.0',
    endpoints: [
      'GET /',
      'GET /health',
      'GET /users',
      'GET /users/:id',
      'POST /users',
      'PUT /users/:id',
      'DELETE /users/:id',
      'GET /about',
      'GET /time'
    ]
  });
});

app.get('/users', (req, res) => {
  res.json(getSortedUsers());
});

app.get('/users/:id', (req, res) => {
  const userId = parseUserId(req.params.id);

  if (userId === null) {
    return res.status(400).json({ error: 'El parámetro ":id" debe ser un número entero.' });
  }

  const user = users.find((candidate) => candidate.id === userId);

  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado.' });
  }

  res.json(user);
});

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

app.put('/users/:id', async (req, res) => {
  const userId = parseUserId(req.params.id);

  if (userId === null) {
    return res.status(400).json({ error: 'El parámetro ":id" debe ser un número entero.' });
  }

  const validationError = validateUserPayload(req.body);

  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const userIndex = findUserIndexById(userId);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'Usuario no encontrado.' });
  }

  const previousUser = { ...users[userIndex] };
  users[userIndex] = {
    id: userId,
    name: req.body.name.trim(),
    email: req.body.email.trim()
  };

  try {
    await saveUsers();
  } catch (err) {
    users[userIndex] = previousUser;
    console.error('[error] saveUsers() falló en PUT /users/:id:', err.message);
    return res.status(500).json({ error: 'No se pudo persistir el cambio. Comprueba los permisos del archivo.' });
  }

  res.json(users[userIndex]);
});

app.delete('/users/:id', async (req, res) => {
  const userId = parseUserId(req.params.id);

  if (userId === null) {
    return res.status(400).json({ error: 'El parámetro ":id" debe ser un número entero.' });
  }

  const userIndex = findUserIndexById(userId);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'Usuario no encontrado.' });
  }

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

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

app.get('/about', (req, res) => {
  res.json({
    name: 'Express API Demo Learning Lab',
    description: 'Laboratorio educativo para aprender API REST, fetch(), JSON y CORS.',
    frontend: 'dashboard/',
    backend: 'api/'
  });
});

app.get('/time', (req, res) => {
  res.json({
    now: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;
// Exportado para tests: permite a beforeEach recargar el estado en memoria desde el fixture
module.exports.loadUsers = loadUsers;

async function startServer() {
  await loadUsers();
  app.listen(PORT, () => {
    console.log(`Servidor arrancado en http://localhost:${PORT}`);
  });
}

if (require.main === module) {
  startServer().catch((err) => {
    console.error('[error] No se pudo arrancar el servidor:', err);
    process.exit(1);
  });
}
