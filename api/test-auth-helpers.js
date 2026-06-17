'use strict';

const ADMIN_EMAIL = 'admin@lab.local';
const ADMIN_PASSWORD = 'changeme';
const ADMIN_PASSWORD_NEXT = 'changeme-2026';

function cookieByNameFromResponse(res, name) {
  const raw = res.headers['set-cookie'];
  if (!raw) {
    return null;
  }
  const values = Array.isArray(raw) ? raw : [raw];
  for (const entry of values) {
    const cookie = String(entry).split(';')[0];
    if (cookie.startsWith(`${name}=`)) {
      return cookie;
    }
  }
  return null;
}

function sessionCookieFromResponse(res) {
  return cookieByNameFromResponse(res, 'edf_session');
}

function refreshCookieFromResponse(res) {
  return cookieByNameFromResponse(res, 'edf_refresh');
}

function oauthStateCookieFromResponse(res) {
  return cookieByNameFromResponse(res, 'edf_oauth_state');
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
      const sessionCookie = sessionCookieFromResponse(res);
      const refreshCookie = refreshCookieFromResponse(res);
      assert.ok(sessionCookie && sessionCookie.includes('edf_session='), 'debe incluir cookie de sesión');
      assert.ok(refreshCookie && refreshCookie.includes('edf_refresh='), 'debe incluir cookie de refresh');
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

    it('GET /auth/oauth/start devuelve state y cookie oauth', async () => {
      const res = await request(app).get('/auth/oauth/start?provider=mock');
      assert.equal(res.status, 200);
      assert.equal(res.body.provider, 'mock');
      assert.ok(typeof res.body.state === 'string' && res.body.state.length > 0);
      assert.match(res.body.authUrl, /\/auth\/oauth\/callback\?/);
      const stateCookie = oauthStateCookieFromResponse(res);
      assert.ok(stateCookie && stateCookie.includes('edf_oauth_state='), 'debe incluir cookie oauth state');
    });

    it('GET /auth/oauth/callback con state inválido responde 400', async () => {
      const start = await request(app).get('/auth/oauth/start?provider=mock');
      const stateCookie = oauthStateCookieFromResponse(start);
      const res = await request(app)
        .get('/auth/oauth/callback?provider=mock&code=mock-admin&state=state-invalido')
        .set('Cookie', stateCookie);
      assert.equal(res.status, 400);
      assert.equal(res.body.error, 'State OAuth inválido o ausente.');
    });

    it('GET /auth/oauth/callback válido emite sesión usable para /users', async () => {
      const start = await request(app).get('/auth/oauth/start?provider=mock');
      const stateCookie = oauthStateCookieFromResponse(start);
      const callback = await request(app)
        .get(`/auth/oauth/callback?provider=mock&code=mock-admin&state=${encodeURIComponent(start.body.state)}`)
        .set('Cookie', stateCookie);
      assert.equal(callback.status, 200);
      assert.equal(callback.body.email, ADMIN_EMAIL);
      const sessionCookie = sessionCookieFromResponse(callback);
      assert.ok(sessionCookie, 'debe emitir sesión');

      const users = await request(app).get('/users').set('Cookie', sessionCookie);
      assert.equal(users.status, 200);
      assert.ok(Array.isArray(users.body));
    });

    it('POST /auth/refresh sin cookie responde 401', async () => {
      const res = await request(app).post('/auth/refresh');
      assert.equal(res.status, 401);
      assert.match(res.body.error, /refresh token/i);
    });

    it('POST /auth/refresh válido rota refresh token', async () => {
      const login = await request(app)
        .post('/auth/login')
        .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
      const previousRefreshCookie = refreshCookieFromResponse(login);
      assert.ok(previousRefreshCookie, 'debe existir refresh cookie en login');

      const refresh = await request(app)
        .post('/auth/refresh')
        .set('Cookie', previousRefreshCookie);
      assert.equal(refresh.status, 200);
      assert.equal(refresh.body.message, 'Sesión renovada');

      const nextRefreshCookie = refreshCookieFromResponse(refresh);
      const nextSessionCookie = sessionCookieFromResponse(refresh);
      assert.ok(nextSessionCookie, 'debe incluir nueva sesión');
      assert.ok(nextRefreshCookie, 'debe incluir refresh rotado');
      assert.notEqual(nextRefreshCookie, previousRefreshCookie, 'refresh token debe rotar');
    });

    it('POST /auth/refresh con token reusado responde 401', async () => {
      const login = await request(app)
        .post('/auth/login')
        .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
      const previousRefreshCookie = refreshCookieFromResponse(login);
      assert.ok(previousRefreshCookie, 'debe existir refresh cookie en login');

      const firstRefresh = await request(app)
        .post('/auth/refresh')
        .set('Cookie', previousRefreshCookie);
      assert.equal(firstRefresh.status, 200);

      const reused = await request(app)
        .post('/auth/refresh')
        .set('Cookie', previousRefreshCookie);
      assert.equal(reused.status, 401);
      assert.match(reused.body.error, /refresh token/i);
    });

    it('POST /auth/logout invalida también el refresh token', async () => {
      const agent = request.agent(app);
      const login = await agent
        .post('/auth/login')
        .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
      assert.equal(login.status, 200);

      const logout = await agent.post('/auth/logout');
      assert.equal(logout.status, 200);

      const refresh = await agent.post('/auth/refresh');
      assert.equal(refresh.status, 401);
    });

    it('PATCH /auth/password sin cookie responde 401', async () => {
      const res = await request(app)
        .patch('/auth/password')
        .send({ currentPassword: ADMIN_PASSWORD, newPassword: ADMIN_PASSWORD_NEXT });
      assert.equal(res.status, 401);
    });

    it('PATCH /auth/password valida payload requerido', async () => {
      const login = await request(app)
        .post('/auth/login')
        .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
      const cookie = sessionCookieFromResponse(login);

      const res = await request(app)
        .patch('/auth/password')
        .set('Cookie', cookie)
        .send({ currentPassword: '', newPassword: '' });
      assert.equal(res.status, 400);
      assert.equal(res.body.error, 'Los campos "currentPassword" y "newPassword" son obligatorios.');
    });

    it('PATCH /auth/password rechaza nueva contraseña corta', async () => {
      const login = await request(app)
        .post('/auth/login')
        .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
      const cookie = sessionCookieFromResponse(login);

      const res = await request(app)
        .patch('/auth/password')
        .set('Cookie', cookie)
        .send({ currentPassword: ADMIN_PASSWORD, newPassword: '1234567' });
      assert.equal(res.status, 400);
      assert.equal(res.body.error, 'La nueva contraseña debe tener al menos 8 caracteres.');
    });

    it('PATCH /auth/password rechaza contraseña actual incorrecta', async () => {
      const login = await request(app)
        .post('/auth/login')
        .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
      const cookie = sessionCookieFromResponse(login);

      const res = await request(app)
        .patch('/auth/password')
        .set('Cookie', cookie)
        .send({ currentPassword: 'wrong-password', newPassword: ADMIN_PASSWORD_NEXT });
      assert.equal(res.status, 403);
      assert.equal(res.body.error, 'La contraseña actual es incorrecta.');
    });

    it('PATCH /auth/password actualiza contraseña y cambia el resultado de login', async () => {
      const login = await request(app)
        .post('/auth/login')
        .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
      const cookie = sessionCookieFromResponse(login);

      const change = await request(app)
        .patch('/auth/password')
        .set('Cookie', cookie)
        .send({ currentPassword: ADMIN_PASSWORD, newPassword: ADMIN_PASSWORD_NEXT });
      assert.equal(change.status, 200);
      assert.equal(change.body.message, 'Contraseña actualizada correctamente.');

      const oldLogin = await request(app)
        .post('/auth/login')
        .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
      assert.equal(oldLogin.status, 403);
      assert.equal(oldLogin.body.error, 'Credenciales inválidas');

      const newLogin = await request(app)
        .post('/auth/login')
        .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD_NEXT });
      assert.equal(newLogin.status, 200);
      assert.equal(newLogin.body.email, ADMIN_EMAIL);
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
  refreshCookieFromResponse,
  registerAuthApiTests
};
