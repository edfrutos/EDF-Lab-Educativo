# Codebase Concerns

**Analysis Date:** 2026-05-26

## Tech Debt

**Generic package metadata:**
- Issue: `api/package.json` still uses `name: "test-project"`, a generic description, and test author metadata.
- Why: The project began as a small test/demo app and later became an educational lab.
- Impact: npm output and package identity do not match the repository purpose.
- Fix approach: Rename package metadata to match the lab and update `api/package-lock.json` consistently.

**Placeholder test script:**
- Issue: `npm test` in `api/package.json` intentionally fails with "Error: no test specified".
- Why: Tests are planned in the roadmap but not implemented yet.
- Impact: Any CI or agent validation that runs `npm test` will fail even if the app works.
- Fix approach: Add a real API test script once a test framework is introduced, or replace with a documented lightweight check.

**Nodemon installed but unused:**
- Issue: `nodemon` exists in `devDependencies`, but there is no `dev` script.
- Why: Development tooling was partially prepared before being documented or exposed.
- Impact: Learners cannot discover the intended hot-reload workflow through `npm run`.
- Fix approach: Add `dev: nodemon index.js` if the teaching value is clear.

## Known Bugs

**Old project path in dashboard error help:**
- Symptoms: When the dashboard cannot connect to the API, it tells users to `cd /Users/edefrutos/Desktop/express-api-demo/api`.
- Trigger: API unavailable and dashboard error panel becomes visible.
- Workaround: Use the correct path from `README.md`: `/Users/edefrutos/Desktop/EDF-Lab-Educativo/api`.
- Root cause: Documentation sync missed `dashboard/index.html`.
- Fix approach: Update the hardcoded path in `dashboard/index.html`.

**Loose ID parsing accepts partial numeric strings:**
- Symptoms: `parseUserId('1abc')` returns `1`.
- Trigger: Requesting routes like `/users/1abc`.
- Workaround: Use clean integer IDs in examples and manual tests.
- Root cause: `Number.parseInt(value, 10)` accepts leading digits and ignores trailing text.
- Fix approach: Validate the whole string with a numeric pattern or convert with `Number()` and integer checks.

## Security Considerations

**Open CORS policy:**
- Risk: `app.use(cors())` allows all origins.
- Current mitigation: This is acceptable for a local educational lab.
- Recommendations: If this ever becomes more than local learning, document origin-specific CORS configuration.

**No authentication or authorization:**
- Risk: All CRUD routes are public.
- Current mitigation: Data is in-memory demo data only.
- Recommendations: Keep auth out of scope unless it becomes a deliberate teaching phase.

**Input validation is minimal:**
- Risk: `name` and `email` only require non-empty strings; email format is not checked.
- Current mitigation: Simplicity supports the current teaching goal.
- Recommendations: Add stricter validation only when teaching validation tradeoffs.

## Performance Bottlenecks

**In-memory full-array operations:**
- Problem: `/users` sorts the full users array on each request.
- Measurement: Not an issue with the current two-user seed data.
- Cause: `_.sortBy(users, 'name')` runs per request.
- Improvement path: Leave as-is for learning, or discuss scalability when persistence is added.

**No production optimization for dashboard assets:**
- Problem: Static CSS and JS are served unbundled.
- Measurement: Not relevant for the current local lab size.
- Cause: No build step by design.
- Improvement path: Keep build-free unless asset complexity grows enough to justify tooling.

## Fragile Areas

**Single-file API:**
- Why fragile: Routes, helpers, state, and startup are all in `api/index.js`.
- Common failures: Adding many routes can make the file harder to teach and maintain.
- Safe modification: Keep helper functions small; extract only when duplication or complexity becomes real.
- Test coverage: No automated route coverage yet.

**Hardcoded dashboard API base URL:**
- Why fragile: Dashboard assumes `http://localhost:3100`.
- Common failures: Starting API on any other port breaks dashboard fetches.
- Safe modification: Keep examples synchronized, or add a small config teaching example later.
- Test coverage: Manual only.

**Documentation-code synchronization:**
- Why fragile: The project intentionally has many docs and missions that mirror behavior.
- Common failures: Code changes without updating `README.md`, `api/README.md`, `docs/`, `missions/`, and `NOTEBOOK.md`.
- Safe modification: For every learner-facing behavior change, update docs in the same change.
- Test coverage: Manual `rg` checks for stale paths/ports are currently used.

## Scaling Limits

**Process memory storage:**
- Current capacity: Suitable only for demo data.
- Limit: Data disappears on restart and cannot support multi-process deployment.
- Symptoms at limit: Lost users, inconsistent state across server instances.
- Scaling path: Fase 4 roadmap item: persist users in `data/users.json`, then later a database if needed.

**No automated regression suite:**
- Current capacity: Manual verification and syntax checks.
- Limit: Repeated changes can break routes or dashboard behavior unnoticed.
- Symptoms at limit: Documentation examples stop matching real responses.
- Scaling path: Fase 5 roadmap item: add focused API tests.

## Dependencies at Risk

**Express 4.x:**
- Risk: Express 5 exists, but Express 4 remains common and stable.
- Impact: Future upgrade may change middleware/error behavior in small ways.
- Migration plan: Defer upgrade until it has clear educational value.

**Lodash for one sort helper:**
- Risk: Adds a dependency for a simple operation.
- Impact: Dependency surface is larger than necessary for the current code.
- Migration plan: Keep if the goal is to teach dependencies; otherwise replace with native sorting later.

## Missing Critical Features

**API tests:**
- Problem: CRUD and validation behavior is not automatically checked.
- Current workaround: curl examples and manual validation.
- Blocks: Reliable refactoring and CI.
- Implementation complexity: Low to medium with Supertest or Node's built-in test runner.

**Dashboard CRUD forms:**
- Problem: The API supports mutation routes, but the dashboard only reads.
- Current workaround: Use curl for `POST`, `PUT`, and `DELETE`.
- Blocks: Teaching full frontend-to-backend mutation flow.
- Implementation complexity: Medium.

## Test Coverage Gaps

**API route behavior:**
- What's not tested: Status codes, response bodies, validation, and in-memory mutations.
- Risk: Route regressions can go unnoticed.
- Priority: High for Fase 5.
- Difficulty to test: Low once a test approach is selected.

**Dashboard error state:**
- What's not tested: Offline UI, failed fetch messaging, and reload state.
- Risk: CORS/connection teaching flow can break silently.
- Priority: Medium.
- Difficulty to test: Medium without adding browser test tooling.

---

*Concerns audit: 2026-05-26*
*Update as issues are fixed or new ones discovered*
