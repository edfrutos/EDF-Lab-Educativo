'use strict';

// ─── Setup ───────────────────────────────────────────────────────────────────
// CRÍTICO: variables de entorno ANTES del require de index.js (caché de módulos).

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { unlink } = require('fs/promises');
const path = require('path');

const TEST_DB = path.join(__dirname, 'data', 'users.auth.test.db');
process.env.DB_FILE = TEST_DB;
delete process.env.DATABASE_URL;
process.env.AUTH_ENABLED = 'true';
process.env.AUTH_USER = 'testadmin';
process.env.AUTH_PASSWORD = 'testpass';
process.env.JWT_SECRET = 'test-jwt-secret-for-auth-suite-32ch';

const app = require('./index.js');
const request = require('supertest');

beforeEach(async () => {
  await unlink(TEST_DB).catch(() => {});
  await app.initDb();
});

afterEach(async () => {
  await unlink(TEST_DB).catch(() => {});
});

async function loginToken(agent = request(app)) {
  const res = await agent
    .post('/auth/login')
    .send({ username: 'testadmin', password: 'testpass' });
  assert.equal(res.status, 200);
  assert.ok(res.body.token, 'debe devolver token');
  return res.body.token;
}

// ── POST /auth/login ──────────────────────────────────────────────────────────

describe('POST /auth/login', () => {
  it('responde 200 con token y expiresIn con credenciales válidas', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'testadmin', password: 'testpass' });

    assert.equal(res.status, 200);
    assert.ok(typeof res.body.token === 'string');
    assert.equal(res.body.expiresIn, 3600);
  });

  it('responde 401 con credenciales incorrectas', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'testadmin', password: 'wrong' });

    assert.equal(res.status, 401);
    assert.equal(res.body.error, 'Credenciales incorrectas.');
  });

  it('responde 400 si username está vacío', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ username: '', password: 'testpass' });

    assert.equal(res.status, 400);
    assert.equal(res.body.error, 'El campo "username" es obligatorio.');
  });
});

// ── Rutas protegidas ────────────────────────────────────────────────────────────

describe('Rutas /users con AUTH_ENABLED=true', () => {
  it('GET /users sin token responde 401', async () => {
    const res = await request(app).get('/users');
    assert.equal(res.status, 401);
    assert.equal(res.body.error, 'Token no proporcionado.');
  });

  it('GET /users con Bearer válido responde 200', async () => {
    const token = await loginToken();
    const res = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${token}`);

    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.equal(res.body.length, 2);
  });
});

// ── Rutas públicas ────────────────────────────────────────────────────────────

describe('Rutas públicas con AUTH_ENABLED=true', () => {
  it('GET /health sin token responde 200', async () => {
    const res = await request(app).get('/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'healthy');
  });
});

// ── Auth desactivada ──────────────────────────────────────────────────────────

describe('POST /auth/login con AUTH_ENABLED=false', () => {
  it('responde 404 cuando la autenticación está desactivada', async () => {
    const previous = process.env.AUTH_ENABLED;
    process.env.AUTH_ENABLED = 'false';

    delete require.cache[require.resolve('./auth')];
    delete require.cache[require.resolve('./index.js')];
    const appOff = require('./index.js');

    const res = await request(appOff)
      .post('/auth/login')
      .send({ username: 'testadmin', password: 'testpass' });

    assert.equal(res.status, 404);
    assert.match(res.body.error, /AUTH_ENABLED=false/);

    process.env.AUTH_ENABLED = previous;
    delete require.cache[require.resolve('./auth')];
    delete require.cache[require.resolve('./index.js')];
  });
});
