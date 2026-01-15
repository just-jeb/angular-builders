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

```
GitHub Actions Workflow (.github/workflows/ci.yml)

1. Build Job
   ├── Install dependencies
   ├── yarn build:packages
   │   └── Includes Layer 1 (UT) + Layer 2 (schema tests)
   └── Upload dist artifacts

2. Discover Job
   ├── Read all packages/*/tests/integration.js
   └── Generate matrix JSON

3. Integration Job (Matrix - ~41 parallel jobs)
   ├── Download dist artifacts
   ├── Install dependencies
   └── For each matrix entry:
       ├── cd ${{ matrix.app }}
       └── ${{ matrix.command }}

4. Publish Job (if on master)
   └── Publish to npm
```

**Key Benefits**:

- **Parallelism**: All integration tests run in parallel (limited by GHA runner limits)
- **Isolation**: Each matrix job runs in its own environment (no port conflicts)
- **Local parity**: Can run same workflow locally with `act`

---

## Local Development

### Running Tests Locally

```bash
# Run full CI locally (requires Docker + act)
act push

# Run specific test
act -j integration --matrix id:karma-builder-sanity-app

# Run single test without act
cd examples/custom-webpack/sanity-app && yarn e2e
```

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

All example apps use Angular CLI's default port (`4200`). Since matrix jobs run in isolated environments, there are no port conflicts. Port configurations were removed from `angular.json` files.

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

| File                               | Purpose                                      |
| ---------------------------------- | -------------------------------------------- |
| `.github/workflows/ci.yml`         | GitHub Actions workflow with matrix strategy |
| `scripts/discover-tests.js`        | Discovers all package test definitions       |
| `packages/*/tests/integration.js`  | Package-owned test definitions               |
| `packages/jest/tests/validate.js`  | Jest package validation logic                |
| `packages/bazel/tests/validate.js` | Bazel package validation logic               |
| `jest-ut.config.js`                | Jest config for package unit tests           |
| `jest-e2e.config.js`               | Jest config for package schema tests         |
