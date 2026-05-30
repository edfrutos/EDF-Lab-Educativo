---
status: testing
phase: 07-migration-test-confidence
source: 07-01-SUMMARY.md, 07-02-SUMMARY.md, 07-03-SUMMARY.md
started: 2026-05-30T19:00:00.000Z
updated: 2026-05-30T19:00:00.000Z
---

## Current Test

number: 1
name: Cold Start — migración desde users.json
expected: |
  Tras borrar api/data/users.db y arrancar la API (PORT=3100 npm start), la consola muestra
  "Migrados 2 usuarios desde users.json". El dashboard en :5173 lista John Doe y Jane Smith.
awaiting: user response

## Tests

### 1. Cold Start — migración desde users.json
expected: Borrar users.db, reiniciar API → log de migración; dashboard muestra 2 usuarios semilla
result: [pending]

### 2. Dashboard CRUD sin cambios
expected: Crear, editar y borrar un usuario desde el dashboard funciona como antes (200/201)
result: [pending]

### 3. Email duplicado (409)
expected: Crear usuario con email ya existente (p.ej. john@example.com) devuelve error; API responde 409
result: [pending]

### 4. Suite automatizada npm test
expected: cd api && npm test → 16 tests, 0 failures
result: pass

### 5. Documentación JSON vs SQLite
expected: docs/10-tests.md explica cuándo JSON basta vs SQLite (sección dedicada)
result: [pending]

## Summary

total: 5
passed: 1
issues: 0
pending: 4
skipped: 0
blocked: 0

## Gaps
