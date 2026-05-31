'use strict';

const { readFileSync } = require('fs');
const path = require('path');
const { Pool } = require('pg');

const SCHEMA_PATH = path.join(__dirname, 'schema.pg.sql');

class DuplicateEmailError extends Error {
  constructor() {
    super('Ya existe un usuario con ese email.');
    this.name = 'DuplicateEmailError';
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

  console.log('[db] Using PostgreSQL');
}

async function getAllUsers() {
  const { rows } = await pool.query(
    'SELECT id, name, email FROM users ORDER BY name'
  );
  return rows;
}

async function getUserById(id) {
  const { rows } = await pool.query(
    'SELECT id, name, email FROM users WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

async function createUser(name, email) {
  try {
    const { rows } = await pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id, name, email',
      [name, email]
    );
    return rows[0];
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw new DuplicateEmailError();
    }
    throw err;
  }
}

async function updateUser(id, name, email) {
  try {
    const { rowCount, rows } = await pool.query(
      'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING id, name, email',
      [name, email, id]
    );
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

async function deleteUser(id) {
  const user = await getUserById(id);
  if (!user) {
    return null;
  }
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
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
