---
type: sme-interview
repository: angular-builders
area: scripts
created: 2026-02-16
status: complete
last_merged: 2026-02-16
---

# SME Interview: Scripts (Build Infrastructure)

## Respondent

- **Name:** Jeb (maintainer)
- **Role:** Project maintainer
- **Date:** 2026-02-16

## Boundaries

### What is the primary responsibility of the scripts directory? Are there scripts that should be moved elsewhere?

> CI test discovery, local test running, and Angular version update utilities. No scripts that need to be moved — they serve their purpose here.

## Critical Invariants

### What must be true about the integration test definition format for CI to work correctly?

> Each `packages/*/tests/integration.js` must export an array of objects with this structure: `{ id: string, name: string, purpose: string, app: string, command: string }`. `id` must be unique across all packages (used in CI matrix job names). `app` must be a valid path relative to repo root (e.g., `'examples/jest/simple-app'`). `command` is run via `spawn('sh', ['-c', command], { cwd })` from within the `app` directory. The `discover-tests.js` script (lines 50-62) loads each file via `require()`, spreads entries with `{ package: pkg, ...entry }`, and outputs JSON for GitHub Actions matrix. (Source: code investigation, 2026-02-16)

### Are there constraints on the Turbo summary format that `discover-tests.js` depends on?

> The script expects Turbo `--summarize` output in `.turbo/runs/*.json` with this structure: `{ tasks: [{ package: "@angular-builders/...", task: "..." }] }`. Constraints (see `discover-tests.js` lines 5-38): (1) files must be in `.turbo/runs/` ending with `.json`, (2) root object must have `tasks` as an array, (3) each task needs a `package` property starting with `@angular-builders/`, (4) most recent file by mtime is selected when multiple exist. Failure modes are graceful — if dir/files/schema are missing or unparseable, all tests are included (no filtering). The `.turbo/runs` dir is cleared before each build (`rm -rf .turbo/runs` in package.json scripts). (Source: code investigation, 2026-02-16)

## Patterns

### What's the canonical way to add a new integration test?

> No specific documented process — check existing test definitions for patterns.

### What's the process for updating Angular version ranges across all packages?

> No rigidly defined process. Ideally it should be fully automated. `update-package.js` and `update-examples.js` were created toward this goal.

## Tribal Knowledge

### What CI issues have occurred with the test discovery/execution pipeline?

> No specific incidents documented in the codebase. The `discover-tests.js` script has defensive error handling — all Turbo summary parsing failures fall back to running all tests (no filtering). The `run-local-tests.js` spawns tests in parallel with configurable concurrency. The most likely CI failure modes are: (1) stale Turbo summaries from a previous run (mitigated by `rm -rf .turbo/runs` before each build), (2) test `id` collisions across packages causing matrix conflicts, (3) example app dependency issues after Angular upgrades. Requires CI logs for specific historical incidents. (Source: code investigation, 2026-02-16)

### Why was the affected-package filtering based on Turbo summaries rather than git diff?

> Turbo understands the package dependency graph — git diff only sees file changes. Turbo can identify which packages are actually affected by a change, including transitive dependencies.

### What issues has the `update-package.js` version range logic caused during Angular version bumps?

> The version range logic at `update-package.js` line 18 uses a non-standard format for pre-release packages: `>=0.${version}00.0 < 0.${version + 1}00.0` (e.g., `>=0.2100.0 < 0.2200.0` for Angular 21). Potential issues: (1) No type validation on input — `parseInt('alpha')` returns `NaN`, producing invalid ranges. (2) Only the first CLI argument is parsed (line 3). (3) The version scheme assumes 2-digit Angular majors; 3+ digit majors would produce unusual ranges. (4) No warning if a package listed in the `isStable` map is missing from `package.json`. These are known limitations of a script that's part of a not-yet-fully-automated upgrade process. (Source: code investigation, 2026-02-16)

## Additional Notes

> N/A
