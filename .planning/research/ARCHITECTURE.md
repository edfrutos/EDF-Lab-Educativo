# Architecture Research

**Domain:** Auth layer on dual-DB Express lab  
**Researched:** 2026-06-01  
**Confidence:** HIGH

## Current Architecture (unchanged core)

```
Browser (:5173|:5174|:5175)
  → fetch(credentials: 'include')
  → Express :3100 (cors + json)
  → db.js router → SQLite | Postgres
```

## Proposed Additions

### Data model

```
accounts (id, email UNIQUE, password_hash, created_at)
  — separate from users CRUD table (keeps “app users” vs “dashboard operator” clear)
```

Seed: one admin account from `ADMIN_EMAIL` + `ADMIN_PASSWORD` env on empty DB.

### Request flow (authenticated)

```
POST /auth/login → verify bcrypt → sign JWT → Set-Cookie httpOnly
GET /users → requireAuth → db.getAllUsers()
```

### Middleware placement

```javascript
app.use(cookieParser());
app.use(cors({ origin: [...], credentials: true }));
// public routes first
app.post('/auth/login', ...);
app.post('/auth/logout', ...);
app.use('/users', requireAuth); // or per-route
```

### JWT payload (minimal)

`{ sub: accountId, email }` — expiry 8h for lab sessions (`JWT_EXPIRES_IN`).

### Production deploy slice

```
Internet → nginx (TLS) → api:3100
                → dashboard:80
         env_file: .env (gitignored)
         secrets: JWT_SECRET, DATABASE_URL, ADMIN_PASSWORD
```

Optional Compose profile `tls` with self-signed cert for local HTTPS demo.

## Build Order

1. Schema + seed + login API + middleware + API tests  
2. Vanilla dashboard login/logout + guarded fetch  
3. Env/Compose/deploy doc  
4. Learning doc + mission + NOTEBOOK  

## React/Vue (optional path)

Same cookie model if `credentials: 'include'` — no localStorage JWT in v1.5 (XSS lesson). Appendix only unless time in Phase 19.

---
*Research for milestone v1.5*
