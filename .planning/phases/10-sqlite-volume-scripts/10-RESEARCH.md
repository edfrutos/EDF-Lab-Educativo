# Phase 10 Research: SQLite Volume & Scripts

**Researched:** 2026-05-31
**Phase:** 10-sqlite-volume-scripts
**Focus:** Persist `users.db` across Compose restarts; helper scripts; ephemeral vs volume contrast doc

## Summary

Phase 10 adds a **bind mount** on `edf-lab-api` so container SQLite writes land on the host at `api/data/users.db`. Learners see the same path they already know from host dev. Root `package.json` wraps `docker compose up/down` for VOL-03. A brief docs/12-docker.md section covers VOL-02 (Mission 09 ephemeral vs Compose volume) without the full doc rewrite reserved for Phase 11 (DOCS-03).

## Key Findings

### 1. Volume type: bind mount vs named volume

| Approach | Teaching value | Verdict |
|----------|----------------|---------|
| Bind `./api/data:/usr/src/app/data` | Same path as `npm start`; inspectable with `sqlite3` on host | **Recommended** |
| Named volume `edf-lab-api-data` | Docker-native; harder to find on disk | Defer |

ROADMAP success criterion: "Learner can locate mounted volume or bind path" — bind mount satisfies VOL-01 clearly.

### 2. docker-compose.yml change

```yaml
edf-lab-api:
  volumes:
    - ./api/data:/usr/src/app/data
```

- Mount only on API service (dashboard is stateless)
- `docker compose down` without `-v` keeps host `api/data/users.db`
- Cold start: delete `api/data/users.db` on host → migration from `users.json` still runs (ROADMAP criterion 5)

### 3. Permissions

- `api/Dockerfile` already `chown -R node:node /usr/src/app` including `data/`
- Bind mount inherits host file permissions; ensure `api/data/` exists (git may track empty dir or only users.json)

### 4. Root scripts (VOL-03)

No root `package.json` exists today. Create minimal:

```json
{
  "name": "edf-lab-educativo",
  "private": true,
  "scripts": {
    "compose:up": "docker compose up --build",
    "compose:down": "docker compose down",
    "compose:logs": "docker compose logs -f"
  }
}
```

Update README optional section to mention `npm run compose:up`.

### 5. VOL-02 documentation scope

- Add section to `docs/12-docker.md`: contrast Mission 09 (`docker run` ephemeral) vs Compose with bind mount
- Do NOT full-rewrite doc 12 (DOCS-03 is Phase 11)
- Reference Phase 9 ephemeral UAT lesson explicitly

### 6. Phase 9 carry-forward

- D-14 deferred scripts → implement in Phase 10
- D-08 ephemeral stack → superseded for API data only via volume; dashboard still stateless

## Risks

| Risk | Mitigation |
|------|------------|
| Host `users.db` from npm start conflicts with container | Document: same file by design — bind mount unifies both paths |
| EADDRINUSE if host API also running | UAT note: stop host servers before compose |

---

## RESEARCH COMPLETE
