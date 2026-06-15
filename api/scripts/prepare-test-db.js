'use strict';

const { Client } = require('pg');

const ADMIN_URL =
  process.env.PG_ADMIN_URL ||
  'postgresql://edf_lab:edf_lab_dev@localhost:5432/postgres';

const DATABASES = ['edf_lab_test', 'edf_lab_e2e'];

async function createDatabaseIfNotExists(client, name) {
  try {
    await client.query(`CREATE DATABASE ${name} OWNER edf_lab`);
    console.log(`Base ${name} lista para tests.`);
  } catch (err) {
    if (err.code === '42P04') {
      console.log(`Base ${name} ya existe.`);
      return;
    }
    throw err;
  }
}

async function main() {
  const client = new Client({ connectionString: ADMIN_URL });
  try {
    await client.connect();
    for (const name of DATABASES) {
      await createDatabaseIfNotExists(client, name);
    }
  } catch (err) {
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
      console.error(
        'No se pudo conectar a PostgreSQL. Arranca el servidor, por ejemplo:\n' +
        '  docker compose up -d edf-lab-postgres'
      );
      process.exit(1);
    }
    console.error(err.message);
    process.exit(1);
  } finally {
    await client.end().catch(() => {});
  }
}

main();
