# NOTEBOOK

Diario vivo del laboratorio educativo.

Aquí se documentan decisiones, errores reales, soluciones aplicadas y aprendizajes. No sustituye al README: lo complementa con contexto histórico y razonamiento.

---

## Frameworks (v1.4)

Errores y patrones al usar `dashboard-react/` (`:5174`) o `dashboard-vue/` (`:5175`) contra la misma API. Guía: [`docs/16-frameworks.md`](./docs/16-frameworks.md), CORS: [`docs/05-cors-explicado.md`](./docs/05-cors-explicado.md).

### Error CORS al abrir :5174 o :5175

**Síntoma:** La consola del navegador muestra *blocked by CORS policy*; la tabla de usuarios no carga.

**Causa:** El frontend se sirve desde un origen distinto al de la API (`http://localhost:3100`). Si la API no está en marcha o `cors()` no responde al preflight, el navegador bloquea la petición.

**Solución:**

```bash
cd api && PORT=3100 npm start
```

Comprueba en Network que las peticiones van a `:3100` y devuelven 200. En este lab `api/index.js` ya usa `cors()` abierto; no hace falta whitelist salvo entornos restrictivos.

**Aprendizaje:** CORS es del **navegador**, no de Express “fallando”. El mismo `fetch` en vanilla `:5173` puede funcionar y en `:5174` fallar si solo arrancaste un servidor y no el otro.

*Patrón documentado (fases 15–16).*

---

## Autenticación y despliegue (v1.5)

Errores y patrones de las fases 18–21: sesión del operador, cookies, secretos y Compose. Guías: [`docs/17-autenticacion.md`](./docs/17-autenticacion.md), [`docs/18-production-deploy.md`](./docs/18-production-deploy.md).

### 401 en `/users` con la API en marcha

**Síntoma:** `GET /health` responde 200, pero `/users` devuelve 401; en Network la petición no lleva cabecera `Cookie`.

**Causa:** Sin login previo, o el cliente no envía credenciales cross-origin. En este lab, `fetch` debe incluir `credentials: 'include'` (ya lo hace `fetchJson` en vanilla).

**Solución:** Completa `POST /auth/login` desde el dashboard o curl con `-c` cookie jar. Verifica en DevTools → Network → Request Headers → `Cookie: edf_session=...`.

**Aprendizaje:** 401 aquí significa **sesión ausente o inválida**, no que la API esté caída.

*Error real (fases 18–19).*

---

### Fail-fast sin JWT_SECRET en producción

**Síntoma:** Al arrancar con `NODE_ENV=production`, la consola muestra `[fatal] JWT_SECRET es obligatorio...` y el proceso termina.

**Causa:** En producción la API exige una clave de firma en `api/.env`; no usa el valor solo-desarrollo.

**Solución:** Copia `api/.env.example` → `api/.env`, define una clave larga para JWT y vuelve a arrancar. En desarrollo local (sin `NODE_ENV=production`) puedes omitirla con aviso.

**Aprendizaje:** **Fail-fast** evita desplegar sin secretos — preferible a firmar tokens con una clave por defecto.

*Error real (fase 20).*

---

### git-secrets bloquea commits con JWT_SECRET en el repo

**Síntoma:** `git commit` falla con `[ERROR] Matched one or more prohibited patterns` en líneas que contienen la variable JWT con signo igual.

**Causa:** Hook `git-secrets` del repositorio prohíbe patrones que parecen secretos en archivos trackeados (`.env.example`, docs, planes).

**Solución:** En plantillas y documentación, **documenta** la variable en comentarios sin asignación literal en archivos que van a git. Los valores reales viven solo en `api/.env` (gitignored).

**Aprendizaje:** Proteger secretos incluye **no commitear** placeholders que activen hooks o filtros CI.

*Error real (fase 20).*

---

### 403 en login vs 401 en `/users`

**Síntoma:** Contraseña incorrecta → mensaje bajo el formulario de login (403). Sin sesión en rutas protegidas → 401.

**Causa:** `POST /auth/login` devuelve **403** para credenciales inválidas; `requireAuth` devuelve **401** cuando falta o expiró la cookie.

**Solución:** Distingue en la UI: error de login inline vs gate de sesión. Ver [`docs/06-debugging.md`](./docs/06-debugging.md).

**Aprendizaje:** No mezclar mensajes de **autenticación fallida** (login) con **autorización/sesión** (recursos protegidos).

*Patrón documentado (fase 19).*

---

### Puerto en uso (EADDRINUSE) — 5173 vs Vite

**Síntoma:** `Error: listen EADDRINUSE: address already in use :::5174` (o 5175) al hacer `npm run dev`.

**Causa:** Otro proceso (a menudo otro dev server o un intento previo) ya ocupa ese puerto. **No** uses 5173 para Vite: ese puerto está reservado al dashboard vanilla con `python3 -m http.server 5173`.

**Solución:**

```bash
lsof -i :5174   # o :5175
# termina el proceso que liste el puerto, o cierra la terminal anterior
```

**Aprendizaje:** Tres frontends = tres puertos fijos documentados: **5173**, **5174**, **5175**.

*Patrón documentado.*

---

### `VITE_API_BASE_URL` incorrecta o ausente

**Síntoma:** El panel framework muestra error de conexión aunque la API responde en `:3100`; la barra de herramientas puede mostrar una URL inesperada.

**Causa:** Variable de entorno mal copiada en `.env`, o apuntas a otro host/puerto. Si omites `.env`, el default en código es `http://localhost:3100`.

**Solución:**

```bash
cd dashboard-react   # o dashboard-vue
cp .env.example .env
# VITE_API_BASE_URL=http://localhost:3100
```

Reinicia `npm run dev` tras cambiar `.env`.

**Aprendizaje:** Vite solo expone variables con prefijo `VITE_` al cliente. Vanilla no usa `.env`: la URL está en `dashboard/app.js`.

*Patrón documentado.*

---

### `strictPort` — Vite no cambia de puerto solo

**Síntoma:** Vite termina con error indicando que el puerto 5174 (o 5175) está ocupado y **no** arranca en otro puerto.

**Causa:** `vite.config.js` define `strictPort: true` a propósito, para que la documentación y CORS coincidan siempre con el mismo origen.

**Solución:** Libera el puerto (ver EADDRINUSE) en lugar de esperar que Vite use 5176.

**Aprendizaje:** Coherencia didáctica > comodidad automática de puerto.

*Patrón documentado.*

---

## Framework Auth & CI (v1.6)

Errores y patrones de las fases 22–25: login en React/Vue, rate limit, CI y documentación. Guías: [`docs/16-frameworks.md`](./docs/16-frameworks.md), [`missions/15-framework-auth-login-crud.md`](./missions/15-framework-auth-login-crud.md), [`docs/10-tests.md`](./docs/10-tests.md).

### Documentación frameworks desactualizada (401 en React/Vue)

**Síntoma:** Sigues `docs/16-frameworks.md` o misión 13 de v1.4 y esperas CRUD sin login; `GET /users` devuelve **401**.

**Causa:** Desde v1.6, React y Vue tienen `LoginGate`. La documentación antigua recomendaba `AUTH_DISABLED=1` como camino principal.

**Solución:** Usa el formulario de login (`admin@lab.local` / `changeme`) o la [`missions/15-framework-auth-login-crud.md`](./missions/15-framework-auth-login-crud.md). Actualiza lecturas a la sección auth de doc 16.

**Aprendizaje:** La documentación es producto del lab — debe actualizarse cuando el código avanza.

*Error real (fase 25 / transición v1.4 → v1.6).*

---

### HTTP 429 al probar login repetidamente

**Síntoma:** Tras muchos intentos fallidos en el formulario de login, la API responde **429** con JSON en español.

**Causa:** `express-rate-limit` en `POST /auth/login` (fase 24). Por defecto: 10 intentos por ventana de 15 minutos por IP.

**Solución:** Espera la ventana, o en desarrollo local baja `LOGIN_RATE_LIMIT_MAX` en `api/.env`. No desactives el limiter en producción.

**Aprendizaje:** El rate limit protege el endpoint de autenticación sin bloquear el resto de la API.

*Error real (fase 24).*

---

### CI en GitHub: script `test:sqlite` y flag `--test-force-exit`

**Síntoma:** El workflow CI falla con `Could not find '.../api/--test-force-exit'`.

**Causa:** Con varios archivos de test, el flag `--test-force-exit` debe ir **antes** de los nombres de archivo: `node --test --test-force-exit index.test.js rate-limit.test.js`.

**Solución:** Corregido en `api/package.json`. Localmente: `cd api && npm run test:sqlite` (24 tests).

**Aprendizaje:** El orden de argumentos de `node --test` importa en CI igual que en local.

*Error real (fase 24 / push a main).*

---

## Quality & CI (v2.0)

Errores y patrones de las fases 26–29: Playwright E2E, tres dashboards en CI y Postgres obligatorio en PRs. Guías: [`docs/10-tests.md`](./docs/10-tests.md), [`missions/16-smoke-e2e-playwright.md`](./missions/16-smoke-e2e-playwright.md).

### Playwright: `getByLabel('Email')` resuelve a 2 elementos

**Síntoma:** `npm run test:e2e` falla en vanilla con *strict mode violation*: `getByLabel('Email') resolved to 2 elements` (`#login-email` y `#user-email-input` del CRUD).

**Causa:** El dashboard vanilla muestra el formulario de login y, en el DOM, el input de email del CRUD (aunque el panel esté oculto). Playwright cuenta ambos labels «Email».

**Solución:** Acota el selector al formulario de login — por ejemplo `page.locator('#login-form').getByLabel('Email')` o `page.locator('#login-email')`. El helper [`e2e/helpers/auth-smoke-flow.js`](./e2e/helpers/auth-smoke-flow.js) usa `#login-email`, válido también en React/Vue.

**Aprendizaje:** `getByRole` / `getByLabel` globales pueden colisionar; alinea selectores entre los tres paneles.

*Error real (fase 26 / primer smoke E2E).*

---

### Playwright: `ERR_CONNECTION_REFUSED` con tres proyectos en paralelo

**Síntoma:** Los tres specs (`vanilla`, `react`, `vue`) fallan al instante con `net::ERR_CONNECTION_REFUSED` en `:5173`, `:5174` o `:5175`.

**Causa:** Cada proyecto tenía su propio `webServer` incluyendo la API en `:3100`. Con **varios workers**, varios procesos intentan bindear el mismo puerto o los servidores no llegan a estar listos.

**Solución:** Un único array `webServer` en la raíz de `e2e/playwright.config.js` (API + vanilla + React + Vue) y tres **proyectos** que solo cambian `baseURL` y `testMatch`. En CI, `workers: 1` reduce flakes.

**Aprendizaje:** Orquestación de puertos es responsabilidad del config E2E, no del código de producción.

*Error real (fase 27 / multi-dashboard).*

---

### `test:pg` en local sin Postgres en marcha

**Síntoma:** `cd api && npm run test:pg` falla con `ECONNREFUSED` o timeout al conectar a `localhost:5432`.

**Causa:** La suite Postgres necesita un servidor escuchando con la base `edf_lab_test`. En CI, el job `test-postgres` levanta `postgres:16`; en local debes arrancarlo tú.

**Solución:**

```bash
npm run test:db:prepare
docker compose up -d edf-lab-postgres
cd api && npm run test:pg
```

**Aprendizaje:** Desde v2.0, Postgres en PRs no es opcional — el mismo contrato debe funcionar en tu máquina antes de abrir el PR.

*Error real (fase 28 / adopción CI obligatorio).*

---

## Advanced E2E (v2.1)

Errores y patrones de las fases 30–33: CRUD E2E compartido, Postgres E2E y multi-browser en CI. Guías: [`docs/10-tests.md`](./docs/10-tests.md), [`missions/17-crud-e2e-playwright.md`](./missions/17-crud-e2e-playwright.md).

### API stale al alternar `test:e2e` y `test:e2e:pg`

**Síntoma:** `test:e2e:pg` pasa en CI pero falla en local con errores de datos, 409 en email duplicado, o la API parece seguir en SQLite (logs sin `[db] Using PostgreSQL`).

**Causa:** En local, `reuseExistingServer: true` reutiliza el proceso en `:3100` arrancado por un `test:e2e` anterior con `DB_FILE` (SQLite). Playwright no reinicia la API con `DATABASE_URL`.

**Solución:**

```bash
lsof -i :3100   # identifica el PID
kill <pid>      # o cierra la sesión tmux edf-api
npm run test:e2e:pg
```

Alternativa: `CI=true npm run test:e2e:pg` fuerza servidores frescos.

**Aprendizaje:** El backend E2E depende del env con el que arrancó la API; alternar SQLite ↔ Postgres requiere reiniciar `:3100`.

*Error real (fase 32 / perfil Postgres E2E).*

---

### Postgres E2E sin base `edf_lab_e2e`

**Síntoma:** `npm run test:e2e:pg` falla al arrancar la API con error de conexión o «database edf_lab_e2e does not exist».

**Causa:** El perfil `playwright.config.pg.js` apunta a `edf_lab_e2e`, distinta de `edf_lab_test` (tests API) y de `edf_lab` (Compose dev).

**Solución:**

```bash
docker compose up -d edf-lab-postgres
npm run test:db:prepare    # crea edf_lab_test y edf_lab_e2e
npm run test:e2e:pg
```

**Aprendizaje:** Tres bases, tres propósitos — ver tabla en [`docs/10-tests.md`](./docs/10-tests.md#e2e-contra-postgres).

*Error real (fase 32 / bootstrap edf_lab_e2e).*

---

### Firefox: primera ejecución local

**Síntoma:** `npm run test:e2e:firefox` o `test:e2e:ci` falla con mensaje de browser no instalado.

**Causa:** Solo `playwright:install` instala Chromium; Firefox requiere instalación explícita.

**Solución:**

```bash
npm run playwright:install:ci
# o: npx playwright install firefox
npm run test:e2e:firefox
```

**Aprendizaje:** CI instala `chromium firefox` en `e2e-smoke`; en local debes hacerlo tú para probar multi-browser.

*Error real (fase 33 / multi-browser CI).*

---

## Visual Regression (v2.2)

Errores y patrones de las fases 34–36: snapshots Playwright, baselines por dashboard y puerta visual en CI. Guías: [`docs/10-tests.md`](./docs/10-tests.md), [`missions/18-visual-regression-playwright.md`](./missions/18-visual-regression-playwright.md).

### Playwright visual falla: `Executable doesn't exist`

**Síntoma:** `npm run test:visual` o `test:visual:ci` falla al arrancar con mensaje de Playwright indicando que no existe el ejecutable de Chromium.

**Causa:** En entornos efímeros/sandbox, los binarios de navegador no están instalados aunque el proyecto tenga Playwright configurado.

**Solución:**

```bash
npx playwright install chromium
npm run test:visual
```

En validaciones CI-like locales: `CI=true npm run test:visual:ci`.

**Aprendizaje:** La suite visual depende de binarios del navegador, no solo de `node_modules`. En entorno temporal, instalar Chromium es parte del setup.

*Error real (fases 34–36).*

---

### Snapshot flake por contenido dinámico (timestamp/filas)

**Síntoma:** Snapshot mismatch intermitente aun sin cambios de UI intencionales.

**Causa:** Elementos dinámicos (`timestamp`, filas de tabla variables) cambian entre ejecuciones y generan diff visual no semántico.

**Solución:** Mantener máscaras visuales en `#health-timestamp` y `#users-table-body`, junto con `maxDiffPixelRatio: 0.01`, y actualizar baselines solo con cambios intencionales.

**Aprendizaje:** En visual regression, estabilidad de estado importa tanto como el assert. Sin control de zonas dinámicas, el snapshot gate pierde señal.

*Error real (fases 34–35).*

---

### Fallo en `visual-regression` sin contexto suficiente

**Síntoma:** El job CI visual falla pero no queda claro qué cambió en la UI desde el log de consola.

**Causa:** El mensaje de error textual no siempre muestra la diferencia visual completa.

**Solución:** Revisar artefactos del job `visual-regression` en GitHub Actions (`test-results`, `playwright-report`) antes de decidir update de baseline.

**Aprendizaje:** El diagnóstico de regresión visual en PR debe apoyarse en artefactos de diff; actualizar snapshot sin revisarlos puede ocultar regresiones reales.

*Error real (fase 36).*

---

## 2026-06-01 · PostgreSQL v1.3 — errores de integración

### Connection refused al conectar a Postgres

**Síntoma:** La API o `psql` fallan con `ECONNREFUSED` en `localhost:5432`, o los tests PG no arrancan.

**Causa:** El servicio `edf-lab-postgres` no está en marcha (Compose parado o solo levantaste la API).

**Solución:**

```bash
# Desde la raíz del repo
docker compose up -d edf-lab-postgres
docker compose ps   # debe mostrar healthy en postgres
psql postgresql://edf_lab:edf_lab_dev@localhost:5432/edf_lab -c "SELECT 1;"
```

**Aprendizaje:** Postgres es un proceso aparte de Node. La API con `DATABASE_URL` depende de que ese servicio exista y pase el healthcheck antes de `edf-lab-api`.

---

### Tests de Postgres fallan (base inexistente)

**Síntoma:** `npm run test:pg` o `npm test` fallan con error de base de datos `edf_lab_test` no encontrada.

**Causa:** No se ejecutó el script de preparación o Postgres no está escuchando.

**Solución:**

```bash
docker compose up -d edf-lab-postgres
npm run test:db:prepare
cd api && npm run test:pg
```

**Aprendizaje:** Los tests PG usan una BD **aislada** (`edf_lab_test`), distinta de `edf_lab` de desarrollo. Crearla es un paso explícito del lab.

---

### `DATABASE_URL` en el shell rompe tests SQLite

**Síntoma:** `npm run test:sqlite` intenta usar Postgres o falla de forma inesperada tras exportar `DATABASE_URL` en la terminal.

**Causa:** `process.env.DATABASE_URL` heredado del shell; la suite SQLite borra la variable en `index.test.js`, pero conviene no contaminar el entorno.

**Solución:**

```bash
unset DATABASE_URL
cd api && npm run test:sqlite
```

O abre una terminal nueva sin exportar la variable.

**Aprendizaje:** El router `api/db.js` lee el entorno al cargar el módulo. Separar terminales para “modo Postgres” y “modo SQLite” reduce confusiones didácticas.

---

### Puerto 5432 ya ocupado (Homebrew vs Compose)

**Síntoma:** `docker compose up` falla al publicar `5432:5432` o `psql` conecta a una instancia distinta a la del lab.

**Causa:** Otro Postgres en el Mac (p. ej. `brew services start postgresql@16`) usa el mismo puerto.

**Solución:**

```bash
brew services list
# Detén el servicio local o cambia el mapeo de puertos en docker-compose.yml (solo experimentación)
docker compose up -d edf-lab-postgres
```

**Aprendizaje:** Un puerto solo puede escuchar un proceso. En el lab, Compose publica **5432** para que `psql` desde el host coincida con la documentación.

---

## 2026-05-31 · Docker Compose v1.2 — errores de integración

### Docker daemon no disponible

**Síntoma:** Al ejecutar `npm run compose:up` o `docker compose up`:

```txt
Cannot connect to the Docker daemon. Is the docker daemon running?
```

**Causa:** Docker Desktop (o el daemon Docker) no está arrancado en tu Mac.

**Solución:**

```bash
# Abre Docker Desktop y espera a que esté listo
docker info
# Debe mostrar información del servidor sin error
npm run compose:up
```

**Aprendizaje:** Compose depende del mismo daemon que `docker run`. Sin daemon, ningún comando Docker funciona.

---

### EADDRINUSE en puerto 3100 (Docker + npm start)

**Síntoma:** `Error: listen EADDRINUSE: address already in use :::3100` al hacer `npm start` en `api/`.

**Causa:** Un contenedor Docker (`edf-lab-api`), el **stack Compose** (`edf-lab-api` vía `docker compose up`) u otra instancia de la API ya ocupa el puerto 3100 — habitual si probaste [`missions/09-arrancar-con-docker.md`](missions/09-arrancar-con-docker.md), [`missions/11-arrancar-con-compose.md`](missions/11-arrancar-con-compose.md) o Compose y no paraste los contenedores.

**Solución:**

```bash
docker ps
docker stop edf-lab-api
npm run compose:down
# o: docker compose down
# o identifica el PID que usa 3100 y para ese proceso
```

**Aprendizaje:** Solo un proceso puede escuchar en un puerto. No mezcles Docker en 3100 y `npm start` local sin parar el primero.

---

### EADDRINUSE en puerto 5173 (host + Compose dashboard)

**Síntoma:** El contenedor `edf-lab-dashboard` falla al arrancar; error de bind en puerto 5173.

**Causa:** `python3 -m http.server 5173` u otro proceso ya usa el puerto del dashboard en el host.

**Solución:** Para el servidor estático del host (`Ctrl+C`) o ejecuta `npm run compose:down` antes de volver a subir el stack.

**Aprendizaje:** Compose publica `:5173` en el host igual que el servidor Python de desarrollo — no pueden convivir sin cambiar puertos.

---

### Confusión: Misión 09 pierde datos pero Compose no

**Síntoma:** Tras Misión 09 el usuario creado desaparece; tras Misión 11 sobrevive. ¿Es un bug?

**Causa:** Misión 09 usa `docker run` **sin volumen** — SQLite efímero dentro del contenedor. Misión 11 usa Compose con **bind mount** `./api/data` — el mismo mecanismo que `npm start` en el host.

**Solución:** No es inconsistencia; son dos lecciones distintas. Consulta la tabla de tres modos en [`docs/12-docker.md`](docs/12-docker.md).

**Aprendizaje:** Los volúmenes (o su ausencia) definen si los datos sobreviven al ciclo de vida del contenedor.

---

## 2026-05-30 · SQLite v1.1 — avisos y errores de integración

### ExperimentalWarning al arrancar con node:sqlite

**Síntoma:** Al ejecutar `PORT=3100 npm start` aparece en consola:

```txt
(node:XXXX) ExperimentalWarning: SQLite is an experimental feature and might change at any time
```

**Causa:** Node.js 22 expone `node:sqlite` como API experimental. El laboratorio la usa a propósito (cero dependencias npm).

**Solución:** En este lab puedes ignorar el aviso de forma segura. La API arranca y funciona con normalidad. Si desaparece en futuras versiones de Node, actualiza esta nota.

**Aprendizaje:** “Experimental” en Node no significa que tu código falle; significa que la API puede cambiar entre versiones mayores. Para producción muchos equipos usan `better-sqlite3` o PostgreSQL — ver [`docs/13-sqlite.md`](docs/13-sqlite.md).

---

### EADDRINUSE en puerto 3100 (Docker + npm start)

**Síntoma:** `Error: listen EADDRINUSE: address already in use :::3100` al hacer `npm start` en `api/`.

**Causa:** Un contenedor Docker (`edf-lab-api`), el stack Compose u otra instancia de la API ya ocupa el puerto 3100.

**Solución:** Ver la sección ampliada en [Docker Compose v1.2](#2026-05-31--docker-compose-v12--errores-de-integración) (incluye `npm run compose:down`).

**Aprendizaje:** Solo un proceso puede escuchar en un puerto. No mezcles Docker en 3100 y `npm start` local sin parar el primero.

---

### Migración cold start — log “Migrados N usuarios desde users.json”

**Síntoma:** Tras borrar `api/data/users.db` y reiniciar, algunos alumnos no ven el mensaje de migración o la tabla parece vacía.

**Causa:** La migración solo corre si `SELECT COUNT(*) FROM users` es 0 **después** de crear el esquema. Si la API no se reinició del todo o quedó un `.db` residual, no migra.

**Solución:**

```bash
cd api
rm -f data/users.db
PORT=3100 npm start
# Esperado: Migrados 2 usuarios desde users.json
curl -s http://localhost:3100/users
```

**Aprendizaje:** `users.json` es semilla; `users.db` es runtime. Borrar solo el JSON no resetea SQLite.

---

### HTTP 409 — email duplicado (UNIQUE constraint)

**Síntoma:** Crear un usuario con un email ya existente (p. ej. `john@example.com`) devuelve 409. El dashboard muestra un error genérico con “estado HTTP 409”.

**Causa:** `schema.sql` define `email TEXT NOT NULL UNIQUE`. SQLite rechaza el INSERT; `db.js` lanza `DuplicateEmailError` y la ruta responde 409 con `Ya existe un usuario con ese email.`

**Solución:** Usar un email distinto o editar el usuario existente. No es un fallo de CORS ni de conexión.

**Aprendizaje:** Las reglas de integridad pueden vivir en la base, no solo en JavaScript. Ver UAT Fase 7 y [`docs/13-sqlite.md`](docs/13-sqlite.md).

---

## 2026-05-27 · Auditoría de situación del repositorio

### Contexto

Revisión completa del estado del repositorio al inicio de una nueva sesión de trabajo.

### Estado verificado de Phase 01

Todo lo implementado en Phase 01 está funcionando correctamente:

- `node --check api/index.js` → OK
- `node --check dashboard/app.js` → OK
- `npm audit --audit-level=high` → 0 vulnerabilidades

El dashboard CRUD completo opera correctamente: formulario compartido crear/editar, botones Editar/Eliminar por fila, feedback método+endpoint, confirm() nativo antes de DELETE, estados loading/online/offline/error.

### Anomalía detectada: git tracking incompleto

El repositorio tiene un desfase importante entre lo que existe en disco y lo que está en git:

**Archivos trackeados (comprometidos):**

```txt
.planning/          ← toda la planificación GSD
AGENTS.md
NOTEBOOK.md
dashboard/app.js
dashboard/index.html    ← con cambios sin commit
dashboard/styles.css    ← con cambios sin commit
docs/04-dashboard-fetch.md
missions/05-mejorar-dashboard.md
```

**Archivos sin trackear (nunca comprometidos):**

```txt
api/                ← ⚠️ TODO el backend Express
docs/00-03, 05-07   ← 6 de 7 capítulos de documentación
missions/01-04      ← 4 de 5 misiones
README.md
ROADMAP.md
CHANGELOG.md
CLAUDE.md
.gitignore
```

Esto significa que si alguien clona el repositorio solo recibe el frontend y la planificación, pero no la API. El backend completo existe en disco pero nunca se ha commiteado.

### Aprendizaje

Separar el trabajo de planificación (commits GSD) del trabajo de código puede dejar archivos de código en disco sin llegar a git. Conviene hacer un commit de estado completo antes de iniciar una nueva fase para tener un snapshot limpio y reproducible.

### Acción recomendada antes de Phase 02

Hacer un commit que incluya todos los archivos sin trackear relevantes:

```bash
git add api/ docs/ missions/ README.md ROADMAP.md CHANGELOG.md CLAUDE.md .gitignore
git add dashboard/index.html dashboard/styles.css
git commit -m "chore: commit full project snapshot before phase 02"
```

---

## 2026-05-23 · Nacimiento del laboratorio

### Contexto

Partimos de una API Express mínima ubicada originalmente en:

```txt
/Users/edefrutos/Desktop/test-project
```

Después se creó un frontend externo:

```txt
/Users/edefrutos/Desktop/users-dashboard
```

Finalmente ambos proyectos se agruparon en:

```txt
/Users/edefrutos/Desktop/express-api-demo
```

### Decisión

Convertir la demo en un laboratorio educativo con estructura:

```txt
api/       → backend Express
dashboard/ → frontend consumidor
docs/      → documentación conceptual
missions/  → ejercicios guiados
```

### Motivo

Separar backend y frontend ayuda a aprender conceptos reales de desarrollo web moderno:

- API REST,
- JSON,
- `fetch()`,
- CORS,
- puertos,
- debugging,
- documentación técnica.

---

## Problema real: puerto 3000 ocupado

### Síntoma

Al intentar usar `localhost:3000`, el puerto estaba ocupado por otro proceso relacionado con Docker.

### Decisión

Usar:

```txt
API:       http://localhost:3100
Dashboard: http://localhost:5173
```

### Aprendizaje

El puerto forma parte del origen. Por tanto:

```txt
http://localhost:3100
http://localhost:5173
```

son orígenes distintos para el navegador.

---

## Problema real: CORS

### Síntoma

El frontend necesita llamar a la API desde otro puerto.

### Solución

Se instaló y configuró `cors` en la API:

```js
const cors = require('cors');

app.use(cors());
```

### Aprendizaje

CORS no es un error de Express, sino una política de seguridad del navegador.

---

## Problema real: Node/npm fuera de sincronía

### Síntoma

`npm audit` mostraba un aviso porque npm 11 se estaba ejecutando con Node 16.

### Diagnóstico

`which node` apuntaba a Heroku y `which npm` a Homebrew.

### Solución

Reordenar la configuración del shell para que `nvm` tenga prioridad.

Estado correcto final:

```txt
node → ~/.nvm/versions/node/v22.22.3/bin/node
npm  → ~/.nvm/versions/node/v22.22.3/bin/npm
```

### Aprendizaje

El orden del `PATH` determina qué binario se ejecuta realmente.

---

## Regla de trabajo

Cada mejora educativa debe responder a estas preguntas:

1. ¿Qué concepto enseña?
2. ¿Qué archivo toca?
3. ¿Cómo se prueba?
4. ¿Qué error típico ayuda a entender?
5. ¿Dónde queda documentado?

---

## 2026-05-26 · Dashboard CRUD desde el navegador

### Contexto

La API ya tenía rutas CRUD en memoria, pero el dashboard solo hacía lecturas con `GET`. Para alumnos principiantes faltaba ver el ciclo completo:

```txt
formulario -> fetch() -> API Express -> JSON -> tabla actualizada
```

### Decisiones

- Usar un único formulario para crear y editar usuarios.
- Mostrar el modo de edición con `Editando usuario {id}`.
- Usar `confirm()` nativo antes de `DELETE /users/:id`.
- Mostrar feedback con método y endpoint:
  - `POST /users -> usuario creado`
  - `PUT /users/:id -> usuario actualizado`
  - `DELETE /users/:id -> usuario eliminado`

### Motivo

El formulario compartido evita duplicar interfaz y ayuda a explicar que crear y editar son casi el mismo flujo: leer campos, construir JSON, llamar a la API y refrescar la tabla.

La confirmación nativa con `confirm()` evita introducir todavía modales, estado adicional o componentes complejos. La prioridad de esta fase es entender HTTP, no construir un sistema de diseño avanzado.

### Problema real corregido

El dashboard todavía mostraba una ruta antigua para arrancar la API:

```txt
/Users/edefrutos/Desktop/express-api-demo/api
```

Se corrigió a:

```txt
/Users/edefrutos/Desktop/EDF-Lab-Educativo/api
```

### Aprendizaje

Para principiantes, el feedback `METODO endpoint -> resultado` es más útil que mostrar JSON crudo. Hace visible qué petición se acaba de enviar y conecta la acción del botón con el endpoint de Express.

### Cómo se valida

```bash
node --check dashboard/app.js
rg -n "POST /users|PUT /users/:id|DELETE /users/:id" dashboard docs missions NOTEBOOK.md
```

### Problema real: caché del navegador en el dashboard

Durante la revisión visual se veía el HTML nuevo, pero no aparecían los botones `Editar` y `Eliminar`, y el formulario no usaba el layout esperado.

Diagnóstico:

```txt
index.html actualizado
app.js/styles.css antiguos en caché del navegador
```

Solución aplicada:

```html
<link rel="stylesheet" href="./styles.css?v=phase-01-crud" />
<script src="./app.js?v=phase-01-crud"></script>
```

Aprendizaje: en proyectos estáticos, el navegador puede reutilizar CSS o JS anteriores aunque el HTML ya haya cambiado. Añadir una versión en la URL del asset fuerza la recarga sin introducir herramientas nuevas.

---

## 2026-05-26 · Sincronizacion documental

### Contexto

El codigo de `api/index.js` ya habia evolucionado hasta incluir rutas de lectura, rutas CRUD en memoria, validacion basica y endpoints auxiliares.

Sin embargo, parte de la documentacion seguia describiendo el estado anterior:

- `api/README.md` hablaba de una API minima con solo tres endpoints.
- varias instrucciones usaban rutas antiguas como `express-api-demo` o `test-project`.
- `ROADMAP.md` mantenia sin marcar tareas que ya estaban implementadas.

### Decision

Sin tocar la logica de la app, se sincronizo la documentacion con el estado real:

- `ROADMAP.md` ahora marca como completadas las tareas ya implementadas.
- `api/README.md` se reescribio con endpoints actuales y ejemplos ejecutables.
- `README.md`, `docs/` y `missions/` usan la ruta actual `EDF-Lab-Educativo`.
- `CHANGELOG.md` registra la version `0.2.0`.

### Aprendizaje

La documentacion tambien puede tener deuda tecnica. Cuando el codigo avanza y la documentacion no, el proyecto se vuelve mas dificil de aprender aunque funcione correctamente.

### Como se valida

```bash
node --check api/index.js
node --check dashboard/app.js
rg -n "express-api-demo|test-project|localhost:3000" README.md api/README.md ROADMAP.md docs missions
```

---

## 2026-05-25 · Evolución de la API mínima

### Contexto

La primera versión del laboratorio solo mostraba rutas de lectura:

- `GET /`
- `GET /health`
- `GET /users`

Eso servía para introducir Express y `fetch()`, pero se quedaba corta para enseñar operaciones típicas de una API.

### Decisión

Ampliar `api/index.js` con una API en memoria más útil para aprender:

- `GET /users/:id`
- `POST /users`
- `PUT /users/:id`
- `DELETE /users/:id`
- `GET /about`
- `GET /time`

Además, actualizar:

- `docs/03-api-express.md`,
- `docs/07-retos.md`,
- `README.md`.

### Motivo

Esto permite enseñar:

- parámetros de ruta,
- lectura de `req.body`,
- códigos HTTP básicos,
- creación, edición y borrado,
- endpoints utilitarios para practicar consumo desde el dashboard.

### Aprendizaje

Una API educativa gana mucho valor cuando no solo expone datos, sino que también permite modificarlos con un contrato simple y observable.


---

## Fase 3 — Fix: parseUserId rechazaba mal los IDs con prefijo numérico

**Fecha:** 2026-05-28
**Archivo:** `api/index.js` función `parseUserId()`

### Error encontrado

`Number.parseInt('1abc', 10)` devuelve `1` — acepta el prefijo numérico y descarta el resto.
Esto hacía que `GET /users/1abc` no devolviera 400 sino que buscaba el usuario con id=1.

### Comportamiento incorrecto

```bash
# Antes del fix:
curl http://localhost:3100/users/1abc
# → 200 { id: 1, name: 'John Doe', ... }  ← debería ser 400
```

### Fix aplicado

```javascript
// ANTES (bug):
function parseUserId(value) {
  const id = Number.parseInt(value, 10);  // '1abc' → 1
  return Number.isInteger(id) ? id : null;
}

// DESPUÉS (fix):
function parseUserId(value) {
  // Number.parseInt('1abc', 10) devuelve 1 — acepta prefijo numérico.
  // Number('1abc') devuelve NaN — rechaza cualquier carácter no numérico.
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}
```

### Aprendizaje

`Number.parseInt` está diseñado para parsear texto con unidades (`parseInt('10px')` → 10). Para validar que un string ES un entero puro, `Number()` es más estricto: convierte el string completo o devuelve `NaN`.

La condición `id > 0` también rechaza `0` como ID válido, lo que es correcto porque los IDs empiezan en 1.

### Tests que documentan el fix

```bash
# Desde api/
npm test
# Los tres casos están en la suite "Validación de IDs":
# ✓ GET /users/1abc responde 400
# ✓ GET /users/0 responde 400
# ✓ GET /users/abc responde 400
```

---

## Fase 3 — Fix: loadUsers() necesario en beforeEach cuando no hay startServer()

**Fecha:** 2026-05-28
**Archivo:** `api/index.test.js` — función `beforeEach` (líneas 29-34) + `api/index.js` (línea 251)

### Error encontrado

Al importar `api/index.js` para los tests con `require('./index.js')`, el guard
`require.main === module` impide que `startServer()` se ejecute. Esto significa que
`loadUsers()` nunca se llama al importar el módulo, y el array `users[]` arranca vacío.
El primer test que pedía `GET /users` devolvía `[]` en lugar de los 2 usuarios del fixture.

### Fix aplicado

```javascript
// ANTES (sin exportar loadUsers — los tests no podían recargar el estado):
module.exports = app;

// DESPUÉS (loadUsers exportado explícitamente):
module.exports = app;
module.exports.loadUsers = loadUsers;
```

Y en el test:

```javascript
beforeEach(async () => {
  // Arrange: restaurar fixture limpio antes de cada test y recargar estado en memoria.
  // Necesario porque users[] es un array en memoria; sin startServer() el array está vacío.
  await writeFile(TEST_FILE, JSON.stringify(TEST_SEED, null, 2), 'utf8');
  await app.loadUsers();  // ← esto es lo que carga users[] desde el fixture
});
```

### Aprendizaje

Cuando un módulo tiene estado en memoria (un array global como `users[]`), los tests deben
tener una forma de restaurar ese estado antes de cada caso. Exportar funciones de setup
(`loadUsers`) es el patrón estándar para esto en Node.js.

### Tests que documentan el fix

```bash
# Desde api/
npm test
# Todos los tests de GET /users y mutaciones dependen de beforeEach para tener datos válidos.
```

---

## Fase 3 — Decisión: guard require.main === module en api/index.js

**Fecha:** 2026-05-28
**Archivo:** `api/index.js` — bloque condicional final (líneas 260-265)

### Contexto

Los tests importan `api/index.js` con `require('./index.js')`.
Si el servidor arrancara al ser importado, el test runner abriría un puerto real
(3100) y `loadUsers()` leería del archivo de producción `data/users.json`
en lugar del fixture de tests `data/users.test.json`.

### Decisión aplicada

```javascript
// Sin el guard (problema): el servidor arranca SIEMPRE que alguien haga require('./index.js')
startServer();  // ← esto se ejecutaría al importar para tests

// Con el guard (solución): el servidor solo arranca cuando el archivo se ejecuta directamente
if (require.main === module) {
  startServer().catch((err) => {
    console.error('[error] No se pudo arrancar el servidor:', err);
    process.exit(1);
  });
}
```

### Aprendizaje

`require.main === module` es `true` cuando Node.js ejecuta el archivo directamente
(`node index.js`), y `false` cuando otro módulo lo importa (`require('./index.js')`).
Este patrón es habitual en cualquier módulo que deba funcionar tanto como programa
independiente como como librería importable.

```bash
# Verificar que index.js se puede importar sin arrancar el servidor:
node -e "const app = require('./api/index.js'); console.log('importado sin servidor')"
```

---

## 2026-05-27 · Observación: los datos en memoria desaparecen al reiniciar la API

### Contexto

Durante la Fase 2, antes de implementar la persistencia en archivo, el estado de la
API vivía únicamente en un array JavaScript en RAM (`let users = [...]`). Esta es
la configuración que verá cualquier alumno al clonar el proyecto por primera vez.

### Lo observado

```bash
# 1. Arrancar la API
cd api && PORT=3100 npm start

# 2. Crear un usuario
curl -s -X POST http://localhost:3100/users \
  -H 'Content-Type: application/json' \
  -d '{"name":"Alumno Prueba","email":"prueba@example.com"}'
# → { "id": 3, "name": "Alumno Prueba", ... }

# 3. Parar la API (Ctrl+C) y volver a arrancar
PORT=3100 npm start

# 4. Pedir la lista de usuarios
curl -s http://localhost:3100/users
# → Solo aparecen John Doe y Jane Smith — el usuario creado ha desaparecido.
```

Este comportamiento es el punto de partida de la Fase 2: motivar por qué existe la
persistencia en archivo.

### Aprendizaje

El estado de un proceso Node.js no persiste entre ejecuciones. Cuando el proceso
termina, la RAM se libera y con ella todos los arrays y objetos que vivían en memoria.
Para que los datos sobrevivan a un reinicio es necesario escribirlos en un medio
persistente (un archivo, una base de datos).

Ver la solución implementada en `docs/08-memoria-vs-persistencia.md`.

---

## Criterio para nuevas entradas

**NOTEBOOK = errores reales + decisiones no obvias.** Si algo te sorprendió, causó un bug, o requirió una decisión que no es evidente leyendo el código, va aquí.

**docs/ = conceptos enseñables desde cero.** Si necesitas explicar un concepto a alguien que no ha visto el problema, escribe un documento en `docs/`.
