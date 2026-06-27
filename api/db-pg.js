'use strict';

const { readFileSync } = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { populateIfEmptyPg, seedAdminIfEmptyAccounts, seedTenantUsersPg } = require('./seed');
const { migratePg } = require('./migrate-v30');

const SCHEMA_PATH = path.join(__dirname, 'schema.pg.sql');

class DuplicateEmailError extends Error {
  constructor() {
    super('Ya existe un usuario con ese email.');
    this.name = 'DuplicateEmailError';
  }
}

class DuplicateLearnerEmailError extends Error {
  constructor() {
    super('Ya existe una cuenta de alumno con ese email.');
    this.name = 'DuplicateLearnerEmailError';
  }
}

let pool = null;

function isUniqueViolation(err) {
  return err && err.code === '23505';
}

async function initDb(options = {}) {
  if (pool) {
    await pool.end();
    pool = null;
  }

  pool = new Pool({ connectionString: process.env.DATABASE_URL });

  const schema = readFileSync(SCHEMA_PATH, 'utf8');
  await pool.query(schema);
  await migratePg(pool);

  if (!options.skipSeed) {
    await populateIfEmptyPg(pool);
    await seedAdminIfEmptyAccounts({
      countAccounts: async () => {
        const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM accounts');
        return rows[0].count;
      },
      insertAccount: async (email, passwordHash) => {
        await pool.query(
          'INSERT INTO accounts (email, password_hash) VALUES ($1, $2)',
          [email, passwordHash]
        );
      }
    });
  }

  console.log('[db] Using PostgreSQL');
}

async function countAccounts() {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM accounts');
  return rows[0].count;
}

async function findAccountByEmail(email) {
  const { rows } = await pool.query(
    'SELECT id, email, password_hash FROM accounts WHERE email = $1',
    [email]
  );
  return rows[0] || null;
}

async function findAccountById(id) {
  const { rows } = await pool.query(
    'SELECT id, email, password_hash FROM accounts WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

async function insertAccount(email, passwordHash) {
  await pool.query(
    'INSERT INTO accounts (email, password_hash) VALUES ($1, $2)',
    [email, passwordHash]
  );
}

async function updateAccountPassword(id, passwordHash) {
  const { rowCount } = await pool.query(
    'UPDATE accounts SET password_hash = $1 WHERE id = $2',
    [passwordHash, id]
  );
  return rowCount > 0;
}

async function upsertRefreshToken(accountId, tokenHash) {
  await pool.query(
    `INSERT INTO account_refresh_tokens (account_id, token_hash)
     VALUES ($1, $2)
     ON CONFLICT (account_id) DO UPDATE
       SET token_hash = EXCLUDED.token_hash,
           created_at = NOW()`,
    [accountId, tokenHash]
  );
}

async function getRefreshTokenHashByAccountId(accountId) {
  const { rows } = await pool.query(
    'SELECT token_hash FROM account_refresh_tokens WHERE account_id = $1',
    [accountId]
  );
  return rows[0]?.token_hash || null;
}

async function deleteRefreshTokenByAccountId(accountId) {
  const { rowCount } = await pool.query(
    'DELETE FROM account_refresh_tokens WHERE account_id = $1',
    [accountId]
  );
  return rowCount > 0;
}

async function resetUsersForTests() {
  if (!pool) {
    throw new Error('Pool no inicializado. Llama a initDb() antes de resetUsersForTests().');
  }
  await pool.query('TRUNCATE users RESTART IDENTITY');
}

async function getAllUsers(tenantId = null) {
  const { rows } = tenantId
    ? await pool.query(
      'SELECT id, name, email FROM users WHERE tenant_id = $1 ORDER BY name',
      [tenantId]
    )
    : await pool.query('SELECT id, name, email FROM users WHERE tenant_id IS NULL ORDER BY name');
  return rows;
}

async function getUserById(id, tenantId = null) {
  const { rows } = tenantId
    ? await pool.query(
      'SELECT id, name, email FROM users WHERE id = $1 AND tenant_id = $2',
      [id, tenantId]
    )
    : await pool.query(
      'SELECT id, name, email FROM users WHERE id = $1 AND tenant_id IS NULL',
      [id]
    );
  return rows[0] || null;
}

async function createUser(name, email, tenantId = null) {
  try {
    const { rows } = await pool.query(
      'INSERT INTO users (name, email, tenant_id) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, tenantId]
    );
    return rows[0];
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw new DuplicateEmailError();
    }
    throw err;
  }
}

async function updateUser(id, name, email, tenantId = null) {
  try {
    const query = tenantId
      ? 'UPDATE users SET name = $1, email = $2 WHERE id = $3 AND tenant_id = $4 RETURNING id, name, email'
      : 'UPDATE users SET name = $1, email = $2 WHERE id = $3 AND tenant_id IS NULL RETURNING id, name, email';
    const params = tenantId ? [name, email, id, tenantId] : [name, email, id];
    const { rowCount, rows } = await pool.query(query, params);
    if (rowCount === 0) {
      return null;
    }
    return rows[0];
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw new DuplicateEmailError();
    }
    throw err;
  }
}

async function deleteUser(id, tenantId = null) {
  const user = await getUserById(id, tenantId);
  if (!user) {
    return null;
  }
  if (tenantId) {
    await pool.query('DELETE FROM users WHERE id = $1 AND tenant_id = $2', [id, tenantId]);
  } else {
    await pool.query('DELETE FROM users WHERE id = $1 AND tenant_id IS NULL', [id]);
  }
  return user;
}

async function findLearnerByEmail(email) {
  const { rows } = await pool.query(
    'SELECT id, email, password_hash, tenant_id, tenant_slug, seeded_user_count FROM learners WHERE email = $1',
    [email]
  );
  return rows[0] || null;
}

async function findLearnerById(id) {
  const { rows } = await pool.query(
    'SELECT id, email, password_hash, tenant_id, tenant_slug, seeded_user_count FROM learners WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

async function insertLearner(email, passwordHash, tenantId, tenantSlug, seededUserCount) {
  try {
    const { rows } = await pool.query(
      `INSERT INTO learners (email, password_hash, tenant_id, tenant_slug, seeded_user_count)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, password_hash, tenant_id, tenant_slug, seeded_user_count`,
      [email, passwordHash, tenantId, tenantSlug, seededUserCount]
    );
    return rows[0];
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw new DuplicateLearnerEmailError();
    }
    throw err;
  }
}

async function listLearningProgress(learnerId) {
  const { rows } = await pool.query(
    'SELECT mission_id, step_id, completed_at FROM learning_progress WHERE learner_id = $1',
    [learnerId]
  );
  return rows;
}

async function upsertLearningProgress(learnerId, missionId, stepId) {
  await pool.query(
    `INSERT INTO learning_progress (learner_id, mission_id, step_id)
     VALUES ($1, $2, $3)
     ON CONFLICT (learner_id, mission_id, step_id) DO UPDATE SET completed_at = NOW()`,
    [learnerId, missionId, stepId]
  );
}

async function registerLearnerAccount(email, passwordHash, tenantId, tenantSlug) {
  const seededUserCount = await seedTenantUsersPg(pool, tenantId, tenantSlug);
  return insertLearner(email, passwordHash, tenantId, tenantSlug, seededUserCount);
}

module.exports = {
  DuplicateEmailError,
  DuplicateLearnerEmailError,
  initDb,
  resetUsersForTests,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  findLearnerByEmail,
  findLearnerById,
  registerLearnerAccount,
  listLearningProgress,
  upsertLearningProgress,
  countAccounts,
  findAccountByEmail,
  findAccountById,
  insertAccount,
  updateAccountPassword,
  upsertRefreshToken,
  getRefreshTokenHashByAccountId,
  deleteRefreshTokenByAccountId
};
