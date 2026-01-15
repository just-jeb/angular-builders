# CI/CD Architecture Documentation

This document describes the test architecture for the angular-builders monorepo, explaining what each test validates semantically and how the CI pipeline is structured.

## Repository Structure Overview

```
angular-builders/
├── packages/           # Published npm packages (builders)
│   ├── common/         # Shared utilities
│   ├── custom-webpack/ # Webpack customization builders
│   ├── custom-esbuild/ # ESBuild customization builders
│   ├── jest/           # Jest test runner builder
│   ├── bazel/          # Bazel integration builder
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
│ When: CI scripts (packages/*/scripts/ci.sh)                         │
└─────────────────────────────────────────────────────────────────────┘
```

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

The Jest builder tests are different - they validate **CLI option passthrough** by running Jest with various flags and checking the output matches expected test counts.

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

#### Test (ci.js)

1. Runs `yarn build` (which invokes `ng build` → Bazel)
2. Compares `bazel-bin/out` content to expected "hello world"

---

### @angular-builders/timestamp

**No CI tests** - This is a demo builder from a Medium article. The example app has Cypress E2E but it's not run in CI.

---

## Current CI Flow

```
yarn ci
├── yarn build:packages
│   ├── Build @angular-builders/common first
│   └── Build other packages (parallel)
│       └── For each package: tsc → merge-schemes → postbuild
│           └── postbuild: yarn test (UT) && yarn e2e (schema tests)
│
└── ./scripts/run-ci.sh
    ├── Start Xvfb (Linux only, for Cypress)
    └── yarn workspaces foreach -vip run ci
        ├── @angular-builders/custom-webpack → scripts/ci.sh
        ├── @angular-builders/custom-esbuild → scripts/ci.sh
        ├── @angular-builders/jest → scripts/ci.sh
        └── @angular-builders/bazel → scripts/ci.js
```

**Note**: The `-p` flag means packages run their `ci` scripts in parallel, but within each script, tests run sequentially.

---

## Port Assignments (Current)

Each example app has hardcoded ports to avoid conflicts:

| App                         | Serve Port | Cypress Port |
| --------------------------- | ---------- | ------------ |
| sanity-app                  | 5001       | 4221         |
| sanity-app-esm              | 5007       | 4224         |
| full-cycle-app              | 5008       | 4220         |
| sanity-esbuild-app          | 5006       | 4225         |
| sanity-esbuild-app-esm      | 5009       | 4226         |
| simple-app                  | 5003       | 4222         |
| multiple-apps/my-first-app  | 5002       | 4210         |
| multiple-apps/my-second-app | 5002       | 4211         |
| timestamp                   | 5004       | 4223         |

---

## Test Count Summary

| Category                 | Count      | Details                                    |
| ------------------------ | ---------- | ------------------------------------------ |
| Package unit tests       | ~varies    | Run during build, test internal code       |
| Schema E2E tests         | ~10        | Validate schema compatibility              |
| Karma tests              | 3 apps     | sanity-app, sanity-app-esm, full-cycle-app |
| Vitest tests             | 5 configs  | 2 apps × 2-3 configs each                  |
| Cypress E2E              | 17 configs | Various app/config combinations            |
| Jest CLI validations     | 12         | Various flag combinations                  |
| Bazel                    | 1          | Build + output comparison                  |
| **Total parallelizable** | **~38**    | At matrix level                            |

---

## Key Files

| File                                    | Purpose                                             |
| --------------------------------------- | --------------------------------------------------- |
| `.github/workflows/ci.yml`              | GitHub Actions workflow                             |
| `scripts/run-ci.sh`                     | Main CI orchestrator (starts Xvfb, runs workspaces) |
| `packages/custom-webpack/scripts/ci.sh` | Custom-webpack integration tests                    |
| `packages/custom-esbuild/scripts/ci.sh` | Custom-esbuild integration tests                    |
| `packages/jest/scripts/ci.sh`           | Jest builder validation tests                       |
| `packages/bazel/scripts/ci.js`          | Bazel builder tests                                 |
| `jest-ut.config.js`                     | Jest config for package unit tests                  |
| `jest-e2e.config.js`                    | Jest config for package schema tests                |
