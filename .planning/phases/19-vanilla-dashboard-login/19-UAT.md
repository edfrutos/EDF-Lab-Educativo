---
status: complete
phase: 19-vanilla-dashboard-login
source:
  - 19-01-SUMMARY.md
  - 19-02-SUMMARY.md
  - 19-VERIFICATION.md
started: 2026-06-01T20:00:00Z
updated: 2026-06-02T10:59:00Z
---

## Current Test

number: -
name: UAT finalizado
expected: |
  Todas las pruebas de validación manual de la fase 19 se han completado correctamente.
awaiting: none

## Tests

### 1. Puerta de login al cargar
expected: Con API y dashboard arrancados, al abrir http://localhost:5173 aparece el formulario de login y el panel de usuarios (tabla + formulario CRUD) permanece oculto.
result: pass

### 2. Contraseña incorrecta
expected: Tras enviar email válido con contraseña incorrecta, el mensaje de error aparece debajo del formulario de login (zona #login-error) y la caja roja de «No se ha podido conectar con la API» no se muestra.
result: pass

### 3. Login correcto
expected: Con admin@lab.local / changeme, tras «Entrar» se oculta el gate, aparece el panel con health, info API y tabla de usuarios cargada.
result: pass

### 4. Cookie en Network
expected: Tras login exitoso, en DevTools → Network, una petición a localhost:3100 (p. ej. /users) incluye cabecera Cookie con edf_session.
result: pass

### 5. Cerrar sesión
expected: Al pulsar «Cerrar sesión» vuelves al formulario de login; al refrescar la página sigues en el gate sin datos de usuarios visibles.
result: pass

### 6. Sesión caducada al recargar
expected: Con sesión activa, borras la cookie edf_session en DevTools → Application, pulsas «Recargar datos» y vuelves al gate con un mensaje en español bajo el login (no solo la caja de error de conexión).
result: pass

## Summary

total: 6
passed: 6
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none yet]
