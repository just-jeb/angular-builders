# Scripts

> Build infrastructure utilities for CI test discovery, local test execution, and Angular version updates across the monorepo.

## At a Glance

|                  |                                                                                 |
| ---------------- | ------------------------------------------------------------------------------- |
| **Type**         | Capability Domain                                                               |
| **Owns**         | CI test matrix generation, local test runner, Angular version update automation |
| **Does NOT own** | Builder logic, package builds (Turbo), publishing (Lerna)                       |
| **Users**        | CI pipeline, package maintainers                                                |

## Navigation

- Parent: [`../AGENTS.md`](../AGENTS.md)
- Related: [`../examples/AGENTS.md`](../examples/AGENTS.md) -- the test fixtures that these scripts discover and execute
- Related: [`../packages/AGENTS.md`](../packages/AGENTS.md) -- packages whose integration tests are discovered here

## Entry Points & Contracts

- **`discover-tests.js`** -- Scans all `packages/*/tests/integration.js` files, collects test definitions, and optionally filters by Turbo-affected packages.
  - **CLI mode:** Outputs JSON to stdout (consumed by CI workflow to build the GitHub Actions matrix)
  - **Module mode:** Exports `{ discoverTests, getAffectedPackages }` (consumed by `run-local-tests.js`)
  - **Affected filtering:** If `.turbo/runs/*.json` exists, parses the most recent summary to find which `@angular-builders/*` packages were built, and filters tests to only those packages.

- **`run-local-tests.js`** -- Runs integration tests locally in parallel.
  - **Flags:** `--package <name>`, `--id <test-id>`, `--concurrency <N>`, `--verbose`
  - **Guarantees:** Runs each test in its example app directory via `sh -c`. Reports pass/fail with duration. Exit code 1 if any test fails.

- **`update-package.js`** -- Updates Angular dependency version ranges in a package's `package.json`.
  - **Usage:** `yarn update:package <angular-major-version>` (run from a package directory via the workspace script)
  - **Knows:** Which Angular packages use stable versioning (`^{major}.0.0`) vs pre-release versioning (`>=0.{major}00.0 < 0.{major+1}00.0`). This mapping is hardcoded in the script.
  - **Note:** The goal is full automation of Angular version updates, but the process is not there yet. These scripts were created as steps toward that goal. (Source: SME interview, Jeb, 2026-02-16)

- **`update-example.js`** -- Updates Angular dependencies in example app `package.json` files for a new Angular version.

- **`default-registry.sh`** -- Sets npm registry and runs Lerna publish for beta releases.

## Invariants

**MUST:** Integration test definitions in `packages/*/tests/integration.js` must export an array of objects with `{ id, name, purpose, app, command }`. The `app` path is relative to repo root. The `id` must be unique across all packages.

**MUST:** The `discover-tests.js` affected-package filter relies on Turbo's `--summarize` flag being used during the build step. Without the summary JSON in `.turbo/runs/`, all tests are included (no filtering).

## Pitfalls

| Trap                                                     | Reality                                                                                                                                                          |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "Tests are discovered from example package.json scripts" | Tests are defined in `packages/*/tests/integration.js`, not in the example apps. The example apps are just the execution targets.                                |
| "Affected filtering uses git diff"                       | It uses Turbo's build summary (`.turbo/runs/*.json`), not git. Turbo was chosen because it understands the package dependency graph including transitive dependencies -- git diff only sees file changes and cannot determine which downstream packages are actually affected. (Source: SME interview, Jeb, 2026-02-16) |
| "`update-package.js` updates all dependencies"           | It only updates Angular-specific dependencies (`@angular-devkit/*`, `@angular/build`, `@angular/compiler-cli`). Other deps are managed manually or via Renovate. |
| "The architect version range follows semver"             | `@angular-devkit/architect` uses a non-standard `0.{major}00.0` versioning scheme. The update script hardcodes `isStable: false` for this package.               |
