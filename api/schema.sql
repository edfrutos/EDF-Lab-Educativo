-- Esquema SQLite del laboratorio EDF Lab Educativo
-- Abre este archivo para ver la estructura de la tabla users sin leer JavaScript.

CREATE TABLE IF NOT EXISTS users (
  id    INTEGER PRIMARY KEY AUTOINCREMENT,
  name  TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE
);

-- Cuentas de operador del dashboard (login); distintas de users CRUD.
CREATE TABLE IF NOT EXISTS accounts (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL
);

-- Refresh token activo por operador (rotación mínima: un único token vigente).
CREATE TABLE IF NOT EXISTS account_refresh_tokens (
  account_id  INTEGER PRIMARY KEY,
  token_hash  TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);
