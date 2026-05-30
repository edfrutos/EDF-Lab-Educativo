'use strict';

const { readFileSync, existsSync } = require('fs');
const { mkdir } = require('fs/promises');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE_PATH = process.env.DB_FILE
  ? path.resolve(process.env.DB_FILE)
  : path.join(DATA_DIR, 'users.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');
const USERS_JSON_PATH = path.join(__dirname, 'data', 'users.json');

const DEFAULT_SEED = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
];

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

function tryParseUsersJson() {
  if (!existsSync(USERS_JSON_PATH)) {
    return [];
  }

  try {
    const raw = readFileSync(USERS_JSON_PATH, 'utf8');
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.users)) {
      return null;
    }
    return data.users.filter(
      (u) => u && typeof u.id === 'number' && typeof u.name === 'string' && typeof u.email === 'string'
    );
  } catch {
    return null;
  }
}

function insertUsers(users) {
  const database = getDb();
  const insert = database.prepare('INSERT INTO users (id, name, email) VALUES (?, ?, ?)');
  for (const user of users) {
    insert.run(user.id, user.name, user.email);
  }
}

function populateIfEmpty() {
  const database = getDb();
  const { count } = database.prepare('SELECT COUNT(*) AS count FROM users').get();
  if (count > 0) {
    return;
  }

  const fromJson = tryParseUsersJson();
  let users;

  if (fromJson === null) {
    console.warn('[warn] data/users.json corrupto — restaurando semilla');
    users = DEFAULT_SEED;
  } else if (fromJson.length === 0) {
    users = DEFAULT_SEED;
  } else {
    console.log(`Migrados ${fromJson.length} usuarios desde users.json`);
    users = fromJson;
  }

  insertUsers(users);
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
    populateIfEmpty();
  }
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
  deleteUser
};
