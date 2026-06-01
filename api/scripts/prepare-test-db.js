'use strict';

const { Client } = require('pg');

const ADMIN_URL =
  process.env.PG_ADMIN_URL ||
  'postgresql://edf_lab:edf_lab_dev@localhost:5432/postgres';

async function main() {
  const client = new Client({ connectionString: ADMIN_URL });
  try {
    await client.connect();
    await client.query('CREATE DATABASE edf_lab_test OWNER edf_lab');
    console.log('Base edf_lab_test lista para tests.');
  } catch (err) {
    if (err.code === '42P04') {
      console.log('Base edf_lab_test ya existe.');
      process.exit(0);
    }
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
