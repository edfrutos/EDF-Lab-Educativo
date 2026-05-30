---
status: complete
phase: 05-advanced-contracts-and-containers
source: 05-01-SUMMARY.md, 05-02-SUMMARY.md
started: 2026-05-29T20:00:00.000Z
updated: 2026-05-30T11:00:00.000Z
---

## Current Test

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: API arranca desde cero con npm start; /health responde healthy
result: pass

### 2. Spec OpenAPI en Swagger Editor
expected: Al pegar api/openapi.yaml en https://editor.swagger.io, el panel derecho muestra los 9 endpoints sin errores de parseo
result: pass

### 3. Contrato alineado con la API real
expected: `curl http://localhost:3100/users/abc` devuelve el mismo mensaje de error documentado en openapi.yaml (`El parámetro ":id" debe ser un número entero.`)
result: pass

### 4. Material OpenAPI en el índice
expected: docs/00-indice.md lista docs/11-openapi.md y missions/08-explorar-openapi.md con etiqueta (avanzado, opcional)
result: pass

### 5. Build de imagen Docker
expected: Desde api/, `npm run docker:build` termina sin error y crea la imagen edf-lab-api
result: pass

### 6. API en contenedor responde
expected: Con contenedor en marcha (`npm run docker:start`), `curl http://localhost:3100/health` devuelve healthy
result: pass
note: "Re-verificado tras fix chown en Dockerfile"

### 7. Datos efímeros en Docker
expected: Tras crear un usuario en el contenedor, pararlo y volver a arrancarlo, ese usuario ya no aparece (solo SEED_DATA)
result: pass

### 8. Doc Docker con framing de coexistencia
expected: docs/12-docker.md abre confirmando que npm start sigue siendo válido y explica build/run/stop
result: pass

## Summary

total: 8
passed: 8
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

- truth: "El contenedor Docker arranca y responde en /health"
  status: fixed
  reason: "User reported: EACCES permission denied, open '/usr/src/app/data/users.json'"
  severity: blocker
  test: 6
  root_cause: "COPY deja ficheros como root; USER node no podía escribir en data/"
  fix: "api/Dockerfile — RUN mkdir -p data && chown -R node:node /usr/src/app antes de USER node"
