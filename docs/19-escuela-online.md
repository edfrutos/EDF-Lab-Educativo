# Escuela online — tutorial in situ (v3.0)

Plataforma para **alumnos externos**: registro, sandbox aislado por tenant y misiones verificables en el navegador (sin terminal).

## Piloto (10 alumnos concurrentes)

| Fase | Entregado en v3.0a | Siguiente |
|------|-------------------|-----------|
| **B1** | Datos CRUD aislados por `tenant_id` + JWT `learner` | — |
| **B2** | — | Base Postgres dedicada por tenant |
| **B3** | — | Stack Compose/K8s por alumno (sandbox real) |

## Flujo alumno

1. Abre el portal (`/` o producción HTTPS).
2. **Registrarme** → la API crea `learners` + tenant + usuarios semilla.
3. Redirección a `/?sandbox={slug}` (prod: `/lab/{slug}/` → redirect nginx).
4. Panel **Aprende** con 3 misiones y botón **Comprobar**.
5. CRUD solo ve datos de su tenant.

## Flujo operador (sin cambios)

- `admin@lab.local` / login clásico u OAuth mock.
- Ve usuarios con `tenant_id IS NULL` (lab legacy).

## Endpoints nuevos

```txt
POST /auth/register     # alumno
GET  /auth/me           # rol + sandbox
GET  /learn/missions    # misiones + progreso (learner)
POST /learn/check/:missionId/:stepId
```

## Misiones in-app (v3.0a)

1. **Conecta** — sesión + health  
2. **Explora JSON** — metadatos + lista users del tenant  
3. **Crea un usuario** — POST /users en el formulario  

## Desarrollo local

```bash
cd api && PORT=3100 npm start
cd dashboard && python3 -m http.server 5173
```

Registro de prueba en http://localhost:5173 → contraseña mínimo 8 caracteres.

> **Local + escuela:** en `api/.env` de desarrollo usa `ADMIN_EMAIL=admin@lab.local`. Si pones tu Gmail en `ADMIN_EMAIL`, tras `clean:local` el seed puede recrear un **operador** con ese email y bloquear el login de alumno (corregido en login: alumno primero; aun así, separa emails).

## Producción

El proxy incluye redirect:

```nginx
location ~ ^/lab/([^/]+)/?$ {
    return 302 /?sandbox=$1;
}
```

Roadmap detallado: [`.planning/PROJECT.md`](../.planning/PROJECT.md) — milestone **v3.0 Escuela**.
