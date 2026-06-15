# Índice de documentación

Documentación conceptual del laboratorio.

## Orden recomendado de lectura

Si es tu primera vez en el proyecto, sigue este recorrido:

1. [`01-arquitectura.md`](./01-arquitectura.md) para entender el mapa general.
2. [`02-puesta-en-marcha.md`](./02-puesta-en-marcha.md) para arrancar el laboratorio.
3. [`03-api-express.md`](./03-api-express.md) para revisar la API.
4. [`04-dashboard-fetch.md`](./04-dashboard-fetch.md) para entender el frontend.
5. [`05-cors-explicado.md`](./05-cors-explicado.md) para comprender la frontera entre ambos.
6. [`06-debugging.md`](./06-debugging.md) para resolver problemas típicos.
7. [`07-retos.md`](./07-retos.md) para ampliar el proyecto.
8. [`08-memoria-vs-persistencia.md`](./08-memoria-vs-persistencia.md) para entender cómo persisten los datos entre reinicios.
9. [`13-sqlite.md`](./13-sqlite.md) para profundizar en SQLite: esquema, consultas e inspección de `users.db`.
10. [`09-glosario.md`](./09-glosario.md) para consultar los términos clave del laboratorio.
11. [`10-tests.md`](./10-tests.md) para entender la suite de tests de la API (SQLite, Postgres y autenticación).
12. [`11-openapi.md`](./11-openapi.md) para entender el contrato formal de la API. *(avanzado, opcional)*
13. [`12-docker.md`](./12-docker.md) para arrancar la API en un contenedor Docker. *(avanzado, opcional)*
14. [`14-docker-compose.md`](./14-docker-compose.md) para orquestar API + dashboard + Postgres con Compose. *(avanzado, opcional)*
15. [`15-postgresql.md`](./15-postgresql.md) para PostgreSQL: conexión, esquema, `psql` y tests. *(avanzado, opcional)*
16. [`16-frameworks.md`](./16-frameworks.md) para comparar vanilla, React y Vue (estado, formularios, `fetch`). *(avanzado, opcional)*

**Rutas opcionales (frameworks):** [`dashboard-react/`](../dashboard-react/) en el puerto **5174** y [`dashboard-vue/`](../dashboard-vue/) en el **5175**, además del dashboard vanilla en **5173**.

### Ruta avanzada v1.5 (autenticación y despliegue)

Después del recorrido inicial y, si quieres, de frameworks:

1. [`17-autenticacion.md`](./17-autenticacion.md) — sesión del operador, bcrypt, JWT en cookie, CORS con credenciales. *(avanzado, v1.5)*
2. [`missions/14-auth-vanilla-login-crud.md`](../missions/14-auth-vanilla-login-crud.md) — práctica guiada login → CRUD → logout.
3. [`18-production-deploy.md`](./18-production-deploy.md) — secretos `.env`, Compose `env_file`, TLS en nginx. *(avanzado, v1.5)*
4. Misiones Compose opcionales: [`11-arrancar-con-compose.md`](../missions/11-arrancar-con-compose.md), [`12-postgres-compose-crud.md`](../missions/12-postgres-compose-crud.md).

### Ruta avanzada v1.6 (auth en frameworks y CI)

Después de v1.5 y con React/Vue opcionales:

1. [`16-frameworks.md`](./16-frameworks.md) — sección **Autenticación y los tres paneles** (vanilla / React `onLogin` / Vue `emit`).
2. [`missions/15-framework-auth-login-crud.md`](../missions/15-framework-auth-login-crud.md) — login → CRUD → logout en `:5174` o `:5175`.
3. [`10-tests.md`](./10-tests.md#ci-en-github-actions) — CI: sqlite + postgres + E2E smoke (tres jobs en PRs).
4. [`missions/16-smoke-e2e-playwright.md`](../missions/16-smoke-e2e-playwright.md) — práctica Playwright smoke local.
5. READMEs [`dashboard-react/`](../dashboard-react/) y [`dashboard-vue/`](../dashboard-vue/).

### Ruta avanzada v2.0 (Quality & CI)

Tras v1.6, cuando quieras reproducir la puerta de calidad completa:

1. [`10-tests.md`](./10-tests.md#smoke-e2e-playwright) — setup E2E, matriz CI y tabla `AUTH_DISABLED` vs browser.
2. [`missions/16-smoke-e2e-playwright.md`](../missions/16-smoke-e2e-playwright.md) — `npm run test:e2e`, traces y screenshots.
3. [`NOTEBOOK.md`](../NOTEBOOK.md) — sección **Quality & CI (v2.0)** (errores reales E2E y Postgres CI).

### Ruta avanzada v2.1 (Advanced E2E)

Tras v2.0, cuando quieras CRUD E2E, Postgres y multi-browser:

1. [`10-tests.md`](./10-tests.md#crud-e2e-tres-dashboards) — CRUD E2E, Postgres (`test:e2e:pg`) y [matriz de navegadores](./10-tests.md#matriz-de-navegadores-local-vs-ci).
2. [`missions/17-crud-e2e-playwright.md`](../missions/17-crud-e2e-playwright.md) — `runCrudFlow`, trace y Network.
3. [`NOTEBOOK.md`](../NOTEBOOK.md) — sección **Advanced E2E (v2.1)**.

## Documentos

1. [`01-arquitectura.md`](./01-arquitectura.md)  
   Explica cómo se separan backend y frontend y qué papel cumple cada carpeta.

2. [`02-puesta-en-marcha.md`](./02-puesta-en-marcha.md)  
   Resume los pasos mínimos para arrancar API y dashboard y verificar que ambos se comunican.

3. [`03-api-express.md`](./03-api-express.md)  
   Presenta los endpoints actuales y los conceptos básicos de Express usados en la demo.

4. [`04-dashboard-fetch.md`](./04-dashboard-fetch.md)  
   Describe cómo el frontend llama a la API con `fetch()` y transforma JSON en interfaz.

5. [`05-cors-explicado.md`](./05-cors-explicado.md)  
   Aclara por qué hay un problema de origen cruzado y cómo se resuelve con `cors()`.

6. [`06-debugging.md`](./06-debugging.md)  
   Reúne problemas reales del laboratorio y la forma de diagnosticarlos.

7. [`07-retos.md`](./07-retos.md)  
   Propone ejercicios para extender el laboratorio paso a paso.

8. [`08-memoria-vs-persistencia.md`](./08-memoria-vs-persistencia.md)  
   Explica la diferencia entre estado en memoria y estado en disco, con ejemplos ejecutables.

9. [`13-sqlite.md`](./13-sqlite.md)  
   Explica SQLite en este lab: esquema, consultas, archivo `.db`, migración desde JSON y comparativa de drivers.

10. [`09-glosario.md`](./09-glosario.md)  
    Define los términos clave del laboratorio organizados por bloques temáticos.

11. [`10-tests.md`](./10-tests.md)  
    Suite de tests, smoke E2E Playwright, CI (sqlite + postgres + e2e) y scripts `test:sqlite` / `test:pg` / `test:e2e`.

12. [`11-openapi.md`](./11-openapi.md) *(avanzado, opcional)*  
    Explica qué es OpenAPI, cómo leer el YAML de la spec y por qué los equipos usan contratos formales.

13. [`12-docker.md`](./12-docker.md) *(avanzado, opcional)*  
    Explica qué es Docker, qué es una imagen y cómo arrancar la API en un contenedor local.

14. [`14-docker-compose.md`](./14-docker-compose.md) *(avanzado, opcional)*  
    Explica servicios, redes y volúmenes del stack Compose de este lab con ejemplos ejecutables.

15. [`15-postgresql.md`](./15-postgresql.md) *(avanzado, opcional)*  
    Explica `DATABASE_URL`, esquema Postgres, inspección con `psql`, volumen `postgres_data` y tests contra `edf_lab_test`.

16. [`16-frameworks.md`](./16-frameworks.md) *(avanzado, opcional)*  
    Compara estado, formularios, **auth en tres paneles** y HTTP entre `dashboard/`, `dashboard-react/` y `dashboard-vue/`.

17. [`17-autenticacion.md`](./17-autenticacion.md) *(avanzado, v1.5)*  
    Sesión del operador, bcrypt, JWT en cookie httpOnly, `credentials: 'include'` y rutas `/auth/*`.

18. [`18-production-deploy.md`](./18-production-deploy.md) *(avanzado, v1.5)*  
    Secretos con `.env`, `env_file` en Compose, fail-fast en producción y terminación TLS en nginx.

## Misiones prácticas

### Recorrido inicial

1. [`missions/01-arrancar-api.md`](../missions/01-arrancar-api.md) — Arranca la API y comprueba `/health`.
2. [`missions/02-arrancar-dashboard.md`](../missions/02-arrancar-dashboard.md) — Sirve el dashboard en `:5173`.
3. [`missions/03-consumir-json.md`](../missions/03-consumir-json.md) — Observa el flujo JSON en el navegador.
4. [`missions/04-romper-y-arreglar-cors.md`](../missions/04-romper-y-arreglar-cors.md) — Diagnostica CORS.
5. [`missions/05-mejorar-dashboard.md`](../missions/05-mejorar-dashboard.md) — Mejora la interfaz.
6. [`missions/06-restart-y-persistencia.md`](../missions/06-restart-y-persistencia.md) — Reinicio y datos en disco.
7. [`missions/07-corrupcion-y-restauracion.md`](../missions/07-corrupcion-y-restauracion.md) — JSON corrupto y semilla.

### Base de datos y tests

- [`missions/10-inspeccionar-sqlite.md`](../missions/10-inspeccionar-sqlite.md) — Inspecciona `users.db`, observa la migración desde JSON y verifica persistencia tras reinicio.

## Misiones avanzadas *(opcionales)*

- [`missions/08-explorar-openapi.md`](../missions/08-explorar-openapi.md) — Explora la spec OpenAPI en VS Code y Swagger Editor online. *(avanzado, opcional)*
- [`missions/09-arrancar-con-docker.md`](../missions/09-arrancar-con-docker.md) — Construye la imagen Docker y arranca la API en un contenedor. *(avanzado, opcional)*
- [`missions/11-arrancar-con-compose.md`](../missions/11-arrancar-con-compose.md) — Arranca el stack Compose, verifica CRUD y el bind mount `./api/data`. *(avanzado, opcional)*
- [`missions/12-postgres-compose-crud.md`](../missions/12-postgres-compose-crud.md) — Stack Compose con Postgres: CRUD, `psql` y persistencia en `postgres_data`. *(avanzado, opcional)*
- [`missions/13-frameworks-network-tab.md`](../missions/13-frameworks-network-tab.md) — API + React o Vue: CRUD e inspección en pestaña Network. *(avanzado, opcional)*
- [`missions/14-auth-vanilla-login-crud.md`](../missions/14-auth-vanilla-login-crud.md) — Login, CRUD protegido, logout e inspección de cookie en DevTools. *(avanzado, v1.5)*
- [`missions/15-framework-auth-login-crud.md`](../missions/15-framework-auth-login-crud.md) — Mismo flujo en React `:5174` o Vue `:5175` (v1.6). *(avanzado, opcional)*
- [`missions/16-smoke-e2e-playwright.md`](../missions/16-smoke-e2e-playwright.md) — Smoke E2E con Playwright (tres dashboards, traces). *(avanzado, v2.0)*
- [`missions/17-crud-e2e-playwright.md`](../missions/17-crud-e2e-playwright.md) — CRUD E2E, trace y depuración Network (v2.1). *(avanzado, v2.1)*
