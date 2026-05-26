# Testing Patterns

**Analysis Date:** 2026-05-26

## Test Framework

**Runner:**
- No active test runner is configured.
- `api/package.json` contains a placeholder script: `echo "Error: no test specified" && exit 1`.

**Assertion Library:**
- None currently.

**Run Commands:**
```bash
node --check api/index.js       # Syntax-check backend JavaScript
node --check dashboard/app.js   # Syntax-check frontend JavaScript
npm audit --audit-level=high    # Check dependency vulnerabilities from api/
```

## Test File Organization

**Location:**
- No test files currently exist.
- Future API tests should probably live under `api/` to keep backend examples close to the Express app.

**Naming:**
- No established test naming pattern yet.
- A reasonable future pattern would be `*.test.js` once the test framework is chosen.

**Structure:**
```txt
api/
  index.js
  package.json
  # future: index.test.js or tests/*.test.js
dashboard/
  app.js
  # future: browser or DOM tests only if they add clear educational value
```

## Test Structure

**Suite Organization:**
- Not established.
- Future tests should favor clear Arrange/Act/Assert examples because this is an educational project.

**Patterns:**
- Current validation is command-based rather than test-suite-based.
- The exported `app` from `api/index.js` makes Supertest-style API tests feasible later.

## Mocking

**Framework:**
- None currently.

**Patterns:**
- No mocking patterns exist.

**What to Mock:**
- Future API tests should avoid mocking Express itself.
- If persistence is later added, file system or database access may need test isolation.

**What NOT to Mock:**
- Simple validation helpers and route behavior should be tested through real HTTP requests where possible.
- Browser `fetch()` should not be mocked until dashboard tests exist.

## Fixtures and Factories

**Test Data:**
- Seed users are defined directly in `api/index.js`:
  - `{ id: 1, name: 'John Doe', email: 'john@example.com' }`
  - `{ id: 2, name: 'Jane Smith', email: 'jane@example.com' }`

**Location:**
- No fixture directory exists.
- Future fixtures could live in `api/tests/fixtures/` if tests grow beyond a few cases.

## Coverage

**Requirements:**
- No coverage target is defined.

**Configuration:**
- No coverage tooling is configured.

**View Coverage:**
```bash
# Not available yet
```

## Test Types

**Syntax Checks:**
- `node --check` is the current lightweight validation path.
- This catches JavaScript parse errors but not behavior regressions.

**API Smoke Checks:**
- Manual curl examples in `README.md` and `api/README.md` validate endpoint behavior.
- Representative endpoints include `/health`, `/users`, `/users/:id`, `/about`, and `/time`.

**Integration Tests:**
- Not implemented.
- Future tests should cover API status codes, JSON bodies, validation errors, and CRUD mutation behavior.

**E2E Tests:**
- Not implemented.
- For this project, manual dashboard checks may remain more educational until UI complexity increases.

## Common Patterns

**Async Testing:**
```js
// Future pattern once a runner is selected:
// const response = await request(app).get('/health');
// expect(response.status).toBe(200);
```

**Error Testing:**
```js
// Future cases:
// GET /users/abc returns 400
// GET /users/999 returns 404
// POST /users with empty fields returns 400
```

**Snapshot Testing:**
- Not used and not a natural fit for the current codebase.

---

*Testing analysis: 2026-05-26*
*Update when test tools or conventions are added*
