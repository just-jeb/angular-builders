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
- Related: [`../AGENTS.md`](../AGENTS.md) (CI Pipeline section) -- the GitHub Actions workflows that consume these scripts

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

- **`default-registry.sh`** -- Called by the CI publish job for beta releases. Runs `yarn lerna publish --dist-tag=next --preid=beta --conventional-prerelease --yes`. Publishes to npm under the `next` tag. The graduate path (stable release) is handled directly in `ci.yml` via `npm run graduate`.

## Invariants

**MUST:** Integration test definitions in `packages/*/tests/integration.js` must export an array of objects with `{ id: string, name: string, purpose: string, app: string, command: string }`. `id` must be unique across all packages (used in CI matrix job names). `app` must be a valid path relative to repo root (e.g., `'examples/jest/simple-app'`). `command` is run via `spawn('sh', ['-c', command], { cwd })` from within the `app` directory. The `discover-tests.js` script (lines 50-62) loads each file via `require()`, spreads entries with `{ package: pkg, ...entry }`, and outputs JSON for GitHub Actions matrix. (Source: code investigation, 2026-02-16)

**MUST:** The `discover-tests.js` affected-package filter relies on Turbo's `--summarize` flag being used during the build step. It expects Turbo output in `.turbo/runs/*.json` with structure: `{ tasks: [{ package: "@angular-builders/...", task: "..." }] }`. Constraints (see `discover-tests.js` lines 5-38): files must be in `.turbo/runs/` ending with `.json`, root object must have `tasks` as an array, each task needs a `package` property starting with `@angular-builders/`, and the most recent file by mtime is selected when multiple exist. Failure modes are graceful -- if dir/files/schema are missing or unparseable, all tests are included (no filtering). The `.turbo/runs` dir is cleared before each build (`rm -rf .turbo/runs` in package.json scripts). (Source: code investigation, 2026-02-16)

## Pitfalls

| Trap                                                     | Reality                                                                                                                                                                                                                                                                                                                                                                                                               |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "Tests are discovered from example package.json scripts" | Tests are defined in `packages/*/tests/integration.js`, not in the example apps. The example apps are just the execution targets.                                                                                                                                                                                                                                                                                     |
| "Affected filtering uses git diff"                       | It uses Turbo's build summary (`.turbo/runs/*.json`), not git. Turbo was chosen because it understands the package dependency graph including transitive dependencies -- git diff only sees file changes and cannot determine which downstream packages are actually affected. (Source: SME interview, Jeb, 2026-02-16)                                                                                               |
| "`update-package.js` updates all dependencies"           | It only updates Angular-specific dependencies (`@angular-devkit/*`, `@angular/build`, `@angular/compiler-cli`). Other deps are managed manually or via Renovate.                                                                                                                                                                                                                                                      |
| "The architect version range follows semver"             | `@angular-devkit/architect` uses a non-standard `0.{major}00.0` versioning scheme. The update script hardcodes `isStable: false` for this package.                                                                                                                                                                                                                                                                    |
| "`update-package.js` input validation is robust"         | Known limitations (see line 18) (Source: code investigation, 2026-02-16): (1) No type validation on input -- `parseInt('alpha')` returns `NaN`, producing invalid ranges. (2) Only the first CLI argument is parsed (line 3). (3) The version scheme assumes 2-digit Angular majors; 3+ digit majors produce unusual ranges. (4) No warning if a package listed in the `isStable` map is missing from `package.json`. |
| "CI test discovery always works correctly"               | The most likely CI failure modes (Source: code investigation, 2026-02-16): (1) stale Turbo summaries from a previous run (mitigated by `rm -rf .turbo/runs` before each build), (2) test `id` collisions across packages causing matrix conflicts, (3) example app dependency issues after Angular upgrades.                                                                                                          |
