#!/usr/bin/env bash
# Smoke del perfil prod: asume stack levantado con npm run compose:prod
# Verifica same-origin /api detrás de edf-lab-proxy (TLS autofirmado).
set -euo pipefail

BASE_URL="${PROD_PROXY_URL:-https://localhost}"
CURL=(curl -kfsS)

echo "== Smoke prod proxy =="
echo "URL base: $BASE_URL"
echo "Prerequisito: ./scripts/generate-dev-tls.sh && npm run compose:prod"
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

echo
echo "Smoke prod proxy: PASS"
