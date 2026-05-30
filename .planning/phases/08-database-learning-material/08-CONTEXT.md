# Phase 8: Database Learning Material - Context

**Gathered:** 2026-05-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver guided documentation and a hands-on mission so learners understand SQLite in this lab: schema, queries, the `.db` file, JSON seed vs runtime store, and `node:sqlite` vs `better-sqlite3` trade-offs. Record real integration errors in `NOTEBOOK.md`. Update the docs index. **No API or dashboard code changes** unless a doc example reveals a factual inaccuracy.

**In scope (Phase 8):** DOCS-01..05 — new SQLite doc, new mission, driver comparison section, `docs/00-indice.md`, NOTEBOOK entries, align stale persistence docs with v1.1.

**Out of scope:** PostgreSQL, ORM, switching to `better-sqlite3`, dashboard 409 UX, Docker volume persistence docs, glossary overhaul beyond a few SQLite terms if planner sees fit.
</domain>

<decisions>
## Implementation Decisions

### Doc structure (DOCS-01, MIG-02 full treatment)
- **D-01:** Create **`docs/13-sqlite.md`** as the primary SQLite learning doc — schema (`api/schema.sql`), prepared queries as used in `api/db.js`, the `users.db` file, `DB_FILE` env var, cold-start migration from `users.json`, and executable localhost examples (curl + sqlite3 CLI).
- **D-02:** **Update `docs/08-memoria-vs-persistencia.md`** for v1.1 — runtime store is SQLite, `users.json` is seed/migration source only. Keep the memory-vs-disk pedagogical arc; add an "Evolución v1.1" section and cross-link to `docs/13-sqlite.md`. Do not merge all SQLite content into doc 08 (avoid one oversized chapter).
- **D-03:** **`docs/10-tests.md`** already has a brief JSON vs SQLite paragraph (Phase 7) — leave it as a pointer; expand comparison depth in `docs/13-sqlite.md`, not by duplicating long prose in doc 10.

### Driver comparison (DOCS-03)
- **D-04:** Include a dedicated section in **`docs/13-sqlite.md`**: `node:sqlite` (built-in, experimental warning, async, zero deps, this lab) vs `better-sqlite3` (npm native addon, sync API, common in production Node apps). Documentary only — no code switch.
- **D-05:** Comparison tone: beginner-friendly table + when-you'd-choose-each; cite PROJECT.md decision (v1.1 zero-deps teaching goal).

### Mission (DOCS-02)
- **D-06:** New **`missions/10-inspeccionar-sqlite.md`** — inspect DB with sqlite3, delete `users.db` and observe migration log, create user via curl/dashboard, restart API, verify persistence, optional reto: trigger 409 duplicate email.
- **D-07:** **Update `missions/06-restart-y-persistencia.md`** with a short top notice: v1.0 JSON-runtime steps are historical; for v1.1 follow Mission 10. Keep mission 06 file (learning path continuity) — minimal edit, not full rewrite.

### Inspection tooling
- **D-08:** **Primary tool: `sqlite3` CLI** — copy-paste commands in doc and mission (`sqlite3 api/data/users.db "SELECT * FROM users;"`). Lab completable without GUI.
- **D-09:** **Secondary optional: DB Browser for SQLite** — one paragraph as GUI alternative; not required for mission success.
- **D-10:** Explicitly teach that **`.db` is binary** — `cat`/`JSON.parse` do not apply; contrasts with Phase 2 JSON inspection from Mission 06.

### Index & discoverability (DOCS-04)
- **D-11:** Update **`docs/00-indice.md`**: add `docs/13-sqlite.md` in recommended reading after `08-memoria-vs-persistencia.md` (concept before deep dive); add `missions/10-inspeccionar-sqlite.md` to missions list (core track, not "avanzado opcional" like 08/09).
- **D-12:** Update **`README.md`** root if it still describes JSON as runtime store — brief v1.1 SQLite note + link to doc 13.

### NOTEBOOK entries (DOCS-05)
- **D-13:** Record **`ExperimentalWarning: SQLite is an experimental feature`** (Node 22 `node:sqlite`) — what it means, why safe to ignore in lab, link to Node docs.
- **D-14:** Record **`EADDRINUSE :3100`** when Docker container `edf-lab-api` and `npm start` both bind the port — diagnosis (`docker ps`, `docker stop`) and prevention.
- **D-15:** Record **cold-start migration** behavior — delete `users.db`, restart, expect `Migrados N usuarios desde users.json`; common learner confusion if log missing.
- **D-16:** Record **409 duplicate email** as API-level constraint (UNIQUE on email) — ties schema to HTTP status; optional screenshot reference from UAT.

### Claude's Discretion
- Whether to add 3–5 SQLite terms to `docs/09-glosario.md` (SQLite, schema, prepared statement, UNIQUE constraint, migration).
- Exact section headings and diagram style in `docs/13-sqlite.md` (match existing doc tone: ASCII flows, bash blocks).
- Whether `api/README.md` needs a one-line pointer to doc 13 (likely yes if not redundant).
- Plan split: ~2 plans — (1) docs 13 + 08 update + indice + README, (2) mission 10 + mission 06 notice + NOTEBOOK.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone & requirements
- `.planning/ROADMAP.md` — Phase 8 goal, success criteria, DOCS-01..05
- `.planning/REQUIREMENTS.md` — DOCS-01..05 traceability
- `.planning/PROJECT.md` — v1.1 constraints, node:sqlite decision, doc/mission/NOTEBOOK conventions
- `.planning/phases/07-migration-test-confidence/07-CONTEXT.md` — deferred MIG-02 full doc, migration semantics
- `.planning/phases/06-sqlite-persistence-layer/06-CONTEXT.md` — db.js, schema.sql, DB_FILE

### Implementation (facts docs must match)
- `api/db.js` — `initDb()`, `populateIfEmpty()`, migration from `USERS_JSON_PATH`, `DuplicateEmailError`
- `api/schema.sql` — `users` table, `email UNIQUE`
- `api/data/users.json` — seed format
- `api/data/users.db` — runtime file learners inspect
- `docs/10-tests.md` — JSON vs SQLite brief, DB_FILE test pattern

### Doc/mission patterns (v1.0)
- `docs/08-memoria-vs-persistencia.md` — stale v1.0 JSON-runtime narrative to update
- `docs/12-docker.md` — tone/structure reference for numbered docs
- `missions/06-restart-y-persistencia.md` — persistence mission to supersede with notice
- `missions/09-arrancar-con-docker.md` — mission template (objetivo, pasos, resultado, reto extra)
- `docs/00-indice.md` — index to update
- `NOTEBOOK.md` — error journal format

### UAT evidence
- `.planning/phases/07-migration-test-confidence/07-UAT.md` — migration, CRUD, 409 dashboard behavior

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `api/schema.sql` — paste/reference in doc 13 for learners
- `api/db.js` — real queries to excerpt (SELECT, INSERT, UPDATE, DELETE)
- Migration console log string: `Migrados N usuarios desde users.json`
- `docs/10-tests.md` § JSON vs SQLite — cross-link, don't duplicate

### Established Patterns
- Docs: Spanish, ASCII diagrams, executable bash/curl blocks, localhost :3100/:5173
- Missions: objetivo → pasos numerados → resultado esperado → reto extra
- NOTEBOOK: real errors with symptom, cause, fix, learning takeaway
- Advanced topics (11, 12) marked optional in indice; SQLite is **core v1.1**, not optional

### Integration Points
- Doc 08 narrative must align with Phase 6–7 implementation (no more `saveUsers()` to JSON on every mutation)
- Mission 10 replaces JSON `cat users.json` verification with sqlite3 SELECT
- README and indice are entry points — must reflect SQLite as current persistence story

</code_context>

<specifics>
## Specific Ideas

- Learner path: read doc 08 (memory/disk evolution) → doc 13 (SQLite hands-on) → mission 10 (do it).
- Driver comparison is conceptual homework for "what next in production" — not an implementation task.
- NOTEBOOK entries come from real Phase 6–7 UAT/dev friction, not invented scenarios.

</specifics>

<deferred>
## Deferred Ideas

- **Dashboard-friendly 409 message** — future UX phase; NOTEBOOK may mention generic dashboard error only
- **PostgreSQL doc/mission** — later milestone per PROJECT.md
- **Docker volume for persistent SQLite in container** — deferred from Phase 5; brief cross-ref in NOTEBOOK EADDRINUSE entry only
- **Full glossary rewrite for database terms** — optional discretion; not a requirement

</deferred>

---

*Phase: 8-Database Learning Material*
*Context gathered: 2026-05-30*
