'use strict';

// ─── Setup ───────────────────────────────────────────────────────────────────
// CRÍTICO: DATABASE_URL debe asignarse ANTES del require de index.js.
// Node.js cachea módulos en el primer require — el router db.js elige Postgres
// solo si DATABASE_URL está definida en ese momento.
// AUTH_DISABLED=1 desactiva requireAuth solo en tests CRUD (no en describe Autenticación).

const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

const DEFAULT_TEST_URL =
  'postgresql://edf_lab:edf_lab_dev@localhost:5432/edf_lab_test';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || DEFAULT_TEST_URL;
delete process.env.DB_FILE;
process.env.AUTH_DISABLED = '1';
process.env.LOGIN_RATE_LIMIT_MAX = '1000';

const app = require('./index.js');
const request = require('supertest');
const { registerAuthApiTests } = require('./test-auth-helpers');
const { resetUsersForTests } = require('./db-pg');

beforeEach(async () => {
  await app.initDb();
  await resetUsersForTests();
  await app.initDb();
});

// ── GET /health ───────────────────────────────────────────────────────────────

describe('GET /health', () => {
  it('responde 200 con status healthy y timestamp', async () => {
    const res = await request(app).get('/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'healthy');
    assert.ok(typeof res.body.timestamp === 'string', 'timestamp debe ser string');
  });
});

// ── GET /users ────────────────────────────────────────────────────────────────

describe('GET /users', () => {
  it('responde 200 con array de usuarios ordenados por nombre', async () => {
    const res = await request(app).get('/users');
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body), 'la respuesta debe ser un array');
    assert.equal(res.body.length, 2);
    assert.equal(res.body[0].name, 'Jane Smith');
    assert.equal(res.body[1].name, 'John Doe');
  });
});

// ── POST /users ───────────────────────────────────────────────────────────────

describe('POST /users', () => {
  it('crea un usuario válido y responde 201 con el objeto creado', async () => {
    const payload = { name: 'Nueva Persona', email: 'nueva@example.com' };
    const res = await request(app).post('/users').send(payload);
    assert.equal(res.status, 201);
    assert.equal(res.body.name, payload.name);
    assert.equal(res.body.email, payload.email);
    assert.ok(typeof res.body.id === 'number', 'id debe ser número');
  });

  it('responde 400 si name está vacío', async () => {
    const payload = { name: '', email: 'x@example.com' };
    const res = await request(app).post('/users').send(payload);
    assert.equal(res.status, 400);
    assert.equal(res.body.error, 'El campo "name" es obligatorio y debe ser texto.');
  });

  it('responde 400 si email está vacío', async () => {
    const payload = { name: 'Alguien', email: '' };
    const res = await request(app).post('/users').send(payload);
    assert.equal(res.status, 400);
    assert.equal(res.body.error, 'El campo "email" es obligatorio y debe ser texto.');
  });
});

// ── PUT /users/:id ────────────────────────────────────────────────────────────

describe('PUT /users/:id', () => {
  it('actualiza un usuario existente y responde 200 con el objeto actualizado', async () => {
    const payload = { name: 'John Updated', email: 'john.new@example.com' };
    const res = await request(app).put('/users/1').send(payload);
    assert.equal(res.status, 200);
    assert.equal(res.body.id, 1);
    assert.equal(res.body.name, payload.name);
    assert.equal(res.body.email, payload.email);
  });

  it('responde 404 si el usuario no existe', async () => {
    const payload = { name: 'Alguien', email: 'x@example.com' };
    const res = await request(app).put('/users/99').send(payload);
    assert.equal(res.status, 404);
    assert.equal(res.body.error, 'Usuario no encontrado.');
  });
});

// ── DELETE /users/:id ─────────────────────────────────────────────────────────

describe('DELETE /users/:id', () => {
  it('elimina un usuario existente y responde 200 con mensaje y datos del usuario', async () => {
    const res = await request(app).delete('/users/1');
    assert.equal(res.status, 200);
    assert.equal(res.body.message, 'Usuario eliminado correctamente.');
    assert.equal(res.body.user.id, 1);
    assert.equal(res.body.user.name, 'John Doe');
  });

  it('responde 404 si el usuario no existe', async () => {
    const res = await request(app).delete('/users/99');
    assert.equal(res.status, 404);
    assert.equal(res.body.error, 'Usuario no encontrado.');
  });
});

// ── Validación de IDs ─────────────────────────────────────────────────────────

describe('Validación de IDs', () => {
  it('GET /users/1abc responde 400 (string con prefijo numérico)', async () => {
    const res = await request(app).get('/users/1abc');
    assert.equal(res.status, 400);
    assert.equal(res.body.error, 'El parámetro ":id" debe ser un número entero.');
  });

  it('GET /users/0 responde 400 (cero no es ID válido)', async () => {
    const res = await request(app).get('/users/0');
    assert.equal(res.status, 400);
    assert.equal(res.body.error, 'El parámetro ":id" debe ser un número entero.');
  });

  it('GET /users/abc responde 400 (string no numérico)', async () => {
    const res = await request(app).get('/users/abc');
    assert.equal(res.status, 400);
    assert.equal(res.body.error, 'El parámetro ":id" debe ser un número entero.');
  });
});

// ── Base de datos vacía ───────────────────────────────────────────────────────

describe('Base de datos vacía', () => {
  it('GET /users responde 200 con array vacío', async () => {
    await resetUsersForTests();
    await app.initDb({ skipSeed: true });
    const res = await request(app).get('/users');
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.equal(res.body.length, 0);
  });
});

// ── Email duplicado ─────────────────────────────────────────────────────────────

describe('Email duplicado', () => {
  it('POST /users responde 409 si el email ya existe', async () => {
    const payload = { name: 'Otro John', email: 'john@example.com' };
    const res = await request(app).post('/users').send(payload);
    assert.equal(res.status, 409);
    assert.equal(res.body.error, 'Ya existe un usuario con ese email.');
  });

  it('PUT /users/:id responde 409 si el email pertenece a otro usuario', async () => {
    const payload = { name: 'John Doe', email: 'jane@example.com' };
    const res = await request(app).put('/users/1').send(payload);
    assert.equal(res.status, 409);
    assert.equal(res.body.error, 'Ya existe un usuario con ese email.');
  });

  it('PUT /users/:id responde 200 si mantiene su propio email', async () => {
    const payload = { name: 'John Renombrado', email: 'john@example.com' };
    const res = await request(app).put('/users/1').send(payload);
    assert.equal(res.status, 200);
    assert.equal(res.body.name, 'John Renombrado');
    assert.equal(res.body.email, 'john@example.com');
  });
});

registerAuthApiTests({ describe, it, before, after, assert, app, request });
