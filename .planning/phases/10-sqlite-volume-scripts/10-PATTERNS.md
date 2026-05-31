# Phase 10 Pattern Map

**Mapped:** 2026-05-31

## Changes → Analogs

| Target | Analog | Pattern |
|--------|--------|---------|
| `docker-compose.yml` volumes | Phase 9 ports/depends_on | Extend existing compose file; comment each new key |
| Root `package.json` scripts | `api/package.json` docker scripts | npm script wrappers for beginners |
| `docs/12-docker.md` section | Existing ephemeral table in doc 12 | Add row for Compose + bind mount |

## Integration

- `api/db.js` → `DATA_DIR/users.db` — bind mount makes container path == host path
- Phase 9 UAT Test 4 (ephemeral) → Phase 10 UAT inverts expectation (data persists)

---

## PATTERN MAPPING COMPLETE
