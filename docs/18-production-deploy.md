# Despliegue en producción: secretos y TLS en el proxy

Guía didáctica del laboratorio **v1.5**: cómo externalizar secretos con `.env`, arrancar el stack Compose sin credenciales en el YAML, y dónde termina HTTPS (nginx) frente a HTTP interno entre contenedores.

> Prerrequisitos: autenticación operador ([`docs/17-autenticacion.md`](./17-autenticacion.md)), Compose básico ([`docs/14-docker-compose.md`](./14-docker-compose.md)).

---

## Objetivo

En un despliegue real:

1. Los **secretos** (JWT, contraseñas de operador, URL de base de datos) viven en archivos o gestores de secretos **fuera** del repositorio y de las imágenes Docker.
2. El **TLS** (HTTPS) suele terminarse en un **proxy inverso** (nginx, Caddy, Traefik). Node y nginx del dashboard sirven HTTP **dentro** de la red privada; el usuario solo ve `https://` hacia el proxy.

Este laboratorio no automatizaba certificados ni Kubernetes; en **v2.5 fase 42** el perfil Compose `prod` implementa el patrón con `edf-lab-proxy`. La **fase 43** activa `NODE_ENV=production`, cookies `Secure` y `trust proxy`. Let's Encrypt sigue en fase 44.

---

## Perfil Compose `prod` (fase 42)

Un único origen HTTPS en el host; la API se alcanza bajo **`/api`** sin cambiar rutas en Express.

```txt
                    Host
                      |
                      |  HTTPS :443
                      v
              +-------------------+
              | edf-lab-proxy     |
              | (nginx edge TLS)  |
              +-------------------+
                   |         |
         strip /api|         | HTTP :5173
                   v         v
            +-----------+  +------------------+
            | edf-lab-  |  | edf-lab-         |
            | api       |  | dashboard        |
            | :3100 int |  | (nginx estático) |
            +-----------+  +------------------+
                   |
                   v
            +------------------+
            | edf-lab-postgres |
            +------------------+
```

### Arranque

```bash
cp api/.env.example api/.env   # JWT_SECRET + DATABASE_URL (edf-lab-postgres)
./scripts/generate-dev-tls.sh  # deploy/certs/lab.crt + lab.key (gitignored)
npm run compose:prod
./scripts/smoke-prod-proxy.sh  # detecta PROD_HTTPS_PORT en .env raíz si aplica
```

- **`npm run compose:up`** (sin profile) sigue publicando `:3100` y `:5173` — misiones 11/12 intactas.
- **`npm run compose:prod`** no publica `:3100`/`:5173`; solo HTTPS vía proxy (por defecto **`:443`** en el host).
- Si **`:443` está ocupado**, crea `.env` en la **raíz del repo** con `PROD_HTTPS_PORT=9443` (u otro puerto libre) y abre `https://localhost:9443`.
- Certs **autofirmados**: `curl` requiere `-k`; el navegador muestra advertencia — acéptala para probar login.
- Dashboard prod usa **`API_BASE_URL='/api'`** (build-arg en imagen); dev host sigue `http://localhost:3100` en `dashboard/app.js`.

### Modo production en `compose:prod` (fase 43)

`docker-compose.prod.yml` inyecta en el contenedor API:

| Variable | Valor | Efecto |
|----------|-------|--------|
| `NODE_ENV` | `production` | Cookies `Secure`; fail-fast sin `JWT_SECRET` |
| `TRUST_PROXY` | `1` | Express confía en un salto nginx (`X-Forwarded-Proto`) |

**No** se activa en `npm start` en el host ni en `compose:up` sin perfil prod — el flujo dev HTTP en `:3100`/`:5173 no cambia.

### Trust proxy y cookies Secure

nginx envía `X-Forwarded-Proto: https` hacia Express. Con `TRUST_PROXY=1`, la API no asume que el cliente habla HTTPS directamente con Node (solo HTTP interno en `:3100`).

La cookie `edf_session` lleva `Secure` cuando `NODE_ENV=production`. El navegador **solo** la envía por HTTPS terminada en el proxy.

**Checklist manual:** abre `https://localhost` (o tu puerto `PROD_HTTPS_PORT`, p. ej. `https://localhost:9443`). El navegador mostrará **«La conexión no es privada»** con cert autofirmado — en Chrome: *Avanzado* → *Acceder a localhost (no seguro)*. Luego inicia sesión en el dashboard y comprueba que el CRUD carga.

**Checklist automatizada:**

```bash
./scripts/smoke-prod-proxy.sh
# o, si usas puerto distinto:
PROD_PROXY_URL=https://localhost:9443 ./scripts/smoke-prod-proxy.sh
```

El smoke verifica login, flag `Secure` en `Set-Cookie` y `GET /api/users` autenticado.

### Enrutado nginx (implementado)

`proxy/nginx.conf`:

```nginx
location /api/ {
    proxy_pass http://edf-lab-api:3100/;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto https;
}

location / {
    proxy_pass http://edf-lab-dashboard:5173;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto https;
}
```

OAuth y login usan el mismo prefijo: `/api/auth/login`, `/api/auth/oauth/start`, etc.

---

## Secretos con `.env`

### Copiar la plantilla

Desde la carpeta `api/`:

```bash
cd api
cp .env.example .env
```

Edita `.env` en local. **Nunca** lo subas a git (está en `.gitignore`).

### Variables clave

| Variable | Uso |
|----------|-----|
| `JWT_SECRET` | Firma de la cookie de sesión — obligatoria si `NODE_ENV=production` |
| `JWT_EXPIRES_IN` | Duración del token (p. ej. `24h`) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Operador inicial si la tabla `accounts` está vacía |
| `CORS_ORIGINS` | Orígenes del dashboard (5173, 5174, 5175) con cookies |
| `DATABASE_URL` | Postgres en Compose o en host |
| `AUTH_DISABLED` | **Solo tests** — nunca en producción |

### Fail-fast en producción

Si arrancas con `NODE_ENV=production` sin definir `JWT_SECRET`, la API **no llega a escuchar**:

```txt
[fatal] JWT_SECRET es obligatorio cuando NODE_ENV=production. Copia api/.env.example a api/.env y define una clave larga.
```

En desarrollo local (sin `NODE_ENV=production`) puedes omitir `JWT_SECRET`: verás un aviso y se usará una clave solo para laboratorio.

Comprueba el arranque:

```bash
cd api
NODE_ENV=production PORT=3100 npm start
# Debe fallar hasta que JWT_SECRET esté en .env

# Tras definir JWT_SECRET en .env:
NODE_ENV=production PORT=3100 npm start
curl http://localhost:3100/health
```

---

## Compose y `env_file`

El servicio `edf-lab-api` en `docker-compose.yml` carga variables desde **`./api/.env`**:

```yaml
env_file:
  - ./api/.env
```

Antes del primer `compose up`:

1. `cp api/.env.example api/.env`
2. Define `JWT_SECRET` (cadena larga aleatoria)
3. Descomenta y ajusta `DATABASE_URL` para la red interna de Compose:

```txt
DATABASE_URL=postgresql://edf_lab:edf_lab_dev@edf-lab-postgres:5432/edf_lab
```

El hostname `edf-lab-postgres` es el **nombre del servicio** Docker, no `localhost`.

Arranque desde la raíz del repo:

```bash
npm run compose:up
curl http://localhost:3100/health
```

Las credenciales de Postgres en el servicio `edf-lab-postgres` siguen siendo **ficticias de laboratorio** en el YAML; en producción real también irían externalizadas.

---

## TLS en nginx (terminación)

En producción, el navegador habla HTTPS con el proxy. El proxy reenvía HTTP a los contenedores. En este repo, el servicio **`edf-lab-proxy`** (perfil `prod`) implementa ese patrón — ver [Perfil Compose `prod`](#perfil-compose-prod-fase-42) arriba.

**Por qué importa para auth:** la cookie `edf_session` usa el flag `Secure` cuando `NODE_ENV=production` (activo en `compose:prod`). El navegador **solo** la envía por HTTPS. Verificación automatizada: `scripts/smoke-prod-proxy.sh` (fase 43).

### Snippet nginx educativo (referencia histórica)

Fragmento mínimo que ilustraba terminación TLS antes de implementar `edf-lab-proxy`:

```nginx
server {
    listen 443 ssl;
    server_name lab.ejemplo.local;

    ssl_certificate     /etc/nginx/certs/lab.crt;
    ssl_certificate_key /etc/nginx/certs/lab.key;

    location / {
        proxy_pass http://edf-lab-api:3100;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto https;
    }
}
```

El dashboard estático podría exponerse en otro `server` o `location` con `proxy_pass http://edf-lab-dashboard:5173`. Ajusta nombres de host según tu red Compose o swarm.

---

## Qué no cubre este lab

- Automatización Let's Encrypt / cert-manager
- Kubernetes Secrets o Vault
- Despliegue cloud gestionado (Railway, Fly.io, etc.) — ideas en `.planning/research/ARCHITECTURE.md`
- Pantallas de login en React/Vue (fases posteriores)

---

## Resumen ejecutable

```bash
# 1. Secretos
cp api/.env.example api/.env
# Editar .env: JWT_SECRET, DATABASE_URL para Compose

# 2. Stack local
npm run compose:up

# 3. Comprobar
curl http://localhost:3100/health
# Login operador vía dashboard :5173 o POST /auth/login
```

Para el flujo didáctico completo de autenticación: [`docs/17-autenticacion.md`](./17-autenticacion.md).
