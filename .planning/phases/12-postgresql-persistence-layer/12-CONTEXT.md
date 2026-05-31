# Phase 12: PostgreSQL Persistence Layer - Context

**Gathered:** 2026-05-31
**Status:** Ready for planning
**Mode:** auto (user selected "Tú decides")

<domain>
## Phase Boundary

Add PostgreSQL as an optional runtime persistence backend when `DATABASE_URL` is set, while keeping SQLite as the default for host `npm start`. Extend Compose with a `postgres` service (named volume). Same HTTP/JSON contract for the dashboard. **No** JSON seed migration, test suite updates, or learning docs in this phase — those belong to Phases 13–14.

</domain>

<decisions>
## Implementation Decisions

### Database adapter architecture
- **D-01:** Split persistence into **`db-sqlite.js`** (extract current logic) + **`db-pg.js`** (new) + **`db.js`** as thin router: if `process.env.DATABASE_URL` → Postgres, else SQLite.
- **D-02:** **Same exported API** from `db.js`: `initDb`, `getAllUsers`, `getUserById`, `createUser`, `updateUser`, `deleteUser`, `DuplicateEmailError` — `index.js` changes minimal.
- **D-03:** Use **`pg`** `Pool` with parameterized queries (`$1`, `$2`); one pool per process, lab-scale.

### Schema & SQL
- **D-04:** New **`api/schema.pg.sql`** — `SERIAL PRIMARY KEY`, `TEXT NOT NULL`, `UNIQUE` on email; mirrors SQLite semantics.
- **D-05:** Keep **`api/schema.sql`** unchanged for SQLite path.
- **D-06:** Map Postgres unique violation (`23505`) to **`DuplicateEmailError`** (409 unchanged).

### Compose Postgres service
- **D-07:** Service name **`edf-lab-postgres`**; image **`postgres:16-alpine`** (aligns with common Homebrew PG 16).
- **D-08:** **Named volume** `postgres_data:/var/lib/postgresql/data` — teachable contrast with SQLite **bind mount** `./api/data`.
- **D-09:** Dev-only credentials in compose: `POSTGRES_USER=edf_lab`, `POSTGRES_PASSWORD=edf_lab_dev`, `POSTGRES_DB=edf_lab` (document as fictional lab credentials).
- **D-10:** API service **`environment: DATABASE_URL=postgresql://edf_lab:edf_lab_dev@edf-lab-postgres:5432/edf_lab`**; `depends_on: edf-lab-postgres`.
- **D-11:** Publish Postgres **`5432:5432`** on host so learners can run `psql` from the Mac (Mission 12 prep).
- **D-12:** Add **`healthcheck`** with `pg_isready` on postgres; API `depends_on` postgres with **`condition: service_healthy`** (first healthcheck in this lab — justified for PG startup race).

### SQLite coexistence
- **D-13:** **`npm start` without `DATABASE_URL`** → SQLite path unchanged (PGSQL-05).
- **D-14:** Keep **`./api/data` bind mount** on API in compose for **`users.json`** seed file access; when `DATABASE_URL` is set, **`users.db` is not the runtime store**.
- **D-15:** Do **not** remove SQLite code or Compose SQLite bind mount in Phase 12.

### Phase 12 vs 13 boundary
- **D-16:** Phase 12: schema creation on `initDb`, CRUD against Postgres, Compose wiring. **`populateIfEmpty` / JSON seed for Postgres deferred to Phase 13** (PGMIG-01).
- **D-17:** Empty Postgres + manual POST/ dashboard CRUD is sufficient for Phase 12 verification.

### Out of scope (locked)
- **D-18:** No dashboard/`app.js` changes; no ORM; no auth; no removing SQLite; no doc 15 / Mission 12 (Phase 14).

### Claude's Discretion
- Exact file split lines inside `db-sqlite.js` vs minimal diff; Pool size; compose YAML comment style; whether to log `Using PostgreSQL` vs `Using SQLite` on startup.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone & Requirements
- `.planning/ROADMAP.md` — Phase 12 goal, success criteria, PGSQL/PGCOMPOSE reqs
- `.planning/REQUIREMENTS.md` — PGSQL-01…05, PGCOMPOSE-01…03
- `.planning/PROJECT.md` — v1.3 intent, SQLite default constraint

### Existing persistence (SQLite v1.1)
- `api/db.js` — current SQLite implementation to extract
- `api/schema.sql` — SQLite schema reference
- `api/index.js` — route handlers consuming db module
- `docs/13-sqlite.md` — prior DB learning path

### Compose (v1.2)
- `docker-compose.yml` — extend with postgres service
- `.planning/phases/09-compose-stack-foundation/09-CONTEXT.md` — ports, depends_on patterns
- `.planning/phases/10-sqlite-volume-scripts/10-RESEARCH.md` — bind mount vs named volume

### API contract
- `dashboard/app.js` — `API_BASE_URL` unchanged
- `api/openapi.yaml` — User schema unchanged

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `api/db.js` — full CRUD + DuplicateEmailError + initDb pattern to mirror in `db-pg.js`
- `api/schema.sql` — column contract for `schema.pg.sql`
- `docker-compose.yml` — add third service alongside edf-lab-api/dashboard

### Established Patterns
- Env-based config: `DB_FILE` for SQLite tests → extend with `DATABASE_URL` for Postgres
- Async db functions already exported — `pg` async fits without changing route signatures
- Phase 6 pattern: routes delegate to db module, HTTP contract frozen

### Integration Points
- `index.js` → `initDb()` at startup — must await Postgres pool connect + schema apply
- `docker-compose.yml` → wire DATABASE_URL into edf-lab-api environment
- `api/package.json` → add `pg` dependency (first DB npm dep — educational trade-off documented)

</code_context>

<specifics>
## Specific Ideas

- Mirror v1.1 milestone structure: persistence layer phase first, migration/tests next, docs last.
- Named volume for Postgres vs bind mount for SQLite is an intentional teaching contrast.
- User chose auto defaults — prioritize beginner transparency over abstraction.

</specifics>

<deferred>
## Deferred Ideas

- JSON/`users.json` seed into empty Postgres → **Phase 13** (PGMIG-01)
- Test suite against Postgres → **Phase 13** (PGTEST-*)
- `docs/15-postgresql.md`, Mission 12 → **Phase 14**
- SQLite vs PostgreSQL comparison doc → **Phase 13** (PGMIG-02) + **Phase 14**
- nginx reverse proxy — remains advanced reto (Phase 11 doc 14)

</deferred>

---

*Phase: 12-postgresql-persistence-layer*
*Context gathered: 2026-05-31*
