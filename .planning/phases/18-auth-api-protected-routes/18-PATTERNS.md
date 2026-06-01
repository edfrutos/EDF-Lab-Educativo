# Phase 18 Patterns

**Mapped:** 2026-06-01

## Closest analogs

| Pattern | Source | Reuse |
|---------|--------|-------|
| Dual schema files | `api/schema.sql` + `api/schema.pg.sql` (Phase 12) | Add `accounts` to both |
| Empty-DB seed | `api/seed.js` `populateIfEmptySqlite/Pg` | `seedAdminIfEmptyAccounts` |
| Error class + HTTP map | `DuplicateEmailError` → 409 in `index.js` | Auth errors → 401/403 |
| Test DB isolation | `index.test.js` `DB_FILE` before require | `AUTH_DISABLED` before require |
| Dual test suites | `index.test.js` + `index.pg.test.js` | Mirror auth `describe` in both |
| Spanish `{ error }` JSON | All routes in `index.js` | Login messages |

## New patterns introduced

- `api/auth.js` — first middleware module (keep `index.js` wiring visible)
- httpOnly cookie session — document in code comments for Phase 19 dashboard
