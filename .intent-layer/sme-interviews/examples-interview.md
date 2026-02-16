---
type: sme-interview
repository: angular-builders
area: examples
created: 2026-02-16
status: complete
last_merged: 2026-02-16
---

# SME Interview: Examples (Test Fixtures)

## Respondent

- **Name:** Jeb (maintainer)
- **Role:** Project maintainer
- **Date:** 2026-02-16

## Boundaries

### Are the example apps purely test fixtures, or are they also used as user-facing documentation/reference?

> Dual purpose — both test fixtures for integration testing AND user-facing examples/documentation that users look at for reference.

## Critical Invariants

### What must be true about example app configurations for integration tests to pass?

> Must be valid, buildable Angular apps with correct dependencies. Further specifics would need to be checked in the test infrastructure.

### Are there dependencies between example apps (e.g., must they be tested in a certain order)?

> All example apps are independent and can be tested in any order.

## Patterns

### What's the canonical way to add a new integration test for an existing builder feature?

> Depends on use case — usually modify an existing example app. If that can't achieve the test goal, create a new example app. Also important: add the test case to the relevant test script.

### What's the canonical way to add a new example app for a new builder variant?

> Pattern from existing examples: (1) Create directory at `examples/{builder-name}/{variant-name}/` (e.g., `examples/custom-webpack/sanity-app-esm/`). (2) Initialize as a valid Angular workspace with `package.json`, `angular.json`, `tsconfig.json`, and `src/` directory. (3) It's auto-discovered by root workspace via Yarn 3 `"workspaces": ["packages/*", "examples/*"]`. (4) Add test entries to `packages/{builder-name}/tests/integration.js` with unique `id`, `app` path, and `command`. (5) Consider adding both CJS and ESM variants to cover module format edge cases (a historically fragile area). Key constraints: example apps must be independent (no cross-app deps), must never import from `packages/*/src/` directly (use built packages via workspace linking), and test commands must be runnable via `sh -c` from the app directory. (Source: code investigation, 2026-02-16)

## Tribal Knowledge

### What are the most common causes of flaky integration tests?

> Dev server port conflicts when running tests in parallel.

### Why do some example apps have both CJS and ESM variants? What edge cases do these catch?

> Tests that user configs work in both CJS and ESM module formats.

### Are there platform-specific issues (e.g., CI vs. local, Linux vs. macOS) that affect example app testing?

> Yes — tests behave differently in CI vs. local due to environment differences.

## Additional Notes

> N/A
