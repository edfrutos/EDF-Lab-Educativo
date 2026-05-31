-- Esquema PostgreSQL del laboratorio EDF Lab Educativo
-- Abre este archivo para ver la estructura de la tabla users sin leer JavaScript.

CREATE TABLE IF NOT EXISTS users (
  id    SERIAL PRIMARY KEY,
  name  TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE
);
