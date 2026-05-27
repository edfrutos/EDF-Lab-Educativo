---
phase: 02-file-persistence
reviewed: 2026-05-27T20:10:00Z
depth: standard
files_reviewed: 5
files_reviewed_list:
  - api/index.js
  - api/data/users.json
  - docs/08-memoria-vs-persistencia.md
  - missions/05-restart-y-persistencia.md
  - missions/06-corrupcion-y-restauracion.md
findings:
  critical: 0
  warning: 3
  info: 3
  total: 6
status: issues_found
---

# Fase 02: Code Review Report — File Persistence

**Revisado:** 2026-05-27T20:10:00Z
**Profundidad:** standard
**Archivos revisados:** 5
**Estado:** issues_found

---

## Resumen

El código de persistencia en `api/index.js` está bien estructurado: el flujo `loadUsers → startServer → app.listen` es correcto, los rollbacks en POST/PUT/DELETE son simétricos y funcionan bajo el modelo single-threaded de Node.js. La sintaxis es válida y `users.json` tiene formato JSON correcto con `nextId` coherente.

Se detectan **3 warnings** que pueden causar bugs en producción y **3 items informativos** sobre omisiones menores en la documentación. No hay vulnerabilidades de seguridad ni errores críticos.

---

## Warnings

### WR-01: `loadUsers` no valida la estructura del JSON leído — JSON válido con estructura incorrecta corrompe el estado en memoria

**Archivo:** `api/index.js:66-68`

**Problema:** Si `users.json` contiene JSON sintácticamente válido pero con una estructura inesperada (p. ej. `{"nextId":5}` sin campo `users`, o `{"users":"cadena","nextId":5}`), `JSON.parse()` no lanza `SyntaxError` y el bloque `catch` no se ejecuta. En consecuencia `users` queda asignado a `undefined` o a un valor no-array. La siguiente mutación (`POST /users`) llama a `users.push()` y lanza `TypeError: users.push is not a function`, dejando el servidor en estado roto sin posibilidad de recuperación hasta reinicio.

```js
// Líneas actuales (problemáticas)
const data = JSON.parse(raw);
users      = data.users;        // puede ser undefined o no-array
nextUserId = data.nextId;       // puede ser undefined → NaN
```

**Corrección propuesta:**

```js
const data = JSON.parse(raw);

if (!Array.isArray(data.users) || typeof data.nextId !== 'number') {
  throw new SyntaxError('Estructura inválida en users.json');
}

users      = data.users;
nextUserId = data.nextId;
```

Lanzar `SyntaxError` (que ya está manejado en el catch) hace que el servidor se recupere con la semilla de la misma forma que ante JSON corrupto.

---

### WR-02: `saveUsersData` dentro de `loadUsers` no tiene manejo de errores — un fallo al escribir la semilla propaga una excepción no capturada

**Archivo:** `api/index.js:72-75`

**Problema:** Cuando el archivo no existe o está corrupto, `loadUsers` llama a `saveUsersData(SEED_DATA)` dentro del bloque `catch`. Si `saveUsersData` lanza (p. ej. permisos insuficientes en `data/`), la excepción burbujea fuera de `loadUsers` y es capturada por `startServer().catch()`, que termina el proceso con `process.exit(1)`. Esto es aceptable para el caso ENOENT/SyntaxError en arranque, pero el mensaje que llega al usuario es `[error] No se pudo arrancar el servidor: ...`, sin contexto del motivo real (fallo de escritura de semilla). Para el objetivo educativo del proyecto, tener un mensaje claro es importante.

```js
// Situación actual: los dos await dentro de catch no están envueltos
} catch (err) {
  if (err instanceof SyntaxError) {
    console.warn('[warn] data/users.json corrupto — restaurando semilla');
    await saveUsersData(SEED_DATA);   // ← puede lanzar; mensaje de error confuso
  } else if (err.code === 'ENOENT') {
    console.info('[info] data/users.json no encontrado — creando con semilla');
    await saveUsersData(SEED_DATA);   // ← ídem
  } else { ... }
  users      = [...SEED_DATA.users];
  nextUserId = SEED_DATA.nextId;
}
```

**Corrección propuesta:**

```js
try {
  await saveUsersData(SEED_DATA);
} catch (writeErr) {
  console.error('[error] No se pudo escribir la semilla en disco:', writeErr.message);
  // La ejecución continúa: users y nextUserId se asignarán desde SEED_DATA en memoria
}
```

Así el servidor puede arrancar en modo memoria-únicamente y el mensaje identifica el problema real.

---

### WR-03: El diagrama de flujo en `docs/08-memoria-vs-persistencia.md` hardcodea el puerto 3100, pero `api/index.js` arranca en el puerto 3000 por defecto

**Archivo:** `docs/08-memoria-vs-persistencia.md:54`

**Problema:** El diagrama ASCII muestra `app.listen(3100)` como si fuera el valor fijo del código. En realidad `index.js:19` define `const PORT = process.env.PORT || 3000`, de modo que sin la variable de entorno el servidor escucha en `3000`, no en `3100`. Un alumno que siga el diagrama y arranque con `npm start` (sin `PORT=3100`) verá que el servidor escucha en `3000` y concluirá que el diagrama está mal o que algo falla.

Los comandos ejecutables de la misma página y de las misiones 05/06 sí usan `PORT=3100 npm start`, así que los pasos prácticos son correctos. El único problema es la etiqueta fija del diagrama.

**Corrección propuesta:**

```
# docs/08-memoria-vs-persistencia.md, línea 54 — cambiar:
app.listen(3100)  ← El servidor solo acepta conexiones después de cargar

# por:
app.listen(PORT)  ← El servidor solo acepta conexiones después de cargar
                     (PORT=3100 en los ejemplos de este capítulo)
```

---

## Info

### IN-01: `validateUserPayload` no valida formato de email — acepta cualquier cadena no vacía

**Archivo:** `api/index.js:49-51`

**Contexto:** En un laboratorio educativo esto es una decisión deliberada válida (el foco es CRUD/persistencia, no validación). Se registra como informativo porque puede confundir a un alumno que intente entender qué protegen las validaciones.

Si se desea añadir validación mínima sin dependencias externas:

```js
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!EMAIL_RE.test(email.trim())) {
  return 'El campo "email" debe tener formato válido (usuario@dominio.ext).';
}
```

---

### IN-02: El mensaje de arranque real del servidor no aparece en la documentación ni en las misiones

**Archivos:** `docs/08-memoria-vs-persistencia.md`, `missions/05-restart-y-persistencia.md`, `missions/06-corrupcion-y-restauracion.md`

**Contexto:** El código emite `Servidor arrancado en http://localhost:3100` al iniciar (`api/index.js:251`). Ningún documento muestra este mensaje como referencia de que el servidor arrancó correctamente, aunque sí muestran los mensajes `[info]` y `[warn]`. Para un alumno que ejecuta por primera vez, añadir una línea indicando qué se ve en consola cuando el arranque es limpio (sin crear ni restaurar semilla) reduciría la ambigüedad.

**Sugerencia:** En la tabla comparativa de `docs/08-memoria-vs-persistencia.md`, la fila "Consola al arrancar" podría añadir el mensaje nominal: `Servidor arrancado en http://localhost:3100`.

---

### IN-03: Typo ortográfico en `missions/06-corrupcion-y-restauracion.md`

**Archivo:** `missions/06-corrupcion-y-restauracion.md:33`

**Problema:** "sobreescrito" es una grafía frecuente pero incorrecta en español normativo. La forma correcta según la RAE es "sobrescrito" (sin la segunda `e`).

```
# Actual:
El archivo `api/data/users.json` ha sido sobreescrito con la semilla válida.

# Correcto:
El archivo `api/data/users.json` ha sido sobrescrito con la semilla válida.
```

---

_Revisado: 2026-05-27T20:10:00Z_
_Revisor: Claude (gsd-code-reviewer)_
_Profundidad: standard_
