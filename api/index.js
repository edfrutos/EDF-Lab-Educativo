const express = require('express');
const cors = require('cors');
const {
  initDb,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  DuplicateEmailError
} = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

function parseUserId(value) {
  // Number.parseInt('1abc', 10) devuelve 1 — acepta prefijo numérico.
  // Number('1abc') devuelve NaN — rechaza cualquier carácter no numérico.
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
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

app.get('/users', async (req, res) => {
  res.json(await getAllUsers());
});

app.get('/users/:id', async (req, res) => {
  const userId = parseUserId(req.params.id);

  if (userId === null) {
    return res.status(400).json({ error: 'El parámetro ":id" debe ser un número entero.' });
  }

  const user = await getUserById(userId);

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

  try {
    const user = await createUser(req.body.name.trim(), req.body.email.trim());
    res.status(201).json(user);
  } catch (err) {
    if (err instanceof DuplicateEmailError) {
      return res.status(409).json({ error: err.message });
    }
    console.error('[error] createUser() falló en POST /users:', err.message);
    return res.status(500).json({ error: 'No se pudo persistir el cambio. Comprueba los permisos del archivo.' });
  }
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

  const existingUser = await getUserById(userId);

  if (!existingUser) {
    return res.status(404).json({ error: 'Usuario no encontrado.' });
  }

  try {
    const user = await updateUser(userId, req.body.name.trim(), req.body.email.trim());
    res.json(user);
  } catch (err) {
    if (err instanceof DuplicateEmailError) {
      return res.status(409).json({ error: err.message });
    }
    console.error('[error] updateUser() falló en PUT /users/:id:', err.message);
    return res.status(500).json({ error: 'No se pudo persistir el cambio. Comprueba los permisos del archivo.' });
  }
});

app.delete('/users/:id', async (req, res) => {
  const userId = parseUserId(req.params.id);

  if (userId === null) {
    return res.status(400).json({ error: 'El parámetro ":id" debe ser un número entero.' });
  }

  try {
    const deletedUser = await deleteUser(userId);

    if (!deletedUser) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    res.json({ message: 'Usuario eliminado correctamente.', user: deletedUser });
  } catch (err) {
    console.error('[error] deleteUser() falló en DELETE /users/:id:', err.message);
    return res.status(500).json({ error: 'No se pudo persistir el cambio. Comprueba los permisos del archivo.' });
  }
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
// Exportado para tests: permite a beforeEach reinicializar SQLite con initDb()
module.exports.initDb = initDb;

async function startServer() {
  await initDb();
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
