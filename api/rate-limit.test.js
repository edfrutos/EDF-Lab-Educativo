'use strict';

// CRÍTICO: env de rate limit y DB_FILE antes del require de index.js
// (mismo patrón que index.test.js — el limiter lee env al cargar el módulo).

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { unlink } = require('fs/promises');
const path = require('path');

const TEST_DB = path.join(__dirname, 'data', 'users.rate-limit.test.db');
process.env.DB_FILE = TEST_DB;
delete process.env.DATABASE_URL;
process.env.LOGIN_RATE_LIMIT_MAX = '2';
process.env.LOGIN_RATE_LIMIT_WINDOW_MS = '60000';

const app = require('./index.js');
const request = require('supertest');

beforeEach(async () => {
  await unlink(TEST_DB).catch(() => {});
  await app.initDb();
});

afterEach(async () => {
  await unlink(TEST_DB).catch(() => {});
});

describe('Rate limiting POST /auth/login', () => {
  it('responde 429 tras superar LOGIN_RATE_LIMIT_MAX', async () => {
    const payload = { email: 'nobody@example.com', password: 'wrong' };

    await request(app).post('/auth/login').send(payload);
    await request(app).post('/auth/login').send(payload);

    const res = await request(app).post('/auth/login').send(payload);

    assert.equal(res.status, 429);
    assert.match(res.body.error, /intentos/i);
  });
});
