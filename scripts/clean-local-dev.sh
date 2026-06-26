#!/usr/bin/env bash
# Limpia artefactos locales de desarrollo/E2E (no toca node_modules ni .env).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

rm -rf "${ROOT}/test-results" "${ROOT}/playwright-report" "${ROOT}/blob-report"
rm -f "${ROOT}/api/data/"*.db

echo "→ Eliminados: test-results/, playwright-report/, blob-report/, api/data/*.db"
echo "→ Conservados: api/data/users.json, api/.env (gitignored)"
echo "→ Reinicia la API (PORT=3100 npm start) para recrear users.db y la cuenta operador."
