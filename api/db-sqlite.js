'use strict';

const { readFileSync } = require('fs');
const { mkdir } = require('fs/promises');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const { populateIfEmptySqlite, seedAdminIfEmptyAccounts } = require('./seed');

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
    .prepare('SELECT id, email, password_hash FROM accounts WHERE email = ?')
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

async function getAllUsers() {
  return getDb()
    .prepare('SELECT id, name, email FROM users ORDER BY name')
    .all();
}

async function getUserById(id) {
  return getDb()
    .prepare('SELECT id, name, email FROM users WHERE id = ?')
    .get(id);
}

async function createUser(name, email) {
  const database = getDb();
  const stmt = database.prepare('INSERT INTO users (name, email) VALUES (?, ?)');
  try {
    const result = stmt.run(name, email);
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

async function updateUser(id, name, email) {
  const database = getDb();
  const stmt = database.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?');
  try {
    const result = stmt.run(name, email, id);
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

async function deleteUser(id) {
  const user = await getUserById(id);
  if (!user) {
    return null;
  }
  getDb().prepare('DELETE FROM users WHERE id = ?').run(id);
  return user;
}

module.exports = {
  DuplicateEmailError,
  initDb,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  countAccounts,
  findAccountByEmail,
  findAccountById,
  insertAccount,
  updateAccountPassword,
  upsertRefreshToken,
  getRefreshTokenHashByAccountId,
  deleteRefreshTokenByAccountId
};
