# CI/CD Architecture Documentation

This document describes the test architecture for the angular-builders monorepo, explaining what each test validates semantically and how the CI pipeline is structured.

## Repository Structure Overview

```
angular-builders/
├── packages/           # Published npm packages (builders)
│   ├── common/         # Shared utilities
│   ├── custom-webpack/ # Webpack customization builders
│   │   └── tests/
│   │       └── integration.js  # Package-owned test definitions
│   ├── custom-esbuild/ # ESBuild customization builders
│   │   └── tests/
│   │       └── integration.js
│   ├── jest/           # Jest test runner builder
│   │   └── tests/
│   │       ├── integration.js
│   │       └── validate.js  # Package-owned validation logic
│   ├── bazel/          # Bazel integration builder
│   │   └── tests/
│   │       ├── integration.js
│   │       └── validate.js
│   └── timestamp/      # Example/demo builder
└── examples/           # Integration test apps
    ├── custom-webpack/ # Apps using custom-webpack builders
    ├── custom-esbuild/ # Apps using custom-esbuild builders
    ├── jest/           # Apps using jest builder
    ├── timestamp/      # App using timestamp builder
    └── bazel/          # Bazel example
```

## Package Overview

| Package                              | Purpose                                                | Builders Provided                                          |
| ------------------------------------ | ------------------------------------------------------ | ---------------------------------------------------------- |
| **@angular-builders/custom-webpack** | Extend Angular CLI webpack builders with custom config | `browser`, `dev-server`, `server`, `karma`, `extract-i18n` |
| **@angular-builders/custom-esbuild** | Extend Angular CLI esbuild builders with plugins       | `application`, `dev-server`, `unit-test`                   |
| **@angular-builders/jest**           | Replace Karma with Jest for `ng test`                  | `run`                                                      |
| **@angular-builders/bazel**          | Run Bazel from Angular CLI                             | `build`                                                    |
| **@angular-builders/timestamp**      | Demo builder (writes timestamp to file)                | `file`                                                     |

---

## Test Layers

The CI validates builders through multiple test layers, each with a distinct semantic purpose:

```
┌─────────────────────────────────────────────────────────────────────┐
│ Layer 1: Package Unit Tests                                         │
│ Purpose: Test builder TypeScript code (internal logic)              │
│ Location: packages/*/src/**/*.spec.ts                               │
│ Runner: Jest (jest-ut.config.js)                                    │
│ When: Part of build (postbuild)                                     │
├─────────────────────────────────────────────────────────────────────┤
│ Layer 2: Package Schema E2E Tests                                   │
│ Purpose: Verify generated schemas match Angular's + custom fields   │
│ Location: packages/*/e2e/**/*.spec.ts                               │
│ Runner: Jest (jest-e2e.config.js)                                   │
│ When: Part of build (postbuild)                                     │
├─────────────────────────────────────────────────────────────────────┤
│ Layer 3: Builder Integration Tests (Example Apps)                   │
│ Purpose: Verify builders work correctly in real Angular apps        │
│ Location: examples/*/                                               │
│ Runner: Various (Cypress, Karma, Vitest, Jest)                      │
│ When: CI matrix jobs (discovered from packages/*/tests/integration.js) │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Package-Owned Test Definitions

Each package defines its own integration tests in `packages/*/tests/integration.js`. This ensures:

- **Locality**: Test definitions live with the package code
- **Self-documenting**: Each test has a clear `purpose` field
- **Single source of truth**: Adding a new test only requires updating one file

Example structure:

```javascript
// packages/custom-webpack/tests/integration.js
module.exports = [
  {
    id: 'karma-builder-sanity-app',
    purpose: 'Karma builder executes unit tests with custom webpack config',
    app: 'examples/custom-webpack/sanity-app',
    command: 'yarn test --browsers=ChromeHeadlessCI',
  },
  // ... more tests
];
```

The CI discovers all `packages/*/tests/integration.js` files and creates a matrix job for each test entry.

---

## CI Workflow

The CI uses **Turborepo** for build orchestration. On **pull requests**, affected detection builds and tests only packages that have changed. On **master events** (push or workflow_dispatch), all packages are built to ensure complete `dist` artifacts for publishing (see #2026).

```
GitHub Actions Workflow (.github/workflows/ci.yml)

1. Build Job
   ├── Restore dependencies cache (node_modules, .yarn, ~/.cache/Cypress, ~/.cache/puppeteer)
   ├── Install dependencies (only if cache miss)
   ├── Pre-download Puppeteer Chrome binary (for Karma tests)
   ├── Build: on PR → yarn build:packages (affected only); on master → yarn build:packages:all
   │   └── PR: turbo build --filter='@angular-builders/*...[origin/master]' --summarize
   │   └── Master: turbo build --filter='@angular-builders/*' --summarize (all packages)
   │   └── Includes Layer 1 (UT) + Layer 2 (schema tests)
   │   └── Creates .turbo/runs/*.json summary file
   ├── Discover tests (reads turbo summary)
   │   └── scripts/discover-tests.js reads .turbo/runs/*.json
   │   └── Filters packages/*/tests/integration.js by affected packages
   │   └── Outputs filtered matrix JSON
   └── Upload dist artifacts

2. Integration Job (Matrix - only affected tests)
   ├── Runs only if has_tests == 'true'
   ├── Restore dependencies cache (fail if cache miss)
   ├── Download dist artifacts
   └── For each matrix entry:
       ├── cd ${{ matrix.app }}
       └── ${{ matrix.command }}

3. Publish Job (if on master or workflow_dispatch)
   └── Requires build and integration to succeed
   └── Only runs on push to master or manual workflow_dispatch
   └── Restore dependencies cache (fail if cache miss)
   └── Download dist artifacts
   └── Publish to npm via lerna-lite
   └── Uses OIDC (trusted publishing) - no npm tokens required
   └── Automatically generates provenance attestations
```

**Key Benefits**:

- **Affected Detection (PRs)**: Only builds/tests packages changed by the PR. On master, all packages are built for publish safety.
- **Parallelism**: All integration tests run in parallel (limited by GHA runner limits)
- **Isolation**: Each matrix job runs in its own environment (no port conflicts)
- **Local parity**: Same test definitions run locally via `yarn test:local`
- **Efficient Caching**: Dependencies installed once in build job, shared via cache across all jobs
- **Automatic Cancellation**: In-progress runs are cancelled when new commits are pushed (via concurrency groups)

---

## Dependency Caching Strategy

The CI workflow uses GitHub Actions cache to share dependencies across jobs, avoiding redundant installations:

### Cached Directories

- **`node_modules`**: All npm packages (Yarn workspace dependencies)
- **`.yarn`**: Yarn 3+ installation state (`.yarn/install-state.gz`, cache, etc.)
- **`~/.cache/Cypress`**: Cypress binary (downloaded by Cypress package)
- **`~/.cache/puppeteer`**: Puppeteer Chrome binary (downloaded on first use)

### Cache Key Strategy

- **Primary key**: `deps-{os}-node20-{yarn.lock-hash}` - Exact match for dependency changes
- **Restore keys**: `deps-{os}-node20-` - Partial match for cache hits on feature branches
- **Fallback cache**: `~/.cache` (Yarn download cache) - Speeds up installs on cache miss

### Cache Flow

1. **Build Job**:
   - Restores cache (or installs if miss)
   - Always runs `yarn --immutable` (fast on cache hit, ensures completeness)
   - Pre-downloads Puppeteer Chrome binary (triggers download if not cached)
   - Saves cache at end of job

2. **Integration Jobs**:
   - Restore cache with `fail-on-cache-miss: true` (ensures build job completed)
   - No `yarn install` needed - dependencies already available

3. **Publish Job**:
   - Restore cache with `fail-on-cache-miss: true`
   - No `yarn install` needed - dependencies already available

### Why Pre-download Puppeteer?

Puppeteer downloads Chrome lazily on first use (not during `yarn install`). The build job explicitly triggers the download by calling `require('puppeteer').executablePath()`, ensuring Chrome is cached for integration jobs that run Karma tests.

---

## Publishing & Security

### OIDC (Trusted Publishing)

The publish job uses **OIDC (OpenID Connect)** for authentication, which means:

- **No npm tokens required**: Authentication happens automatically via GitHub Actions OIDC
- **Automatic provenance**: Provenance attestations are generated automatically linking packages to source commits
- **More secure**: No long-lived tokens to manage or rotate
- **lerna-lite handles it**: The `@lerna-lite/publish` package manages OIDC authentication internally

**Requirements**:

- GitHub Actions workflow with `permissions: id-token: write` (already configured)
- Public repository (source must be public for provenance)
- Trusted publisher configured on npmjs.com matching the GitHub Actions workflow
- npm CLI version (handled by lerna-lite internally)

**Configuration**:

- `lerna.json` specifies `npmClient: "yarn"` for dependency management
- Publishing still uses npm registry API (via lerna-lite's `libnpmpublish`)
- OIDC authentication is automatic when `id-token: write` permission is present

---

## Turborepo and Affected Detection

The CI uses Turborepo for build orchestration. Behavior depends on the event:

- **Pull requests**: Affected detection — only packages changed (vs. `origin/master`) are built and tested.
- **Master events** (push or workflow_dispatch): All `@angular-builders/*` packages are built (`yarn build:packages:all`) so the publish job always has complete `dist` artifacts.

### How It Works

**On PRs**: Turborepo compares the current branch to `origin/master` and determines which workspace packages have changed. It then builds only those packages (and their dependencies), creates `.turbo/runs/*.json`, and the test discovery script filters integration tests to affected packages.

**On master**: The workflow runs `yarn build:packages:all`, which builds all `@angular-builders/*` packages (no git filter). The same summary and test discovery flow runs, so the full test matrix runs before publish.

### Configuration

**Root `turbo.json`**:

```json
{
  "globalDependencies": [
    ".github/workflows/**",
    "tsconfig.json",
    "jest-ut.config.js",
    "jest-e2e.config.js",
    "jest-common.config.js",
    "jest-custom-environment.js"
  ],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"],
      "inputs": ["src/**", "tsconfig.json", "tsconfig.*.json", "package.json", "builders.json"]
    }
  }
}
```

- **globalDependencies**: Files that invalidate ALL packages when changed (CI workflow, root tsconfig, jest configs)
- **dependsOn: ["^build"]**: Build dependencies first (e.g., common before other packages)
- **outputs**: What gets cached (dist folders)
- **inputs**: What triggers rebuilds (source files)

### Dependency Mapping

| If you change...             | Packages affected | Tests run    |
| ---------------------------- | ----------------- | ------------ |
| `packages/common/*`          | ALL packages      | ALL 41 tests |
| `packages/custom-webpack/*`  | custom-webpack    | 13 tests     |
| `packages/custom-esbuild/*`  | custom-esbuild    | 13 tests     |
| `packages/jest/*`            | jest              | 14 tests     |
| `packages/bazel/*`           | bazel             | 1 test       |
| `examples/jest/simple-app/*` | (none)            | ~7 tests     |
| `.github/workflows/*`        | ALL packages      | ALL 41 tests |
| `tsconfig.json` (root)       | ALL packages      | ALL 41 tests |
| `docs/*`, `README.md`        | (none)            | 0 tests      |

### Tool Relationships

Turborepo is an **addition** to the existing tooling, not a replacement:

| Tool            | Role                    | Status    |
| --------------- | ----------------------- | --------- |
| Yarn Workspaces | Monorepo structure      | Unchanged |
| Lerna           | Publishing & versioning | Unchanged |
| Turborepo       | Task orchestration      | **New**   |

---

## Local Development

### Running Tests Locally

The recommended way to run integration tests locally is the native test runner:

```bash
# Run all integration tests in parallel
yarn test:local

# Run tests only for packages affected by your changes (automatic if turbo summary exists)
# First build: yarn build:packages
# Then: yarn test:local (automatically filters to affected packages)

# Run tests for a specific package
yarn test:local --package custom-webpack

# Run specific tests by ID
yarn test:local --id browser-builder-basic --id esm-package-default

# Limit concurrency (useful for memory-constrained systems)
yarn test:local --concurrency 4

# Verbose output
yarn test:local --verbose
```

The local runner:

- Uses the same test definitions as CI (`packages/*/tests/integration.js`)
- Automatically filters to affected packages if `.turbo/runs/*.json` exists (from `yarn build:packages`)
- Falls back to all tests if no turbo summary is found
- Runs all tests in parallel by default
- Uses `port: 0` for automatic port assignment (no conflicts)

### Adding New Tests

1. Edit `packages/<package>/tests/integration.js`
2. Add new test entry with `id`, `purpose`, `app`, and `command`
3. Commit - CI will automatically discover and run it

---

## Layer 3: Builder Integration Tests (Detailed)

### @angular-builders/custom-webpack

**What it tests**: Custom webpack configuration is correctly merged into Angular's webpack config.

#### Example Apps

| App              | Type                             | What it validates                                             |
| ---------------- | -------------------------------- | ------------------------------------------------------------- |
| `sanity-app`     | CommonJS package                 | Basic builder functionality with CJS/ESM config files         |
| `sanity-app-esm` | ESM package (`"type": "module"`) | Builder works with ESM apps                                   |
| `full-cycle-app` | Full features                    | All features: customWebpackConfig, indexTransform, TS configs |

#### Test Matrix

| App            | Test Type | Config          | What it validates                                        |
| -------------- | --------- | --------------- | -------------------------------------------------------- |
| sanity-app     | Karma     | -               | `@angular-builders/custom-webpack:karma` runs unit tests |
| sanity-app     | Cypress   | default         | Basic browser + dev-server work                          |
| sanity-app     | Cypress   | esm             | Builder loads `.mjs` webpack config                      |
| sanity-app     | Cypress   | cjs             | Builder loads `.js` webpack config                       |
| sanity-app-esm | Karma     | -               | Karma builder works in ESM package                       |
| sanity-app-esm | Cypress   | default/esm/cjs | Config loading in ESM context                            |
| sanity-app-esm | Build     | tsEsm           | Builder loads TypeScript config with ESM imports         |
| full-cycle-app | Karma     | -               | Karma builder with full webpack customization            |
| full-cycle-app | Cypress   | default         | `customWebpackConfig` + `indexTransform` (JS) work       |
| full-cycle-app | Cypress   | production      | `indexTransform` receives correct configuration name     |
| full-cycle-app | Cypress   | itwcw           | TypeScript `indexTransform` works                        |

**What the E2E tests verify**:

- `app.e2e-spec.ts`: App renders with modifications from custom webpack (e.g., DefinePlugin values)
- `app-prod.e2e-spec.ts`: Index HTML contains `<p>Configuration: production</p>` (from indexTransform)
- `app-itwcw.e2e-spec.ts`: Index HTML contains `<p>Configuration: itwcw</p>` (TypeScript indexTransform)

---

### @angular-builders/custom-esbuild

**What it tests**: ESBuild plugins and middlewares are correctly applied.

#### Example Apps

| App                      | Type             | What it validates                        |
| ------------------------ | ---------------- | ---------------------------------------- |
| `sanity-esbuild-app`     | CommonJS package | Basic builder functionality              |
| `sanity-esbuild-app-esm` | ESM package      | Builder works with ESM apps + TS plugins |

#### Test Matrix

| App                    | Test Type | Config          | What it validates                                             |
| ---------------------- | --------- | --------------- | ------------------------------------------------------------- |
| sanity-esbuild-app     | Vitest    | esm             | `@angular-builders/custom-esbuild:unit-test` with ESM plugins |
| sanity-esbuild-app     | Vitest    | cjs             | Unit test builder with CJS plugins                            |
| sanity-esbuild-app     | Cypress   | default/esm/cjs | Application + dev-server builders work                        |
| sanity-esbuild-app-esm | Vitest    | esm/cjs/tsEsm   | Unit test builder in ESM context                              |
| sanity-esbuild-app-esm | Cypress   | default/esm/cjs | Builders work in ESM package                                  |
| sanity-esbuild-app-esm | Build     | tsEsm           | TypeScript plugins with ESM imports                           |

**What the E2E tests verify**:

- App title shows value from `DefinePlugin` (proves ESBuild plugin ran)
- `/send-hello` route returns middleware response (proves dev-server middleware works)

---

### @angular-builders/jest

**What it tests**: Jest builder correctly passes through CLI options and handles Angular testing setup.

#### Example Apps

| App             | Type                    | What it validates                  |
| --------------- | ----------------------- | ---------------------------------- |
| `simple-app`    | Single project          | Basic Jest builder functionality   |
| `multiple-apps` | Multi-project workspace | Project selection, library testing |

#### Test Matrix

The Jest builder tests validate **CLI option passthrough** by running Jest with various flags and checking the output matches expected test counts using `packages/jest/tests/validate.js`.

**simple-app validations**:

| Test       | Command                             | What it validates                         |
| ---------- | ----------------------------------- | ----------------------------------------- |
| TS config  | `yarn test:ts --no-cache`           | Builder loads `jest.config.ts`            |
| ESM config | `yarn test:esm --no-cache`          | Builder loads `jest.config.mjs`           |
| No cache   | `yarn test --no-cache`              | `--no-cache` flag passes through          |
| Filter     | `yarn test --test-name-pattern=...` | Test filtering works (expects 1/4 tests)  |
| Reporters  | `yarn test --reporters=jest-junit`  | Custom reporters work + junit.xml created |
| Shard 1/2  | `yarn test --shard=1/2`             | Sharding works (expects 1/4 tests)        |
| Shard 2/2  | `yarn test --shard=2/2`             | Sharding works (expects 3/4 tests)        |

**multiple-apps validations**:

| Test              | Command                                                       | What it validates                  |
| ----------------- | ------------------------------------------------------------- | ---------------------------------- |
| Project select    | `yarn test my-first-app`                                      | Can run tests for specific project |
| Project select    | `yarn test my-second-app`                                     | Can run tests for specific project |
| Library           | `yarn test my-shared-library`                                 | Library testing works              |
| Filter + project  | `yarn test my-first-app --test-name-pattern=...`              | Combined filtering                 |
| Path patterns     | `yarn test --test-path-patterns=...`                          | Path-based filtering               |
| Multiple patterns | `yarn test --test-path-patterns=... --test-path-patterns=...` | Multiple pattern filters           |
| Find related      | `yarn test --find-related-tests ...`                          | Related file detection             |

**Cypress E2E**: Basic sanity check that app renders (validates builder doesn't break the app).

---

### @angular-builders/bazel

**What it tests**: Bazel builder correctly invokes Bazel and Angular CLI integration works.

#### Test

1. Runs `yarn build` (which invokes `ng build` → Bazel)
2. Compares `bazel-bin/out` content to expected "hello world" using `packages/bazel/tests/validate.js`

---

### @angular-builders/timestamp

**No CI tests** - This is a demo builder from a Medium article. The example app has Cypress E2E but it's not run in CI.

---

## Port Configuration

All example apps have `port: 0` configured in their `angular.json` serve options:

```json
{
  "serve": {
    "options": {
      "port": 0
    }
  }
}
```

This tells Angular CLI to automatically select an available port. The Cypress schematic receives the actual port via `devServerTarget` and passes it to Cypress, enabling:

- **CI**: Matrix jobs run in isolated environments (port doesn't matter)
- **Local**: Multiple tests can run in parallel without port conflicts

---

## Test Count Summary

| Category             | Count   | Details                                    |
| -------------------- | ------- | ------------------------------------------ |
| Package unit tests   | ~varies | Run during build, test internal code       |
| Schema E2E tests     | ~10     | Validate schema compatibility              |
| Karma tests          | 3       | sanity-app, sanity-app-esm, full-cycle-app |
| Vitest tests         | 5       | 2 apps × 2-3 configs each                  |
| Cypress E2E          | 17      | Various app/config combinations            |
| Jest CLI validations | 12      | Various flag combinations                  |
| Bazel                | 1       | Build + output comparison                  |
| **Total**            | **~41** | All run in parallel via matrix             |

---

## Key Files

| File                               | Purpose                                                                            |
| ---------------------------------- | ---------------------------------------------------------------------------------- |
| `.github/workflows/ci.yml`         | GitHub Actions workflow with matrix strategy                                       |
| `turbo.json`                       | Turborepo config (affected detection, caching)                                     |
| `scripts/discover-tests.js`        | Discovers all package test definitions, reads turbo summary for affected detection |
| `scripts/run-local-tests.js`       | Local test runner for development                                                  |
| `packages/*/tests/integration.js`  | Package-owned test definitions                                                     |
| `packages/jest/tests/validate.js`  | Jest package validation logic                                                      |
| `packages/bazel/tests/validate.js` | Bazel package validation logic                                                     |
| `jest-ut.config.js`                | Jest config for package unit tests                                                 |
| `jest-e2e.config.js`               | Jest config for package schema tests                                               |
