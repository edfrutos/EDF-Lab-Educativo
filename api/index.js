const express = require('express');
const cors = require('cors');
const _ = require('lodash');

const app = express();
const PORT = process.env.PORT || 3000;
let users = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
];
let nextUserId = 3;

// Middleware
app.use(cors());
app.use(express.json());

function getSortedUsers() {
  return _.sortBy(users, 'name');
}

function parseUserId(value) {
  const id = Number.parseInt(value, 10);

  return Number.isInteger(id) ? id : null;
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

app.post('/users', (req, res) => {
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

  res.status(201).json(user);
});

app.put('/users/:id', (req, res) => {
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

  users[userIndex] = {
    id: userId,
    name: req.body.name.trim(),
    email: req.body.email.trim()
  };

  res.json(users[userIndex]);
});

app.delete('/users/:id', (req, res) => {
  const userId = parseUserId(req.params.id);

  if (userId === null) {
    return res.status(400).json({ error: 'El parámetro ":id" debe ser un número entero.' });
  }

  const userIndex = findUserIndexById(userId);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'Usuario no encontrado.' });
  }

  const [deletedUser] = users.splice(userIndex, 1);

  res.json({
    message: 'Usuario eliminado correctamente.',
    user: deletedUser
  });
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

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
