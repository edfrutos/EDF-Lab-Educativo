# Stack Research

**Domain:** Educational Express API + static/Vite frontends — auth & production deploy  
**Researched:** 2026-06-01  
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `bcrypt` | ^5.x | Password hashing | Industry-standard teaching target; sync API ok for lab scale |
| `jsonwebtoken` | ^9.x | Signed session tokens | Stateless API auth; pairs well with Express middleware |
| `cookie-parser` | ^1.x | Parse `Cookie` header | httpOnly cookie transport for browser dashboards |
| Express middleware | existing | `requireAuth` guard | Matches current single-file `index.js` pedagogy |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `dotenv` | ^16.x (optional) | Load `.env` in dev | Only if not already loaded; prefer documenting `export VAR=` for beginners |
| nginx (Compose) | alpine | TLS termination | Optional advanced profile — terminate TLS at proxy, not in Node |

### What NOT to Add

| Avoid | Reason |
|-------|--------|
| Passport.js | Hides mechanism learners should see |
| OAuth providers | v1.5 defers social login |
| Redis session store | Overkill for single-machine lab |
| helmet-only as “security” | Teach auth + env first |

## Integration with Existing Stack

- **SQLite / Postgres:** Add `accounts` table to both `schema.sql` and `schema.pg.sql`; seed one admin via `seed.js` when empty.
- **CORS:** Enable `credentials: true` and explicit `origin` list (`5173`, `5174`, `5175`) — required for httpOnly cookies across ports.
- **Tests:** `supertest` sends `Cookie` header or uses `AUTH_DISABLED=1` in test env only (documented anti-pattern for prod).

## Installation

```bash
cd api && npm install bcrypt jsonwebtoken cookie-parser
```

---
*Research for milestone v1.5 — Production Auth & Deployment*
