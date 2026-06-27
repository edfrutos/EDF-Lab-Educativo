'use strict';

const { readFileSync, existsSync } = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const BCRYPT_ROUNDS = 10;

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

async function seedAdminIfEmptyAccounts({ countAccounts, insertAccount }) {
  const count = await countAccounts();
  if (count > 0) {
    return;
  }

  const email = process.env.ADMIN_EMAIL || 'admin@lab.local';
  const password = process.env.ADMIN_PASSWORD || 'changeme';
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  await insertAccount(email, passwordHash);
  console.log('[seed] Cuenta operador creada');
}

function buildTenantSeedUsers(tenantSlug) {
  return [
    { name: 'John Doe', email: `john.${tenantSlug}@sandbox.lab.local` },
    { name: 'Jane Smith', email: `jane.${tenantSlug}@sandbox.lab.local` }
  ];
}

function seedTenantUsersSqlite(getDb, tenantId, tenantSlug) {
  const users = buildTenantSeedUsers(tenantSlug);
  const insert = getDb().prepare('INSERT INTO users (name, email, tenant_id) VALUES (?, ?, ?)');
  for (const user of users) {
    insert.run(user.name, user.email, tenantId);
  }
  return users.length;
}

async function seedTenantUsersPg(pool, tenantId, tenantSlug) {
  const users = buildTenantSeedUsers(tenantSlug);
  for (const user of users) {
    await pool.query(
      'INSERT INTO users (name, email, tenant_id) VALUES ($1, $2, $3)',
      [user.name, user.email, tenantId]
    );
  }
  return users.length;
}

module.exports = {
  DEFAULT_SEED,
  USERS_JSON_PATH,
  tryParseUsersJson,
  resolveSeedUsers,
  populateIfEmptySqlite,
  populateIfEmptyPg,
  seedAdminIfEmptyAccounts,
  seedTenantUsersSqlite,
  seedTenantUsersPg
};
