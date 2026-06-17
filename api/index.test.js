'use strict';

// ─── Setup ───────────────────────────────────────────────────────────────────
// CRÍTICO: DB_FILE debe asignarse ANTES del require de index.js.
// Node.js cachea módulos en el primer require — si index.js se importa antes
// de setear la variable, la ruta SQLite quedará con el valor por defecto.
// AUTH_DISABLED=1 desactiva requireAuth solo en tests CRUD (no en describe Autenticación).

const { describe, it, before, after, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { unlink } = require('fs/promises');
const path = require('path');

const TEST_DB = path.join(__dirname, 'data', 'users.test.db');
process.env.DB_FILE = TEST_DB;
// Tests SQLite: no usar Postgres aunque DATABASE_URL esté en el shell o en Compose.
delete process.env.DATABASE_URL;
process.env.AUTH_DISABLED = '1';
process.env.LOGIN_RATE_LIMIT_MAX = '1000';

const app = require('./index.js');
const request = require('supertest');
const { registerAuthApiTests } = require('./test-auth-helpers');

beforeEach(async () => {
  // Arrange: base SQLite limpia antes de cada test; initDb() aplica schema + semilla.
  await unlink(TEST_DB).catch(() => {});
  await app.initDb();
});

afterEach(async () => {
  await unlink(TEST_DB).catch(() => {});
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
    // Arrange — semilla SQLite con John Doe (id=1) y Jane Smith (id=2)
    // Act
    const res = await request(app).get('/users');
    // Assert
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body), 'la respuesta debe ser un array');
    assert.equal(res.body.length, 2);
    // ORDER BY name — Jane precede a John
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
    // Arrange — semilla SQLite tiene usuario con id=1 (John Doe)
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

// ── Base de datos vacía ───────────────────────────────────────────────────────

describe('Base de datos vacía', () => {
  it('GET /users responde 200 con array vacío', async () => {
    // Arrange — BD sin semilla
    await unlink(TEST_DB).catch(() => {});
    await app.initDb({ skipSeed: true });
    // Act
    const res = await request(app).get('/users');
    // Assert
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.equal(res.body.length, 0);
  });
});

// ── Email duplicado ─────────────────────────────────────────────────────────────

describe('Email duplicado', () => {
  it('POST /users responde 409 si el email ya existe', async () => {
    // Arrange — semilla incluye john@example.com
    const payload = { name: 'Otro John', email: 'john@example.com' };
    // Act
    const res = await request(app).post('/users').send(payload);
    // Assert
    assert.equal(res.status, 409);
    assert.equal(res.body.error, 'Ya existe un usuario con ese email.');
  });

  it('PUT /users/:id responde 409 si el email pertenece a otro usuario', async () => {
    // Arrange — id=1 es John; jane@example.com pertenece a id=2
    const payload = { name: 'John Doe', email: 'jane@example.com' };
    // Act
    const res = await request(app).put('/users/1').send(payload);
    // Assert
    assert.equal(res.status, 409);
    assert.equal(res.body.error, 'Ya existe un usuario con ese email.');
  });

  it('PUT /users/:id responde 200 si mantiene su propio email', async () => {
    // Arrange
    const payload = { name: 'John Renombrado', email: 'john@example.com' };
    // Act
    const res = await request(app).put('/users/1').send(payload);
    // Assert
    assert.equal(res.status, 200);
    assert.equal(res.body.name, 'John Renombrado');
    assert.equal(res.body.email, 'john@example.com');
  });
});

registerAuthApiTests({ describe, it, before, after, assert, app, request });
