# Despliegue en producción: secretos y TLS en el proxy

Guía didáctica del laboratorio **v1.5**: cómo externalizar secretos con `.env`, arrancar el stack Compose sin credenciales en el YAML, y dónde termina HTTPS (nginx) frente a HTTP interno entre contenedores.

> Prerrequisitos: autenticación operador ([`docs/17-autenticacion.md`](./17-autenticacion.md)), Compose básico ([`docs/14-docker-compose.md`](./14-docker-compose.md)).

---

## Objetivo

En un despliegue real:

1. Los **secretos** (JWT, contraseñas de operador, URL de base de datos) viven en archivos o gestores de secretos **fuera** del repositorio y de las imágenes Docker.
2. El **TLS** (HTTPS) suele terminarse en un **proxy inverso** (nginx, Caddy, Traefik). Node y nginx del dashboard sirven HTTP **dentro** de la red privada; el usuario solo ve `https://` hacia el proxy.

Este laboratorio no automatiza certificados ni Kubernetes; enseña el **patrón** que luego escalarás en v1.6+.

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

En producción, el navegador habla HTTPS con el proxy. El proxy reenvía HTTP a los contenedores:

```txt
                    Internet
                        |
                        |  HTTPS :443
                        v
              +-------------------+
              |  nginx (proxy)    |
              |  TLS terminado    |
              +-------------------+
                   |         |
         HTTP :3100|         |HTTP :5173
                   v         v
            +-----------+  +------------------+
            | edf-lab-  |  | edf-lab-         |
            | api       |  | dashboard        |
            | (Express) |  | (nginx estático) |
            +-----------+  +------------------+
                   |
                   |  red Docker interna
                   v
            +------------------+
            | edf-lab-postgres |
            +------------------+
```

**Por qué importa para auth:** la cookie `edf_session` usa el flag `Secure` cuando `NODE_ENV=production`. El navegador **solo** la envía por HTTPS. Sin TLS delante, el login en “modo producción” no se comporta como en un entorno real.

Para una demo local con HTTPS puedes usar un certificado autofirmado en nginx; este lab no incluye scripts de Let's Encrypt (ver REQUIREMENTS.md — diferido a v1.6+).

### Snippet nginx educativo (no production-ready)

Fragmento mínimo para ilustrar terminación TLS y proxy hacia la API:

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
