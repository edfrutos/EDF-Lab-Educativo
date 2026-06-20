# Despliegue y producción

Guía conceptual para pasar del laboratorio en **localhost** a un entorno accesible por Internet (por ejemplo `https://lab.tudominio.com`).

No necesitas Kubernetes ni una cuenta cloud específica: el lab enseña **variables de entorno, secretos, TLS y proxy inverso**.

---

## Tres modos de ejecución

| Modo | Comando | Uso |
|------|---------|-----|
| **Host** | `npm start` + `python3 -m http.server 5173` | Aprendizaje local (principal) |
| **Compose dev** | `docker compose up` | Postgres + API + dashboard |
| **Compose prod** | `docker compose --profile prod up -d` | Stack con proxy TLS (servidor) |

---

## Arquitectura típica en servidor (Plesk)

```txt
Internet :443
    ↓
Plesk nginx (certificado Let's Encrypt del dominio)
    ↓ proxy_pass
https://127.0.0.1:9443  (contenedor edf-lab-proxy)
    ↓ red Docker
edf-lab-dashboard + edf-lab-api → edf-lab-postgres
```

```mermaid
flowchart LR
  U[Usuario HTTPS] --> P[Plesk nginx :443]
  P --> X[edf-lab-proxy :9443]
  X --> D[dashboard]
  X --> A[API :3100]
  A --> PG[(Postgres)]
```

El puerto **9443** es solo **localhost**; el público entra siempre por **443** del dominio.

---

## Variables de entorno y secretos

### Reglas de oro

1. **Nunca** subas `.env` al repositorio Git.
2. Usa `api/.env.example` como plantilla documentada.
3. En Compose, `env_file: ./api/.env` carga secretos fuera del YAML.

### API (`api/.env`)

```env
DATABASE_URL=postgresql://edf_lab:edf_lab_dev@edf-lab-postgres:5432/edf_lab
PORT=3100
AUTH_ENABLED=false
# AUTH_USER=admin
# AUTH_PASSWORD=...
# JWT_SECRET=...
```

Si `AUTH_ENABLED=true`, **JWT_SECRET**, **AUTH_USER** y **AUTH_PASSWORD** son obligatorios o la API no arranca (fail-fast).

### Raíz del proyecto (`.env` para Compose prod)

```env
PROD_HTTPS_PORT=9443
```

> **Importante:** el valor debe ser **solo el número de puerto** (`9443`), no `127.0.0.1:9443`. Si pones la IP en `PROD_HTTPS_PORT`, Docker falla con `invalid IP address: 127.0.0.1:127.0.0.1`.

---

## Docker Compose en producción (resumen)

Recomendaciones para VPS con Plesk:

| Servicio | Publicar en host | Motivo |
|----------|------------------|--------|
| `edf-lab-postgres` | **No** `5432:5432` | Suele chocar con Postgres del sistema |
| `edf-lab-api` | **No** (o solo `127.0.0.1:3100` para depurar) | Entrada vía proxy |
| `edf-lab-dashboard` | **No** | Entrada vía proxy |
| `edf-lab-proxy` | `127.0.0.1:9443:443` | Única puerta para Plesk |

Arranque:

```bash
docker compose --profile prod up -d --build
docker compose --profile prod ps
curl -sk -o /dev/null -w "%{http_code}\n" https://127.0.0.1:9443/
```

Persistencia tras reinicio del VPS:

```yaml
restart: unless-stopped
```

en cada servicio.

---

## Plesk: nginx del subdominio

**Un solo** bloque `location /` en *Directivas nginx adicionales*:

```nginx
location / {
    proxy_pass https://127.0.0.1:9443;
    proxy_ssl_verify off;
    proxy_ssl_server_name on;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_http_version 1.1;
}
```

Desactiva el **modo proxy** duplicado del panel si aparece:

```txt
duplicate location "/" in vhost_nginx.conf
```

---

## CORS en producción

`app.use(cors())` abierto vale para el laboratorio local. En producción conviene **restringir orígenes**:

```js
app.use(cors({
  origin: ['https://lab.tudominio.com'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

Sin `Authorization` en `allowedHeaders`, el navegador puede bloquear peticiones con Bearer tras un preflight OPTIONS.

---

## Checklist antes de dar por bueno un despliegue

- [ ] `docker compose --profile prod ps` — cuatro servicios **running**
- [ ] `curl -sk https://127.0.0.1:9443/` → **200**
- [ ] `https://lab.tudominio.com/` carga en el navegador
- [ ] `GET /health` visible sin login (si aplica)
- [ ] CRUD de usuarios funciona (con o sin auth según config)
- [ ] `.env` y secretos **no** están en Git
- [ ] `restart: unless-stopped` configurado
- [ ] Postgres **sin** puerto 5432 publicado si hay conflicto en el host

---

## Diagnóstico rápido

| Síntoma | Causa habitual |
|---------|----------------|
| **502 Bad Gateway** | Contenedores parados o proxy mal configurado |
| `curl 5173 → 000` | Normal si solo usas proxy (5173 no está en el host) |
| `bind: address already in use :5432` | Quita `ports` de postgres en compose |
| `invalid IP 127.0.0.1:127.0.0.1` | `PROD_HTTPS_PORT` mal en `.env` |
| API no arranca | `AUTH_ENABLED=true` sin `JWT_SECRET` |

Más errores reales: [`NOTEBOOK.md`](../NOTEBOOK.md) sección *Autenticación y despliegue (v1.5)*.

---

## Qué no hacemos en v1.5

- Despliegue gestionado en AWS/GCP/Azure paso a paso
- Kubernetes / Helm
- Certificados manuales dentro del código (Plesk/Let's Encrypt en el panel)
- Hashing de contraseñas con bcrypt en la API *(documentado como siguiente paso)*

---

## Enlaces

- Autenticación JWT: [`17-autenticacion.md`](./17-autenticacion.md)
- Compose local: [`14-docker-compose.md`](./14-docker-compose.md)
- Misión login: [`missions/14-login-y-token.md`](../missions/14-login-y-token.md)
