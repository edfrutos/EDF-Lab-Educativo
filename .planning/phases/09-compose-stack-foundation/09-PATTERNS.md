# Phase 9 Pattern Map

**Mapped:** 2026-05-31

## New Files → Closest Analogs

| New file | Analog | Pattern to reuse |
|----------|--------|------------------|
| `docker-compose.yml` | `api/package.json` docker scripts | Port `3100:3100`, service naming `edf-lab-api` |
| `dashboard/Dockerfile` | `api/Dockerfile` | Minimal COPY, EXPOSE port, no unnecessary layers |
| `dashboard/nginx.conf` | — (new) | Static file server; keep config readable in separate file |

## Existing Assets

- `api/Dockerfile` — reuse unchanged as Compose build for API service
- `api/package.json` — `docker:build` / `docker:start` remain for Mission 09 single-container path
- `dashboard/app.js` — `API_BASE_URL = 'http://localhost:3100'` unchanged
- `api/db.js` — `populateIfEmpty()` + migration log when `users.json` present

## Integration Points

```
docker-compose.yml (root)
  ├── edf-lab-api → build ./api → ports 3100:3100
  └── edf-lab-dashboard → build ./dashboard → ports 5173:5173 → depends_on api
```

Browser (host) → localhost:5173 (nginx static) + fetch → localhost:3100 (Express)

---

## PATTERN MAPPING COMPLETE
