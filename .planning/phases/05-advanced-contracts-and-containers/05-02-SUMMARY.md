---
phase: "05"
plan: "02"
subsystem: docker-infrastructure
tags: [docker, dockerfile, alpine, education, missions, docs]
completed_date: "2026-05-29T16:33:33Z"

dependency_graph:
  requires: []
  provides:
    - api/Dockerfile
    - api/.dockerignore
    - api/package.json (docker:build, docker:start scripts)
    - docs/12-docker.md
    - missions/09-arrancar-con-docker.md
  affects:
    - api/package.json (scripts extended, no deps added)

tech_stack:
  added: []
  patterns:
    - node:22-alpine Docker base image
    - npm ci --omit=dev for production deps
    - USER node after COPY (non-root container)
    - CMD ["node", "index.js"] for direct SIGTERM handling
    - ENV PORT=3100 to prevent port mismatch with process.env.PORT default

key_files:
  created:
    - api/Dockerfile
    - api/.dockerignore
    - docs/12-docker.md
    - missions/09-arrancar-con-docker.md
  modified:
    - api/package.json

decisions:
  - "node:22-alpine chosen over node:22 (150MB vs 1GB image size — educationally significant difference)"
  - "CMD node index.js not npm start — SIGTERM reaches Node.js process directly"
  - "ENV PORT=3100 in Dockerfile prevents silent port mismatch (index.js defaults to 3000)"
  - "USER node after COPY blocks — Pitfall 4 from RESEARCH.md applied"
  - "data/users.json excluded from .dockerignore — container starts from SEED_DATA, reinforces ephemerality concept"
  - "ADV-03 confirmed deferred — no DB elements introduced in this plan"

metrics:
  duration_minutes: 2
  tasks_completed: 2
  tasks_total: 2
  files_created: 4
  files_modified: 1
---

# Phase 05 Plan 02: Docker Infrastructure Summary

Docker infrastructure added as optional advanced route for the API: node:22-alpine Dockerfile with ENV PORT=3100 critical fix, .dockerignore excluding data/users.json for ephemeral containers, npm scripts docker:build and docker:start, plus conceptual doc and guided mission.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Dockerfile, .dockerignore, package.json scripts | 68c9f05 | api/Dockerfile (created), api/.dockerignore (created), api/package.json (modified) |
| 2 | docs/12-docker.md, missions/09-arrancar-con-docker.md | 96107a4 | docs/12-docker.md (created, 123 lines), missions/09-arrancar-con-docker.md (created, 81 lines) |

## Acceptance Criteria Status

| Criterion | Status |
|-----------|--------|
| api/Dockerfile exists with FROM node:22-alpine | PASS |
| api/Dockerfile contains RUN npm ci --omit=dev | PASS |
| api/Dockerfile contains ENV PORT=3100 | PASS |
| api/Dockerfile contains USER node after all COPY | PASS |
| api/Dockerfile contains CMD ["node", "index.js"] | PASS |
| api/Dockerfile contains EXPOSE 3100 | PASS |
| api/.dockerignore contains node_modules | PASS |
| api/.dockerignore contains data/users.json | PASS |
| api/.dockerignore contains *.test.js | PASS |
| api/package.json contains docker:build script | PASS |
| api/package.json contains docker:start script | PASS |
| api/package.json still contains start: node index.js | PASS |
| node --check api/index.js exits 0 (file not modified) | PASS |
| docs/12-docker.md exists, >= 80 lines, starts with # Docker | PASS (123 lines) |
| docs/12-docker.md contains coexistence framing | PASS |
| docs/12-docker.md contains ASCII diagram with [Contenedor Docker] and -p 3100:3100 | PASS |
| docs/12-docker.md contains Arranque / ¿Persisten los datos? comparison table | PASS |
| docs/12-docker.md contains all commands: docker:build, docker:start, docker logs, docker stop | PASS |
| docs/12-docker.md references Misión 09 | PASS |
| docs/12-docker.md mentions data/users.json and explains clean container start | PASS |
| missions/09-arrancar-con-docker.md contains 4 H2 sections | PASS |
| missions/09-arrancar-con-docker.md contains npm run docker:build | PASS |
| missions/09-arrancar-con-docker.md contains npm run docker:start | PASS |
| missions/09-arrancar-con-docker.md contains docker stop edf-lab-api | PASS |
| missions/09-arrancar-con-docker.md contains curl http://localhost:3100/health | PASS |
| missions/09-arrancar-con-docker.md Reto extra contains -p 3200:3100 | PASS |
| missions/09-arrancar-con-docker.md ends with reflexive question | PASS |
| ADV-03: no DB elements introduced | PASS |

## Key Decisions

1. **D-05 to D-09 applied** (from CONTEXT.md): Dockerfile + .dockerignore scope, node:22-alpine base, docker:build/docker:start scripts, coexistence framing, docs/12-docker.md conceptual doc.
2. **ENV PORT=3100 is critical** (Pitfall 5 from RESEARCH.md): api/index.js defaults to port 3000 (`process.env.PORT || 3000`). Without this ENV, the container would listen on 3000 internally while docker:start publishes -p 3100:3100 externally — silent connection refused. Added with explanatory comment in Dockerfile.
3. **USER node after COPY** (Pitfall 4 from RESEARCH.md): USER directive placed at line 24 (after COPY at lines 7 and 13). If placed before COPY, Node.js may lack read permissions on copied files.
4. **CMD ["node", "index.js"] not ["npm", "start"]** (Pitfall from RESEARCH.md): npm intercepts SIGTERM, preventing clean container shutdown. Direct node command ensures signals reach the process correctly.
5. **data/users.json in .dockerignore** (Pitfall 1 from RESEARCH.md): Container starts from SEED_DATA, not from host state. Pedagogically correct — the student observes container ephemerality directly.

## ADV-03 Confirmation

No element in this plan introduces database dependencies. No SQLite, PostgreSQL, Mongoose, Sequelize, Prisma, or similar. The container runs the same in-memory + file persistence stack as the host. ADV-03 remains deferred per REQUIREMENTS.md and CONTEXT.md.

## Deviations from Plan

None — plan executed exactly as written.

All RESEARCH.md pitfalls were applied proactively:
- Pitfall 1 (data/users.json in image): prevented via .dockerignore
- Pitfall 2 (port not published): prevented via -p 3100:3100 in docker:start
- Pitfall 4 (USER before COPY): prevented by placement order in Dockerfile
- Pitfall 5 (PORT mismatch): prevented via ENV PORT=3100

## Known Stubs

None. All files are complete and functional as described.

## Threat Surface Scan

No new threat surface beyond what is documented in the plan's threat_model.

- T-05-02-01: data/users.json excluded from build context — MITIGATED
- T-05-02-02: USER node before CMD — MITIGATED
- T-05-02-03: fixed container name conflict — ACCEPTED (educational context)
- T-05-02-04: CMD node vs npm — MITIGATED
- T-05-02-05: ENV PORT visible in image — ACCEPTED (transparent and educational)

## Self-Check: PASSED

All files verified present and commits confirmed in git log.
