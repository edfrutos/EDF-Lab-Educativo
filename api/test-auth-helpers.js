'use strict';

const ADMIN_EMAIL = 'admin@lab.local';
const ADMIN_PASSWORD = 'changeme';

function sessionCookieFromResponse(res) {
  const raw = res.headers['set-cookie'];
  if (!raw) {
    return null;
  }
  const first = Array.isArray(raw) ? raw[0] : String(raw).split(',')[0];
  return first.split(';')[0];
}

function registerAuthApiTests({ describe, it, before, after, assert, app, request }) {
  describe('Autenticación API', () => {
    before(() => {
      delete process.env.AUTH_DISABLED;
    });

    after(() => {
      process.env.AUTH_DISABLED = '1';
    });

    it('GET /users sin cookie responde 401', async () => {
      const res = await request(app).get('/users');
      assert.equal(res.status, 401);
      assert.match(res.body.error, /sesión/i);
    });

    it('POST /auth/login válido responde 200 y cookie edf_session', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
      assert.equal(res.status, 200);
      assert.equal(res.body.email, ADMIN_EMAIL);
      const cookie = sessionCookieFromResponse(res);
      assert.ok(cookie && cookie.includes('edf_session='), 'debe incluir cookie de sesión');
    });

    it('GET /users con cookie de login responde 200', async () => {
      const login = await request(app)
        .post('/auth/login')
        .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
      const cookie = sessionCookieFromResponse(login);
      const res = await request(app)
        .get('/users')
        .set('Cookie', cookie);
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body));
      assert.ok(res.body.length >= 2);
    });

    it('POST /auth/login con contraseña incorrecta responde 403', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: ADMIN_EMAIL, password: 'wrong-password' });
      assert.equal(res.status, 403);
      assert.equal(res.body.error, 'Credenciales inválidas');
    });

    it('POST /auth/logout invalida la sesión', async () => {
      const agent = request.agent(app);
      await agent
        .post('/auth/login')
        .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
      const logout = await agent.post('/auth/logout');
      assert.equal(logout.status, 200);
      const res = await agent.get('/users');
      assert.equal(res.status, 401);
    });

    it('GET /health sigue siendo público sin cookie', async () => {
      const res = await request(app).get('/health');
      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'healthy');
    });

    it('GET /users con cookie inválida responde 401', async () => {
      const res = await request(app)
        .get('/users')
        .set('Cookie', 'edf_session=token-invalido');
      assert.equal(res.status, 401);
    });
  });
}

module.exports = {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  sessionCookieFromResponse,
  registerAuthApiTests
};
