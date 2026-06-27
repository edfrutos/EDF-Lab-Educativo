'use strict';

function registerSchoolApiTests({ describe, it, before, after, assert, app, request }) {
  describe('Escuela v3.0a — registro y aprendizaje', () => {
    const learnerPassword = 'sandbox-99';

    before(() => {
      delete process.env.AUTH_DISABLED;
    });

    after(() => {
      process.env.AUTH_DISABLED = '1';
    });

    it('POST /auth/register crea alumno, tenant y cookie de sesión', async () => {
      const agent = request.agent(app);
      const res = await agent
        .post('/auth/register')
        .send({ email: `alumno-${Date.now()}@school.test`, password: learnerPassword });

      assert.equal(res.status, 201);
      assert.equal(res.body.role, 'learner');
      assert.ok(res.body.tenantSlug);
      assert.match(res.headers['set-cookie']?.join(';') || '', /edf_session=/);
    });

    it('GET /users del alumno solo ve usuarios de su tenant', async () => {
      const agent = request.agent(app);
      await agent.post('/auth/register').send({
        email: `aislado-${Date.now()}@school.test`,
        password: learnerPassword
      });

      const users = await agent.get('/users');
      assert.equal(users.status, 200);
      assert.ok(Array.isArray(users.body));
      assert.ok(users.body.length >= 2);
      assert.ok(users.body.every((user) => user.email.includes('@sandbox.lab.local')));
    });

    it('POST /learn/check valida paso crud tras crear usuario', async () => {
      const agent = request.agent(app);
      const register = await agent.post('/auth/register').send({
        email: `crud-${Date.now()}@school.test`,
        password: learnerPassword
      });

      await agent.post('/learn/check/connect/session');
      await agent.post('/learn/check/connect/health');
      await agent.post('/learn/check/json/meta');
      await agent.post('/learn/check/json/users');

      const beforeCreate = await agent.post('/learn/check/crud/create');
      assert.equal(beforeCreate.status, 400);

      await agent.post('/users').send({
        name: 'Alumno Nuevo',
        email: `nuevo.${register.body.tenantSlug}@sandbox.lab.local`
      });

      const afterCreate = await agent.post('/learn/check/crud/create');
      assert.equal(afterCreate.status, 200);
      assert.equal(afterCreate.body.passed, true);
    });

    it('POST /auth/login prioriza alumno si el email también existe como operador', async () => {
      const email = `dual-${Date.now()}@school.test`;
      const learnerPassword = 'alumno-pass-9';

      await request(app).post('/auth/register').send({ email, password: learnerPassword });

      const bcrypt = require('bcrypt');
      const { insertAccount } = require('./db-sqlite');
      const operatorHash = await bcrypt.hash('operador-9', 10);
      insertAccount(email, operatorHash);

      const learnerLogin = await request(app)
        .post('/auth/login')
        .send({ email, password: learnerPassword });

      assert.equal(learnerLogin.status, 200);
      assert.equal(learnerLogin.body.role, 'learner');
    });
  });
}

module.exports = {
  registerSchoolApiTests
};
