#!/usr/bin/env bash
# Genera certificado TLS autofirmado de laboratorio para edf-lab-proxy (fase 42).
# Salida: deploy/certs/lab.crt y lab.key (gitignored).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CERT_DIR="$REPO_ROOT/deploy/certs"

mkdir -p "$CERT_DIR"

if ! command -v openssl >/dev/null 2>&1; then
  echo "openssl no encontrado — instálalo para generar certs de laboratorio." >&2
  exit 1
fi

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout "$CERT_DIR/lab.key" \
  -out "$CERT_DIR/lab.crt" \
  -subj "/CN=localhost/O=EDF Lab Educativo/C=ES"

echo "Certs de laboratorio escritos en $CERT_DIR (lab.crt, lab.key)"
echo "Uso: npm run compose:prod — el navegador mostrará advertencia de certificado autofirmado."
