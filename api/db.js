'use strict';

const { readFileSync } = require('fs');
const { mkdir } = require('fs/promises');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE_PATH = process.env.DB_FILE
  ? path.resolve(process.env.DB_FILE)
  : path.join(DATA_DIR, 'users.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

let db = null;

function getDb() {
  if (!db) {
    throw new Error('Base de datos no inicializada. Llama a initDb() antes de usar la API.');
  }
  return db;
}

function seedIfEmpty() {
  const database = getDb();
  const { count } = database.prepare('SELECT COUNT(*) AS count FROM users').get();
  if (count > 0) {
    return;
  }

  const insert = database.prepare('INSERT INTO users (name, email) VALUES (?, ?)');
  insert.run('John Doe', 'john@example.com');
  insert.run('Jane Smith', 'jane@example.com');
}

async function initDb() {
  if (db) {
    db.close();
    db = null;
  }

  await mkdir(DATA_DIR, { recursive: true });
  db = new DatabaseSync(DB_FILE_PATH);

  const schema = readFileSync(SCHEMA_PATH, 'utf8');
  db.exec(schema);
  seedIfEmpty();
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
  const result = stmt.run(name, email);
  return {
    id: Number(result.lastInsertRowid),
    name,
    email
  };
}

async function updateUser(id, name, email) {
  const database = getDb();
  const stmt = database.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?');
  const result = stmt.run(name, email, id);
  if (result.changes === 0) {
    return null;
  }
  return { id, name, email };
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
  initDb,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
