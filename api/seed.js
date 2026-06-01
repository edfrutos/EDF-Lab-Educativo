'use strict';

const { readFileSync, existsSync } = require('fs');
const path = require('path');

const USERS_JSON_PATH = path.join(__dirname, 'data', 'users.json');

const DEFAULT_SEED = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
];

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

function resolveSeedUsers() {
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

  return { users };
}

function populateIfEmptySqlite(getDb) {
  const database = getDb();
  const { count } = database.prepare('SELECT COUNT(*) AS count FROM users').get();
  if (count > 0) {
    return;
  }

  const { users } = resolveSeedUsers();
  const insert = database.prepare('INSERT INTO users (id, name, email) VALUES (?, ?, ?)');
  for (const user of users) {
    insert.run(user.id, user.name, user.email);
  }
}

async function populateIfEmptyPg(pool) {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM users');
  if (rows[0].count > 0) {
    return;
  }

  const { users } = resolveSeedUsers();
  for (const user of users) {
    await pool.query(
      'INSERT INTO users (id, name, email) VALUES ($1, $2, $3)',
      [user.id, user.name, user.email]
    );
  }

  await pool.query(
    `SELECT setval(
      pg_get_serial_sequence('users', 'id'),
      (SELECT COALESCE(MAX(id), 1) FROM users)
    )`
  );
}

module.exports = {
  DEFAULT_SEED,
  USERS_JSON_PATH,
  tryParseUsersJson,
  resolveSeedUsers,
  populateIfEmptySqlite,
  populateIfEmptyPg
};
