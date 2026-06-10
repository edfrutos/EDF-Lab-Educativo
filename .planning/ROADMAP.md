# Roadmap: EDF Lab Educativo

**Current Milestone:** v1.5 Authentication & Production Readiness (defined 2026-06-10)

## Milestones

- 🚧 **v1.5 Authentication & Production Readiness** — Phases 18–20 (planned 2026-06-10)
- ✅ **v1.0 Educational Lab MVP** — Phases 1–5 (shipped 2026-05-30)
- ✅ **v1.1 SQLite Persistence** — Phases 6–8 (shipped 2026-05-30)
- ✅ **v1.2 Docker & Compose** — Phases 9–11 (shipped 2026-05-31)
- ✅ **v1.3 PostgreSQL Persistence** — Phases 12–14 (shipped 2026-06-01)
- ✅ **v1.4 Frontend Framework Comparison** — Phases 15–17 (shipped 2026-06-01)

<details>
<summary>🚧 v1.5 Authentication & Production Readiness (Phases 18–20) — PLANNED 2026-06-10</summary>

- [ ] **Phase 18: API Authentication Layer** — `POST /auth/login`, JWT middleware, `AUTH_ENABLED`, tests
- [ ] **Phase 19: Dashboard Login Flow** — vanilla login/logout, Bearer in `fetch`, 401 handling
- [ ] **Phase 20: Auth & Production Learning Material** — docs 17–18, Mission 14, `.env.example`, OpenAPI

See [.planning/milestones/v1.5-ROADMAP.md](milestones/v1.5-ROADMAP.md) for full phase details.

</details>

<details>
<summary>✅ v1.4 Frontend Framework Comparison (Phases 15–17) — SHIPPED 2026-06-01</summary>

- [x] **Phase 15: React Dashboard Parity** — `dashboard-react/` on :5174, CRUD parity, CORS verified
- [x] **Phase 16: Vue Dashboard Parity** — `dashboard-vue/` on :5175, Composition API, CRUD parity
- [x] **Phase 17: Framework Learning Material** — `docs/16-frameworks.md`, Mission 13, unified UAT

See [.planning/milestones/v1.4-ROADMAP.md](milestones/v1.4-ROADMAP.md) for full phase details.

</details>

<details>
<summary>✅ v1.3 PostgreSQL Persistence (Phases 12–14) — SHIPPED 2026-06-01</summary>

- [x] **Phase 12: PostgreSQL Store** — `db-pg.js`, `DATABASE_URL`, parameterized queries
- [x] **Phase 13: Compose + Postgres** — Three-service stack, `compose:up`, seed on empty DB
- [x] **Phase 14: Postgres Learning Material** — `docs/15-postgresql.md`, Mission 12, 32/32 tests

See [.planning/milestones/v1.3-ROADMAP.md](milestones/v1.3-ROADMAP.md) for full phase details.

</details>

<details>
<summary>✅ v1.2 Docker & Compose (Phases 9–11) — SHIPPED 2026-05-31</summary>

- [x] **Phase 9: Dockerfile** — `api/Dockerfile`, `.dockerignore`, `npm run docker:build`
- [x] **Phase 10: Docker Compose** — `docker-compose.yml`, `compose:up` / `compose:down`
- [x] **Phase 11: Docker Learning Material** — `docs/14-docker.md`, Mission 11, NOTEBOOK Docker errors

See [.planning/milestones/v1.2-ROADMAP.md](milestones/v1.2-ROADMAP.md) for full phase details.

</details>

<details>
<summary>✅ v1.1 SQLite Persistence (Phases 6–8) — SHIPPED 2026-05-30</summary>

- [x] **Phase 6: SQLite Store** — `api/db.js`, `schema.sql`, `node:sqlite`, `DB_FILE`
- [x] **Phase 7: JSON→SQLite Migration** — Cold-start migration, preserved IDs, UNIQUE email
- [x] **Phase 8: SQLite Learning Material** — `docs/13-sqlite.md`, Mission 10, 16/16 tests

See [.planning/milestones/v1.1-ROADMAP.md](milestones/v1.1-ROADMAP.md) for full phase details.

</details>

<details>
<summary>✅ v1.0 Educational Lab MVP (Phases 1–5) — SHIPPED 2026-05-30</summary>

- [x] **Phase 1: API Foundation** — Express, CORS, health, users list
- [x] **Phase 2: Dashboard Fetch** — `fetch()`, loading/error states, contract alignment
- [x] **Phase 3: API CRUD** — Full user CRUD, validation, `curl` examples
- [x] **Phase 4: Dashboard CRUD** — Forms, edit/delete, Spanish feedback
- [x] **Phase 5: Learning Material** — Glossary, missions, OpenAPI, file persistence docs

See [.planning/milestones/v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md) for full phase details.

</details>

## Progress

**Overall:** 17/20 phases complete across all milestones (v1.5 in progress)

| Phase | Milestone | Plans | Status | Completed |
|-------|-----------|-------|--------|-----------|
| 18. API Authentication Layer | v1.5 | 3/3 | Complete | 2026-06-10 |
| 19. Dashboard Login Flow | v1.5 | 0/3 | Planned | — |
| 20. Auth & Production Learning Material | v1.5 | 0/2 | Planned | — |
| 1. API Foundation | v1.0 | 3/3 | Complete | 2026-05-26 |
| 2. Dashboard Fetch | v1.0 | 2/2 | Complete | 2026-05-26 |
| 3. API CRUD | v1.0 | 3/3 | Complete | 2026-05-27 |
| 4. Dashboard CRUD | v1.0 | 3/3 | Complete | 2026-05-28 |
| 5. Learning Material | v1.0 | 2/2 | Complete | 2026-05-30 |
| 6. SQLite Store | v1.1 | 3/3 | Complete | 2026-05-30 |
| 7. JSON→SQLite Migration | v1.1 | 3/3 | Complete | 2026-05-30 |
| 8. SQLite Learning Material | v1.1 | 2/2 | Complete | 2026-05-30 |
| 9. Dockerfile | v1.2 | 3/3 | Complete | 2026-05-31 |
| 10. Docker Compose | v1.2 | 3/3 | Complete | 2026-05-31 |
| 11. Docker Learning Material | v1.2 | 2/2 | Complete | 2026-05-31 |
| 12. PostgreSQL Store | v1.3 | 3/3 | Complete | 2026-06-01 |
| 13. Compose + Postgres | v1.3 | 3/3 | Complete | 2026-06-01 |
| 14. Postgres Learning Material | v1.3 | 2/2 | Complete | 2026-06-01 |
| 15. React Dashboard Parity | v1.4 | 3/3 | Complete | 2026-06-01 |
| 16. Vue Dashboard Parity | v1.4 | 3/3 | Complete | 2026-06-01 |
| 17. Framework Learning Material | v1.4 | 2/2 | Complete | 2026-06-01 |

---

*Roadmap format: .planning/ROADMAP.md (GSD). Archived milestone details: `.planning/milestones/v1.0-ROADMAP.md` … `v1.4-ROADMAP.md`.*
