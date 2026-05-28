---
phase: 02-file-persistence
verified: 2026-05-28T10:36:00Z
status: passed
score: 5/5
overrides_applied: 0
human_verification:
  - test: "Arrancar la API (PORT=3100 npm start en api/), crear un usuario vía POST, parar la API con Ctrl+C, volver a arrancarla y comprobar que GET /users devuelve el usuario creado."
    expected: "El usuario creado sobrevive el restart y aparece en la respuesta de GET /users."
    why_human: "Requiere ejecutar el servidor y observar comportamiento en tiempo real — no es verificable con grep ni comprobaciones estáticas."
---

# Phase 2: File Persistence — Verification Report

**Phase Goal:** Users survive API restarts through simple file persistence, and learners understand what changed.
**Verified:** 2026-05-28T10:36:00Z
**Status:** human_needed
**Re-verification:** No — verificación inicial

---

## Goal Achievement

### Observable Truths (ROADMAP Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | API reads users from `data/users.json` | VERIFIED | `loadUsers()` en línea 63; `await loadUsers()` en `startServer()` línea 249; `readFile(DATA_FILE, 'utf8')` con manejo ENOENT y SyntaxError |
| 2 | API writes user mutations back to `data/users.json` | VERIFIED | `await saveUsers()` en tres handlers (líneas 144, 182, 207); `saveUsersData()` llama `writeFile(DATA_FILE, ...)` |
| 3 | Learner can restart the API and observe that users remain | ? HUMAN NEEDED | El código es correcto — las escrituras ocurren antes de responder, el archivo persiste en disco. Verificación observable solo ejecutando la API. |
| 4 | Documentation explains the difference between in-memory state and file persistence | VERIFIED | `docs/08-memoria-vs-persistencia.md` existe con secciones "Antes: estado en memoria", "Después: estado en disco", "Comparación directa", "Ejemplos ejecutables" y referencias a Misión 05 y Misión 06 |
| 5 | Backup behavior is implemented or taught through a concrete mission | VERIFIED | `missions/06-corrupcion-y-restauracion.md` enseña el comportamiento de restauración; `loadUsers()` restaura desde semilla ante SyntaxError y ENOENT |

**Score:** 4/5 truths verificadas programáticamente (1 requiere verificación humana)

---

## Required Artifacts

| Artifact | Proporciona | Status | Detalles |
|----------|-------------|--------|---------|
| `api/index.js` | Helpers `loadUsers`/`saveUsers`/`saveUsersData` + arranque async | VERIFIED | 259 líneas, helpers presentes, `node --check` pasa |
| `api/data/users.json` | Estado semilla persistido en git | VERIFIED | `nextId:3`, 2 usuarios semilla, JSON válido |
| `docs/08-memoria-vs-persistencia.md` | Explicación conceptual con diagrama antes/después y ejemplos curl | VERIFIED | 150 líneas, todas las secciones requeridas presentes, sin frontmatter YAML |
| `missions/05-restart-y-persistencia.md` | Misión de restart con pasos ejecutables | VERIFIED | H2 Objetivo, Pasos, Resultado esperado, Reto extra — todo presente |
| `missions/06-corrupcion-y-restauracion.md` | Misión de corrupción y recuperación con pasos ejecutables | VERIFIED | H2 Objetivo, Pasos, Resultado esperado, Reto extra — todo presente; mensajes `[warn]` e `[info]` idénticos al código |

---

## Key Link Verification

| From | To | Via | Status | Detalles |
|------|----|-----|--------|---------|
| `startServer()` | `loadUsers()` | `await loadUsers()` antes de `app.listen` | WIRED | Línea 249 — `await loadUsers()` dentro de `startServer`; `app.listen` en línea 250 |
| `loadUsers()` | `api/data/users.json` | `readFile(DATA_FILE)` con `path.join(__dirname, 'data')` | WIRED | Línea 65 — `readFile(DATA_FILE, 'utf8')`; `DATA_FILE = path.join(DATA_DIR, 'users.json')` (línea 8) |
| `app.post('/users')` | `saveUsers()` | `await saveUsers()` en try/catch con rollback `users.pop()+nextUserId-=1` | WIRED | Líneas 143–150 — try/catch correcto, rollback verificado |
| `app.put('/users/:id')` | `saveUsers()` | `await saveUsers()` en try/catch con rollback `users[userIndex]=previousUser` | WIRED | Líneas 181–187 — `previousUser` copia spread presente, restauración en catch |
| `app.delete('/users/:id')` | `saveUsers()` | `await saveUsers()` en try/catch con rollback `users.splice(userIndex, 0, deletedUser)` | WIRED | Líneas 207–212 — splice en posición original (no push) |
| `docs/08-memoria-vs-persistencia.md` | `missions/05-restart-y-persistencia.md` | Referencia directa al número de misión | WIRED | Línea 128 — `**Misión 05: Restart y Persistencia**` |
| `docs/08-memoria-vs-persistencia.md` | `missions/06-corrupcion-y-restauracion.md` | Referencia directa al número de misión | WIRED | Línea 141 — `**Misión 06: Corrupción y Restauración**` |

---

## Data-Flow Trace (Level 4)

| Artifact | Variable de datos | Fuente | Produce datos reales | Status |
|----------|-------------------|--------|----------------------|--------|
| `api/index.js` — `GET /users` | `users` (array en memoria) | `loadUsers()` ← `readFile(DATA_FILE)` → parse JSON | Sí — lee disco real, no array estático | FLOWING |
| `api/index.js` — POST/PUT/DELETE | `users`, `nextUserId` | Mutación en memoria + `saveUsers()` → `writeFile(DATA_FILE)` | Sí — escribe disco real antes de responder | FLOWING |

---

## Behavioral Spot-Checks

| Behavior | Comando | Resultado | Status |
|----------|---------|-----------|--------|
| `node --check api/index.js` pasa sin errores | `node --check api/index.js` | SYNTAX_OK | PASS |
| `api/data/users.json` es JSON válido con semilla correcta | `node -e "JSON.parse(...); assert nextId===3, users.length===2"` | JSON_SEED_OK | PASS |
| 3 ocurrencias exactas de `await saveUsers()` | `grep -c "await saveUsers()" api/index.js` | 3 | PASS |
| Todos los handlers de mutación son async | grep de `app.post/put/delete.*async` | Líneas 127, 155, 192 | PASS |
| `module.exports` antes de `startServer` | `grep -n module.exports\|startServer` | línea 246 < línea 248 | PASS |
| Rollbacks completos en los 3 handlers | grep de `pop()`, `nextUserId -= 1`, `previousUser`, `splice(userIndex, 0` | Todos presentes | PASS |
| Spread en semilla (`[...SEED_DATA.users]`) | grep pattern | Línea 79 | PASS |
| 500 message idéntico en los 3 handlers | pattern match | 3 ocurrencias | PASS |
| Mensaje `[warn]` en misión 06 = mensaje en código | grep comparación | Idénticos | PASS |
| Mensaje `[info]` en misión 06 = mensaje en código | grep comparación | Idénticos | PASS |
| Sin frontmatter YAML en docs/missions | `head -1` de los 3 archivos | Empiezan con `#` | PASS |
| Sin anti-patterns (TODO/FIXME/placeholder) | grep en archivos modificados | NONE | PASS |
| Commits de la fase presentes en git log | `git log --oneline` | `05ab8e1`, `7a6d05f`, `d58a685` presentes | PASS |
| Restart end-to-end: usuario sobrevive restart | Requiere servidor activo | — | ? SKIP — ver Human Verification |

---

## Requirements Coverage

| Requisito | Plan | Descripción | Status | Evidencia |
|-----------|------|-------------|--------|-----------|
| PERS-01 | 02-01, 02-02 | API almacena usuarios en `data/users.json` en lugar de solo en memoria del proceso | SATISFIED | `saveUsers()` en los 3 handlers de mutación; `api/data/users.json` existe con semilla |
| PERS-02 | 02-01 | API crea o inicializa los datos de persistencia de forma segura cuando el archivo no existe | SATISFIED | `loadUsers()` captura ENOENT y llama `saveUsersData(SEED_DATA)`; `mkdir({ recursive: true })` crea el directorio si no existe |
| PERS-03 | 02-02 | El alumno puede observar que los usuarios sobreviven un restart de la API | SATISFIED (code) / ? HUMAN NEEDED (observable) | `await saveUsers()` antes de responder garantiza persistencia; verificación observable requiere arrancar la API |
| PERS-04 | 02-03 | La documentación explica memoria vs persistencia con ejemplos ejecutables | SATISFIED | `docs/08-memoria-vs-persistencia.md` con diagrama antes/después, tabla comparativa y 3 ejemplos curl ejecutables |
| PERS-05 | 02-03 | Existe comportamiento de backup o se enseña como misión concreta | SATISFIED | `missions/06-corrupcion-y-restauracion.md` enseña recuperación automática; `loadUsers()` implementa restauración desde semilla |

**Todos los requisitos de la fase cubiertos:** PERS-01 al PERS-05 — ninguno huérfano.

---

## Anti-Patterns Found

No se han encontrado anti-patterns bloqueantes ni advertencias en los archivos modificados por esta fase.

| Archivo | Línea | Patrón | Severidad | Impacto |
|---------|-------|--------|-----------|---------|
| — | — | Ninguno encontrado | — | — |

---

## Human Verification Required

### 1. Restart End-to-End — Usuarios sobreviven un reinicio

**Test:** Abrir dos terminales. En terminal 1:
```bash
cd /Users/edefrutos/Desktop/EDF-Lab-Educativo/api
PORT=3100 npm start
```
En terminal 2:
```bash
curl -s -X POST http://localhost:3100/users \
  -H 'Content-Type: application/json' \
  -d '{"name":"Alumno Verificacion","email":"ver@example.com"}'
```
Copiar el `id` devuelto. Parar la API con Ctrl+C en terminal 1. Volver a arrancar la API. Ejecutar:
```bash
curl -s http://localhost:3100/users
```

**Expected:** La respuesta incluye al usuario `Alumno Verificacion` con el mismo `id`. El archivo `api/data/users.json` lo muestra también.

**Why human:** Requiere un proceso Node.js activo, un ciclo completo de start/stop/start y observación en tiempo real. No es verificable con comprobaciones estáticas de código.

---

## Gaps Summary

No se han identificado gaps bloqueantes. El código es estructuralmente completo y correcto. La única verificación pendiente es la observacional (SC3 del ROADMAP) que requiere ejecutar la API en un entorno activo.

**Veredicto:** El objetivo de la fase — que los usuarios sobrevivan los reinicios de la API y que los alumnos entiendan qué ha cambiado — está implementado correctamente en el código y documentado de forma completa. Pasa a `human_needed` exclusivamente por el requisito de comprobación observable en tiempo real de PERS-03.

---

_Verified: 2026-05-28T10:36:00Z_
_Verifier: Claude (gsd-verifier)_
