# Phase 36: CI visual regression - Context

**Gathered:** 2026-06-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Add a dedicated visual regression job in GitHub Actions for PRs using Chromium snapshots, without changing functional E2E contracts. The phase includes CI wiring, artifact strategy for snapshot diffs, and documentation for intentional baseline updates in PR workflows.

</domain>

<decisions>
## Implementation Decisions

### CI scope and isolation
- **D-01:** Add a new CI job named **`visual-regression`** in `.github/workflows/ci.yml`.
- **D-02:** The job runs on `ubuntu-latest`, for `push` and `pull_request` on `main`, aligned with existing CI triggers.
- **D-03:** Keep visual coverage to **Chromium only** in this phase (Firefox/WebKit visual stays out of scope).
- **D-04:** Visual job must stay isolated from existing jobs (`test-sqlite`, `test-postgres`, `e2e-smoke`, `e2e-postgres`) and must not modify their scripts or project matrices.

### Execution contract for visual CI
- **D-05:** Introduce root script **`test:visual:ci`** in `package.json` to represent canonical CI visual execution (expected to call `playwright test` visual projects and run with `CI=true`).
- **D-06:** Visual job installs dependencies for root, `api/`, `dashboard-react/`, `dashboard-vue/`, then installs Playwright Chromium with deps before running `npm run test:visual:ci`.
- **D-07:** Reuse current Playwright quad webServer pattern from `e2e/playwright.config.js`; do not create a separate visual config file in this phase.

### Diff observability and PR workflow
- **D-08:** On snapshot mismatch, CI must publish Playwright artifacts (`test-results` and/or `playwright-report`) so diffs are reviewable from the PR run.
- **D-09:** Documentation must include explicit baseline update workflow: run local `npm run test:visual -- --update-snapshots`, review PNG diffs, commit updated baselines only when UI change is intentional.
- **D-10:** `test:e2e`, `test:e2e:ci`, and `test:e2e:pg` remain unchanged as functional gates; visual CI is additive.

### Claude's Discretion
- Exact artifact retention policy (`if: failure()` vs always upload) as long as failed snapshots are inspectable in PR checks.
- Whether `test:visual:ci` reuses `test:visual` command directly or wraps extra Playwright flags for CI stability.
- Minor ordering/perf improvements inside the new CI job, provided reliability and didactic clarity are preserved.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone and requirements
- `.planning/ROADMAP.md` — Phase 36 goal, plans 36-01/36-02, success criteria
- `.planning/REQUIREMENTS.md` — `QA-VIS-04`, `QA-CI-06`
- `.planning/phases/35-visual-multi-dashboard/35-VERIFICATION.md` — evidence baseline for visual suite readiness

### CI and test harness
- `.github/workflows/ci.yml` — current four-job CI matrix to extend safely
- `package.json` — current scripts (`test:e2e`, `test:e2e:ci`, `test:e2e:pg`, `test:visual`)
- `e2e/playwright.config.js` — visual and functional projects, webServer orchestration

### Visual suite artifacts and docs
- `e2e/tests/visual.vanilla.spec.js`
- `e2e/tests/visual.react.spec.js`
- `e2e/tests/visual.vue.spec.js`
- `e2e/__snapshots__/visual.vanilla.spec.js/`
- `e2e/__snapshots__/visual.react.spec.js/`
- `e2e/__snapshots__/visual.vue.spec.js/`
- `docs/10-tests.md` — visual section to extend with CI baseline update flow

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable assets
- CI already has reliable install patterns for multi-project Playwright jobs (`e2e-smoke`, `e2e-postgres`).
- Visual suite is already stable in local verification with `npm run test:visual` (3 tests).
- Snapshot path conventions are already set (`snapshotPathTemplate`) and baselines are committed.

### Gap to close
- No dedicated CI job currently runs visual snapshots in PRs.
- No dedicated script `test:visual:ci` currently exists.
- No CI artifact upload is currently configured for snapshot diffs in failures.

### Integration points
- `.github/workflows/ci.yml` must gain one additive job and keep existing job contracts unchanged.
- `package.json` should add one CI-focused visual command.
- `docs/10-tests.md` should document the PR baseline update path and artifact review.

</code_context>

<specifics>
## Specific Ideas

- Mirror the dependency and Playwright install steps from `e2e-smoke` to reduce CI drift.
- Keep the visual job intentionally narrow (Chromium + visual projects only) to control CI runtime while adding signal.

</specifics>

<deferred>
## Deferred Ideas

- Visual regression on Firefox/WebKit in CI (`QA-VIS-05`) — post-v2.2.
- Additional snapshot governance automation (label-driven baseline approvals) — future milestone.
- Mission 18 and NOTEBOOK v2.2 educational outputs — phase 37.

</deferred>

---

*Phase: 36-CI visual regression*
*Context gathered: 2026-06-17*
