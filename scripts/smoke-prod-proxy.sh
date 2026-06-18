#!/usr/bin/env bash
# Smoke del perfil prod: asume stack levantado con npm run compose:prod
# Verifica same-origin /api, login Secure y CRUD autenticado detrás de edf-lab-proxy.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# URL del proxy: PROD_PROXY_URL o https://localhost[:puerto] desde .env raíz (PROD_HTTPS_PORT)
if [ -z "${PROD_PROXY_URL:-}" ] && [ -f "$REPO_ROOT/.env" ]; then
  prod_port="$(grep -E '^PROD_HTTPS_PORT=' "$REPO_ROOT/.env" | tail -1 | cut -d= -f2- | tr -d ' "\r' || true)"
  if [ -n "$prod_port" ] && [ "$prod_port" != "443" ]; then
    PROD_PROXY_URL="https://localhost:${prod_port}"
  fi
fi
BASE_URL="${PROD_PROXY_URL:-https://localhost}"
CURL=(curl -kfsS)

SMOKE_EMAIL="${SMOKE_OPERATOR_EMAIL:-admin@lab.local}"
SMOKE_PASSWORD="${SMOKE_OPERATOR_PASSWORD:-changeme}"

echo "== Smoke prod proxy =="
echo "URL base: $BASE_URL"
echo "Prerequisito: api/.env (JWT_SECRET + DATABASE_URL), ./scripts/generate-dev-tls.sh, npm run compose:prod"
echo

echo "→ GET /api/health"
health="$("${CURL[@]}" "$BASE_URL/api/health")"
if ! echo "$health" | grep -q '"status"'; then
  echo "FAIL: respuesta health inesperada: $health" >&2
  exit 1
fi
echo "  OK: $health"

echo "→ GET / (dashboard)"
status="$("${CURL[@]}" -o /dev/null -w "%{http_code}" "$BASE_URL/")"
if [ "$status" != "200" ]; then
  echo "FAIL: dashboard HTTP $status" >&2
  exit 1
fi
echo "  OK: HTTP $status"

echo "→ GET /api/auth/oauth/start?provider=mock"
oauth="$("${CURL[@]}" "$BASE_URL/api/auth/oauth/start?provider=mock")"
if ! echo "$oauth" | grep -q 'authUrl'; then
  echo "FAIL: OAuth start inesperado: $oauth" >&2
  exit 1
fi
echo "  OK: authUrl presente"

COOKIE_JAR="$(mktemp)"
trap 'rm -f "$COOKIE_JAR"' EXIT

echo "→ POST /api/auth/login (cookie Secure en prod)"
login_headers="$(curl -kfsS -D - -o /dev/null -c "$COOKIE_JAR" -b "$COOKIE_JAR" \
  -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$SMOKE_EMAIL\",\"password\":\"$SMOKE_PASSWORD\"}")"
if ! echo "$login_headers" | grep -qi 'Set-Cookie:.*edf_session'; then
  echo "FAIL: login sin cookie edf_session" >&2
  echo "$login_headers" >&2
  exit 1
fi
if ! echo "$login_headers" | grep -qi 'Secure'; then
  echo "FAIL: edf_session sin flag Secure (¿NODE_ENV=production en compose:prod?)" >&2
  echo "$login_headers" >&2
  exit 1
fi
echo "  OK: edf_session con Secure"

echo "→ GET /api/users (sesión autenticada)"
users="$("${CURL[@]}" -b "$COOKIE_JAR" "$BASE_URL/api/users")"
if ! echo "$users" | grep -q '"email"'; then
  echo "FAIL: /users sin datos esperados: $users" >&2
  exit 1
fi
echo "  OK: lista de usuarios accesible"

echo
echo "Smoke prod proxy: PASS"
