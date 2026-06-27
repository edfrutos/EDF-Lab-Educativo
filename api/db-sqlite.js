'use strict';

const { readFileSync } = require('fs');
const { mkdir } = require('fs/promises');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const { populateIfEmptySqlite, seedAdminIfEmptyAccounts, seedTenantUsersSqlite } = require('./seed');
const { migrateSqlite } = require('./migrate-v30');

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE_PATH = process.env.DB_FILE
  ? path.resolve(process.env.DB_FILE)
  : path.join(DATA_DIR, 'users.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

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

let db = null;

function getDb() {
  if (!db) {
    throw new Error('Base de datos no inicializada. Llama a initDb() antes de usar la API.');
  }
  return db;
}

function isUniqueConstraintError(err) {
  return err && (
    err.code === 'SQLITE_CONSTRAINT_UNIQUE'
    || /UNIQUE constraint failed/i.test(err.message)
  );
}

async function initDb(options = {}) {
  if (db) {
    db.close();
    db = null;
  }

  await mkdir(DATA_DIR, { recursive: true });
  db = new DatabaseSync(DB_FILE_PATH);

  const schema = readFileSync(SCHEMA_PATH, 'utf8');
  db.exec(schema);

  migrateSqlite(getDb);

  if (!options.skipSeed) {
    populateIfEmptySqlite(getDb);
    await seedAdminIfEmptyAccounts({
      countAccounts: () => getDb().prepare('SELECT COUNT(*) AS count FROM accounts').get().count,
      insertAccount: async (email, passwordHash) => {
        getDb().prepare('INSERT INTO accounts (email, password_hash) VALUES (?, ?)').run(email, passwordHash);
      }
    });
  }
}

function countAccounts() {
  return getDb().prepare('SELECT COUNT(*) AS count FROM accounts').get().count;
}

function findAccountByEmail(email) {
  const row = getDb()
    .prepare('SELECT id, email, password_hash FROM accounts WHERE lower(email) = lower(?)')
    .get(email);
  return row || null;
}

function findAccountById(id) {
  const row = getDb()
    .prepare('SELECT id, email, password_hash FROM accounts WHERE id = ?')
    .get(id);
  return row || null;
}

function insertAccount(email, passwordHash) {
  getDb().prepare('INSERT INTO accounts (email, password_hash) VALUES (?, ?)').run(email, passwordHash);
}

function updateAccountPassword(id, passwordHash) {
  const result = getDb()
    .prepare('UPDATE accounts SET password_hash = ? WHERE id = ?')
    .run(passwordHash, id);
  return result.changes > 0;
}

function upsertRefreshToken(accountId, tokenHash) {
  getDb().prepare(
    `INSERT INTO account_refresh_tokens (account_id, token_hash)
     VALUES (?, ?)
     ON CONFLICT(account_id) DO UPDATE SET
       token_hash = excluded.token_hash,
       created_at = datetime('now')`
  ).run(accountId, tokenHash);
}

function getRefreshTokenHashByAccountId(accountId) {
  const row = getDb()
    .prepare('SELECT token_hash FROM account_refresh_tokens WHERE account_id = ?')
    .get(accountId);
  return row?.token_hash || null;
}

function deleteRefreshTokenByAccountId(accountId) {
  const result = getDb()
    .prepare('DELETE FROM account_refresh_tokens WHERE account_id = ?')
    .run(accountId);
  return result.changes > 0;
}

function tenantClause(tenantId) {
  return tenantId ? 'tenant_id = ?' : 'tenant_id IS NULL';
}

async function getAllUsers(tenantId = null) {
  return getDb()
    .prepare(`SELECT id, name, email FROM users WHERE ${tenantClause(tenantId)} ORDER BY name`)
    .all(...(tenantId ? [tenantId] : []));
}

async function getUserById(id, tenantId = null) {
  return getDb()
    .prepare(`SELECT id, name, email FROM users WHERE id = ? AND ${tenantClause(tenantId)}`)
    .get(id, ...(tenantId ? [tenantId] : []));
}

async function createUser(name, email, tenantId = null) {
  const database = getDb();
  const stmt = database.prepare('INSERT INTO users (name, email, tenant_id) VALUES (?, ?, ?)');
  try {
    const result = stmt.run(name, email, tenantId);
    return {
      id: Number(result.lastInsertRowid),
      name,
      email
    };
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      throw new DuplicateEmailError();
    }
    throw err;
  }
}

async function updateUser(id, name, email, tenantId = null) {
  const database = getDb();
  const stmt = database.prepare(
    `UPDATE users SET name = ?, email = ? WHERE id = ? AND ${tenantClause(tenantId)}`
  );
  try {
    const params = tenantId ? [name, email, id, tenantId] : [name, email, id];
    const result = stmt.run(...params);
    if (result.changes === 0) {
      return null;
    }
    return { id, name, email };
  } catch (err) {
    if (isUniqueConstraintError(err)) {
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
  getDb()
    .prepare(`DELETE FROM users WHERE id = ? AND ${tenantClause(tenantId)}`)
    .run(...(tenantId ? [id, tenantId] : [id]));
  return user;
}

function findLearnerByEmail(email) {
  return getDb()
    .prepare(
      'SELECT id, email, password_hash, tenant_id, tenant_slug, seeded_user_count FROM learners WHERE lower(email) = lower(?)'
    )
    .get(email) || null;
}

function findLearnerById(id) {
  return getDb()
    .prepare('SELECT id, email, password_hash, tenant_id, tenant_slug, seeded_user_count FROM learners WHERE id = ?')
    .get(id) || null;
}

function insertLearner(email, passwordHash, tenantId, tenantSlug, seededUserCount) {
  try {
    const result = getDb()
      .prepare(
        `INSERT INTO learners (email, password_hash, tenant_id, tenant_slug, seeded_user_count)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(email, passwordHash, tenantId, tenantSlug, seededUserCount);
    return findLearnerById(Number(result.lastInsertRowid));
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      throw new DuplicateLearnerEmailError();
    }
    throw err;
  }
}

function listLearningProgress(learnerId) {
  return getDb()
    .prepare('SELECT mission_id, step_id, completed_at FROM learning_progress WHERE learner_id = ?')
    .all(learnerId);
}

function upsertLearningProgress(learnerId, missionId, stepId) {
  getDb()
    .prepare(
      `INSERT INTO learning_progress (learner_id, mission_id, step_id)
       VALUES (?, ?, ?)
       ON CONFLICT(learner_id, mission_id, step_id) DO UPDATE SET
         completed_at = datetime('now')`
    )
    .run(learnerId, missionId, stepId);
}

async function registerLearnerAccount(email, passwordHash, tenantId, tenantSlug) {
  const seededUserCount = seedTenantUsersSqlite(getDb, tenantId, tenantSlug);
  return insertLearner(email, passwordHash, tenantId, tenantSlug, seededUserCount);
}

module.exports = {
  DuplicateEmailError,
  DuplicateLearnerEmailError,
  initDb,
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
