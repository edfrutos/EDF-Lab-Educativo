# Memoria vs Persistencia

Este capítulo explica la diferencia entre guardar datos **solo en RAM** (memoria) y guardarlos **en disco** (persistencia). El laboratorio ha evolucionado: primero aprendimos JSON en disco; en **v1.1** el almacén en runtime es **SQLite** (`api/data/users.db`).

> **v1.1:** Para el detalle de SQLite (esquema, consultas, inspección con `sqlite3`), lee [`13-sqlite.md`](./13-sqlite.md). Aquí mantenemos la idea general memoria vs disco.

---

## Antes: estado en memoria

En la versión original, los usuarios vivían únicamente dentro del proceso de Node.js:

```
Arranque de la API
  │
  ▼
let users = [
  { id: 1, name: 'John Doe', ... },
  { id: 2, name: 'Jane Smith', ... }
]
  │
  ▼
La API responde peticiones usando este array en RAM

Si la API se para (Ctrl+C o reinicio):
  └── El array desaparece. Los datos creados durante la sesión se pierden.
```

Esto es útil para aprender, pero no para guardar trabajo real.

---

## Evolución v1.0: JSON en disco

En la Fase 2 del laboratorio, la API leía y escribía `api/data/users.json` en cada mutación. Podías abrir el archivo con un editor o `cat` y ver el estado. Ese modelo enseñó **serialización a disco** con módulos nativos (`fs`).

Ese enfoque sigue siendo válido didácticamente, pero el proyecto ya no usa JSON como almacén principal en runtime.

---

## Ahora (v1.1): SQLite en disco

Los usuarios viven en **`api/data/users.db`**. Al arrancar:

```
Arranque de la API
  │
  ▼
initDb() abre users.db y aplica schema.sql
  │
  ├── Tabla vacía → importa desde users.json (semilla) o John/Jane
  │     log: "Migrados N usuarios desde users.json"
  │
  └── Tabla con datos → no sobrescribe (protege tu trabajo)
  │
  ▼
app.listen(3100)

Mutación (POST / PUT / DELETE)
  │
  ▼
db.js ejecuta SQL (INSERT / UPDATE / DELETE)
  │
  ▼
Cambio persistido en users.db antes de responder al cliente
```

### Dos archivos, dos roles

| Archivo | Rol en v1.1 |
|---------|-------------|
| `api/data/users.db` | **Runtime** — todas las lecturas y escrituras CRUD |
| `api/data/users.json` | **Semilla/migración** — solo si la tabla está vacía al arrancar |

`users.json` ya **no** se actualiza en cada POST o DELETE. Para ver el estado actual usa `sqlite3` o el dashboard, no `cat users.json`.

---

## Comparación directa

| Situación | Solo memoria | Persistencia (SQLite) |
|-----------|--------------|------------------------|
| Crear usuario, reiniciar API | Desaparece | Sigue en `users.db` |
| Inspeccionar datos | Solo vía API/dashboard | `sqlite3 api/data/users.db "SELECT ..."` |
| Reglas (email único) | Solo en código | Constraint `UNIQUE` + HTTP 409 |
| Archivo legible con `cat` | N/A | `.db` es binario — usa `sqlite3` |

---

## Ejemplos ejecutables

### Ver datos en la base mientras la API corre

```bash
# Terminal 1
cd api && PORT=3100 npm start

# Terminal 2 — crear usuario
curl -s -X POST http://localhost:3100/users \
  -H 'Content-Type: application/json' \
  -d '{"name":"Alumno Test","email":"alumno@example.com"}'

# Inspeccionar SQLite (no cat del .db)
sqlite3 api/data/users.db "SELECT id, name, email FROM users;"
```

### Comprobar persistencia tras restart

```bash
curl -s -X POST http://localhost:3100/users \
  -H 'Content-Type: application/json' \
  -d '{"name":"Alumno Persistente","email":"p@example.com"}'

# Parar API (Ctrl+C) y arrancar de nuevo
PORT=3100 npm start

curl -s http://localhost:3100/users
```

Sigue los pasos en **[`missions/10-inspeccionar-sqlite.md`](../missions/10-inspeccionar-sqlite.md)** (v1.1).

> La **[Misión 06](../missions/06-restart-y-persistencia.md)** describe el flujo histórico con JSON (v1.0). Conserva valor didáctico, pero para el lab actual usa la Misión 10.

### Observar migración desde JSON (cold start)

```bash
rm -f api/data/users.db
cd api && PORT=3100 npm start
# Consola: Migrados 2 usuarios desde users.json
```

---

## Resumen

- **Memoria:** rápida, volátil — desaparece al parar el proceso.
- **Disco:** sobrevive reinicios — en v1.1 es SQLite, no reescritura constante de JSON.
- **Siguiente lectura:** [`13-sqlite.md`](./13-sqlite.md) (esquema, consultas, comparativa de drivers).
- **Práctica:** [`missions/10-inspeccionar-sqlite.md`](../missions/10-inspeccionar-sqlite.md).

Cuando domines este flujo, el paso natural en otros proyectos es PostgreSQL u ORMs — pero primero conviene que el circuito backend → JSON HTTP → dashboard te resulte transparente.
