'use strict';

function migrateSqlite(getDb) {
  const database = getDb();
  const userColumns = database.prepare('PRAGMA table_info(users)').all().map((column) => column.name);

  if (!userColumns.includes('tenant_id')) {
    database.exec('ALTER TABLE users ADD COLUMN tenant_id TEXT');
    database.exec('CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id)');
  }

  database.exec(`
    CREATE TABLE IF NOT EXISTS learners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      tenant_id TEXT NOT NULL UNIQUE,
      tenant_slug TEXT NOT NULL UNIQUE,
      seeded_user_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS learning_progress (
      learner_id INTEGER NOT NULL,
      mission_id TEXT NOT NULL,
      step_id TEXT NOT NULL,
      completed_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (learner_id, mission_id, step_id),
      FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE
    );
  `);
}

async function migratePg(pool) {
  await pool.query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_id TEXT;
    CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS learners (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      tenant_id TEXT NOT NULL UNIQUE,
      tenant_slug TEXT NOT NULL UNIQUE,
      seeded_user_count INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS learning_progress (
      learner_id INTEGER NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
      mission_id TEXT NOT NULL,
      step_id TEXT NOT NULL,
      completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (learner_id, mission_id, step_id)
    );
  `);
}

module.exports = {
  migrateSqlite,
  migratePg
};
