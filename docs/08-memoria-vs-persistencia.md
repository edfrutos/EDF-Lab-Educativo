# Memoria vs Persistencia

Cuando la API arranca, carga los usuarios desde `api/data/users.json`. Cada vez que creas, editas o borras un usuario, el archivo se actualiza inmediatamente. Si la API se reinicia, los datos siguen ahí porque están en disco, no solo en memoria.

Este capítulo explica la diferencia entre los dos comportamientos.

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

## Después: estado en disco

Ahora la API lee y escribe `api/data/users.json`:

```
Arranque de la API
  │
  ▼
loadUsers() lee api/data/users.json
  ├── Archivo existe y es JSON válido
  │     └── users ← data.users  |  nextUserId ← data.nextId
  │
  ├── Archivo no existe (primera vez o borrado)
  │     └── Crea el archivo con los datos semilla
  │         [info] data/users.json no encontrado — creando con semilla
  │
  └── Archivo existe pero JSON inválido (corrupto)
        └── Sobrescribe con la semilla y continúa
            [warn] data/users.json corrupto — restaurando semilla
  │
  ▼
app.listen(3100)  ← El servidor solo acepta conexiones después de cargar

Mutación (POST / PUT / DELETE)
  │
  ▼
El handler actualiza el array en memoria
  │
  ▼
saveUsers() escribe api/data/users.json  ← inmediatamente, antes de responder
  ├── Éxito → responde 201/200 al cliente
  └── Error de escritura → revierte la mutación en memoria → responde 500
```

### `api/data/users.json`

El archivo es legible en cualquier momento. Mientras la API corre, puedes abrirlo con un editor o con `cat` y ver el estado actual:

```json
{
  "users": [
    { "id": 1, "name": "John Doe", "email": "john@example.com" },
    { "id": 2, "name": "Jane Smith", "email": "jane@example.com" }
  ],
  "nextId": 3
}
```

El campo `nextId` guarda el siguiente ID a usar. Sin él, los IDs se repetirían tras un restart.

---

## Comparación directa

| Situación | Sin persistencia | Con persistencia |
|-----------|-----------------|-----------------|
| Crear usuario, reiniciar API | El usuario desaparece | El usuario sigue ahí |
| Abrir `api/data/users.json` | No existe | Muestra el estado actual |
| Consola al arrancar | (silencio) | `[info]` o carga normal |
| Archivo corrupto al arrancar | Error fatal / datos vacíos | Restaura semilla + `[warn]` |

---

## Ejemplos ejecutables

### Ver el archivo mientras la API corre

```bash
# Terminal 1 — arrancar la API
cd api && PORT=3100 npm start

# Terminal 2 — crear un usuario
curl -s -X POST http://localhost:3100/users \
  -H 'Content-Type: application/json' \
  -d '{"name":"Alumno Test","email":"alumno@example.com"}'

# Ver el archivo actualizado
cat api/data/users.json
```

### Comprobar persistencia tras restart

```bash
# Crear un usuario (si no lo tienes ya del paso anterior)
curl -s -X POST http://localhost:3100/users \
  -H 'Content-Type: application/json' \
  -d '{"name":"Alumno Persistente","email":"p@example.com"}'

# Parar la API (Ctrl+C en Terminal 1) y arrancar de nuevo
PORT=3100 npm start

# El usuario sigue ahí
curl -s http://localhost:3100/users
```

Sigue los pasos detallados en la **Misión 06: Restart y Persistencia**.

### Observar la recuperación ante corrupción

```bash
# Parar la API, corromper el archivo y arrancar de nuevo
echo "esto no es json válido" > api/data/users.json
PORT=3100 npm start
# En consola: [warn] data/users.json corrupto — restaurando semilla
curl -s http://localhost:3100/users
# Resultado: los dos usuarios semilla
```

Sigue los pasos detallados en la **Misión 07: Corrupción y Restauración**.

---

## Resumen

La persistencia en este laboratorio usa solo módulos incorporados de Node.js (`fs/promises` y `path`). No hay base de datos ni dependencias adicionales. El objetivo es que veas exactamente dónde y cuándo el estado en memoria se serializa a disco.

Cuando estés listo para persistencia más robusta (datos relacionales, consultas, concurrencia), el siguiente paso natural es SQLite o PostgreSQL — pero eso es para después de que este flujo sea familiar.
