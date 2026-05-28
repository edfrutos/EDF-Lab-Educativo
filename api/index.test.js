'use strict';

// ─── Setup ───────────────────────────────────────────────────────────────────
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

// Semilla controlada: 2 usuarios conocidos, nextId=3.
// NO se usa copyFile(users.json) porque ese archivo tiene 3 usuarios (estado Fase 2).
const TEST_SEED = {
  users: [
    { id: 1, name: 'John Doe',   email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ],
  nextId: 3
};

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

// ── GET /health ───────────────────────────────────────────────────────────────

describe('GET /health', () => {
  it('responde 200 con status healthy y timestamp', async () => {
    // Arrange — fixture listo por beforeEach
    // Act
    const res = await request(app).get('/health');
    // Assert
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'healthy');
    assert.ok(typeof res.body.timestamp === 'string', 'timestamp debe ser string');
  });
});

// ── GET /users ────────────────────────────────────────────────────────────────

describe('GET /users', () => {
  it('responde 200 con array de usuarios ordenados por nombre', async () => {
    // Arrange — fixture con John Doe (id=1) y Jane Smith (id=2)
    // Act
    const res = await request(app).get('/users');
    // Assert
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body), 'la respuesta debe ser un array');
    assert.equal(res.body.length, 2);
    // getSortedUsers() aplica _.sortBy(users, 'name') — Jane precede a John
    assert.equal(res.body[0].name, 'Jane Smith');
    assert.equal(res.body[1].name, 'John Doe');
  });
});

// ── POST /users ───────────────────────────────────────────────────────────────

describe('POST /users', () => {
  it('crea un usuario válido y responde 201 con el objeto creado', async () => {
    // Arrange
    const payload = { name: 'Nueva Persona', email: 'nueva@example.com' };
    // Act
    const res = await request(app).post('/users').send(payload);
    // Assert
    assert.equal(res.status, 201);
    assert.equal(res.body.name, payload.name);
    assert.equal(res.body.email, payload.email);
    assert.ok(typeof res.body.id === 'number', 'id debe ser número');
  });

  it('responde 400 si name está vacío', async () => {
    // Arrange
    const payload = { name: '', email: 'x@example.com' };
    // Act
    const res = await request(app).post('/users').send(payload);
    // Assert
    assert.equal(res.status, 400);
    assert.equal(res.body.error, 'El campo "name" es obligatorio y debe ser texto.');
  });

  it('responde 400 si email está vacío', async () => {
    // Arrange
    const payload = { name: 'Alguien', email: '' };
    // Act
    const res = await request(app).post('/users').send(payload);
    // Assert
    assert.equal(res.status, 400);
    assert.equal(res.body.error, 'El campo "email" es obligatorio y debe ser texto.');
  });
});

// ── PUT /users/:id ────────────────────────────────────────────────────────────

describe('PUT /users/:id', () => {
  it('actualiza un usuario existente y responde 200 con el objeto actualizado', async () => {
    // Arrange
    const payload = { name: 'John Updated', email: 'john.new@example.com' };
    // Act
    const res = await request(app).put('/users/1').send(payload);
    // Assert
    assert.equal(res.status, 200);
    assert.equal(res.body.id, 1);
    assert.equal(res.body.name, payload.name);
    assert.equal(res.body.email, payload.email);
  });

  it('responde 404 si el usuario no existe', async () => {
    // Arrange
    const payload = { name: 'Alguien', email: 'x@example.com' };
    // Act
    const res = await request(app).put('/users/99').send(payload);
    // Assert
    assert.equal(res.status, 404);
    assert.equal(res.body.error, 'Usuario no encontrado.');
  });
});

// ── DELETE /users/:id ─────────────────────────────────────────────────────────

describe('DELETE /users/:id', () => {
  it('elimina un usuario existente y responde 200 con mensaje y datos del usuario', async () => {
    // Arrange — fixture tiene usuario con id=1 (John Doe)
    // Act
    const res = await request(app).delete('/users/1');
    // Assert
    assert.equal(res.status, 200);
    assert.equal(res.body.message, 'Usuario eliminado correctamente.');
    assert.equal(res.body.user.id, 1);
    assert.equal(res.body.user.name, 'John Doe');
  });

  it('responde 404 si el usuario no existe', async () => {
    // Arrange
    // Act
    const res = await request(app).delete('/users/99');
    // Assert
    assert.equal(res.status, 404);
    assert.equal(res.body.error, 'Usuario no encontrado.');
  });
});

// ── Validación de IDs (TEST-04) ───────────────────────────────────────────────
// Cubre los tres tipos de ID inválido: string con prefijo numérico, cero, y string puro.

describe('Validación de IDs', () => {
  it('GET /users/1abc responde 400 (string con prefijo numérico)', async () => {
    // Arrange — (sin fixture especial; el handler rechaza antes de buscar en datos)
    // Act
    const res = await request(app).get('/users/1abc');
    // Assert
    assert.equal(res.status, 400);
    assert.equal(res.body.error, 'El parámetro ":id" debe ser un número entero.');
  });

  it('GET /users/0 responde 400 (cero no es ID válido)', async () => {
    // Act
    const res = await request(app).get('/users/0');
    // Assert
    assert.equal(res.status, 400);
    assert.equal(res.body.error, 'El parámetro ":id" debe ser un número entero.');
  });

  it('GET /users/abc responde 400 (string no numérico)', async () => {
    // Act
    const res = await request(app).get('/users/abc');
    // Assert
    assert.equal(res.status, 400);
    assert.equal(res.body.error, 'El parámetro ":id" debe ser un número entero.');
  });
});
