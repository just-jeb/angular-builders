# Examples

> Integration test fixtures AND user-facing reference examples -- Angular workspace apps used for CI/local integration testing of `@angular-builders/*` packages, but also looked at by users for reference. You probably do not need to be here unless working on integration tests.

## At a Glance

|                  |                                                                                                                                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Type**         | Test Fixtures Boundary                                                                                                                                                                                       |
| **Owns**         | Angular app workspaces that exercise builder packages in real `ng build`/`ng test`/`ng serve` scenarios. Dual purpose: test fixtures and user-facing documentation. (Source: SME interview, Jeb, 2026-02-16) |
| **Does NOT own** | Builder logic (lives in `../packages/`), unit tests (live alongside source in each package)                                                                                                                  |
| **Users**        | CI pipeline, developers running integration tests locally                                                                                                                                                    |

## Navigation

- Parent: [`../AGENTS.md`](../AGENTS.md)
- Related: [`../packages/AGENTS.md`](../packages/AGENTS.md) -- the packages these examples test

## When to Come Here

- You are adding a new builder feature and need to add or modify an integration test
- An integration test is failing in CI and you need to understand what it exercises
- You are adding a new example app for a new builder or configuration variant

**If you are:** fixing a builder bug, understanding builder architecture, or modifying builder logic -- go to [`../packages/AGENTS.md`](../packages/AGENTS.md) instead.

**Adding a new integration test:** Usually modify an existing example app. If that cannot achieve the test goal, create a new example app. Always add the test case to the relevant `packages/{name}/tests/integration.js` file. (Source: SME interview, Jeb, 2026-02-16)

**Adding a new example app** (pattern from existing examples) (Source: code investigation, 2026-02-16):

1. Create directory at `examples/{builder-name}/{variant-name}/` (e.g., `examples/custom-webpack/sanity-app-esm/`)
2. Initialize as a valid Angular workspace with `package.json`, `angular.json`, `tsconfig.json`, and `src/` directory
3. It is auto-discovered by the root workspace via Yarn 3 `"workspaces": ["packages/*", "examples/*"]`
4. Add test entries to `packages/{builder-name}/tests/integration.js` with unique `id`, `app` path, and `command`
5. Consider adding both CJS and ESM variants to cover module format edge cases (a historically fragile area)

Key constraints: example apps must be independent (no cross-app dependencies), must never import from `packages/*/src/` directly (use built packages via workspace linking), and test commands must be runnable via `sh -c` from the app directory.

## Structure

```
examples/
  bazel/              -- Tests @angular-builders/bazel
  custom-esbuild/
    sanity-esbuild-app/       -- CJS/ESM/TS plugin variants, vitest builder
    sanity-esbuild-app-esm/   -- Same tests in an ESM-type package
  custom-webpack/
    sanity-app/        -- Basic browser + dev-server + karma tests
    sanity-app-esm/    -- Same tests in an ESM-type package
    full-cycle-app/    -- Full webpack customization + indexTransform tests
  jest/
    simple-app/        -- Single-app workspace with Jest
    multiple-apps/     -- Multi-project workspace with Jest
  timestamp/           -- Tests @angular-builders/timestamp
```

Each example app is a standalone Angular workspace registered in the root `package.json` workspaces. Note: `examples/*` only matches direct children (`bazel`, `timestamp`). The nested patterns (`examples/custom-esbuild/*`, `examples/custom-webpack/*`, `examples/jest/*`) are required because Yarn workspace globs are not recursive -- without them, apps in subdirectories would not be discovered.

## How Integration Tests Work

1. Each package defines tests in `packages/{name}/tests/integration.js` as an array of `{ id, name, purpose, app, command }` objects
2. `scripts/discover-tests.js` collects all tests, optionally filtering by Turbo's affected packages
3. **In CI:** Test matrix is generated as a JSON output from the `build` job and consumed by the `integration` job matrix strategy
4. **Locally:** `node scripts/run-local-tests.js` runs tests in parallel with optional `--package` and `--id` filters

## Invariants

**MUST:** Each example app must be a valid Angular workspace with its own `package.json`, `angular.json`, and `tsconfig.json`. Dependencies are installed via the root workspace (Yarn workspaces hoisting).

**MUST:** Integration test commands must be runnable from the example app directory with `sh -c`. They rely on the builder packages being built first (dist/ must exist).

**MUST NEVER:** Import source code directly from `packages/*/src/`. Examples use the built packages via `dist/` (resolved through workspace linking).

All example apps are independent and can be tested in any order -- there are no dependencies between them. (Source: SME interview, Jeb, 2026-02-16)

## Pitfalls

| Trap                                            | Reality                                                                                                                                                                                                                                                                            |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "These are purely user-facing example projects" | They serve dual purpose: primarily test fixtures but also user-facing references. Their configurations exercise edge cases (ESM/CJS variants, TypeScript configs, multi-project workspaces) and are not minimal getting-started examples. (Source: SME interview, Jeb, 2026-02-16) |
| "I can run example app tests directly"          | You must build the relevant package first (`yarn build` from the package dir, or `yarn build:packages:all` from root). The examples link to `dist/`, not `src/`.                                                                                                                   |
| "Each example tests one thing"                  | A single example app often serves multiple integration test entries with different configurations (`-c esm`, `-c cjs`, `-c production`, etc.). Check the integration.js file for the full test matrix.                                                                             |
| "Integration tests are stable"                  | The most common cause of flaky integration tests is dev server port conflicts when running tests in parallel. Tests may also behave differently in CI vs. local due to environment differences. (Source: SME interview, Jeb, 2026-02-16)                                           |
| "CJS/ESM variants are redundant"                | CJS and ESM example app variants specifically test that user configs work in both module formats -- a historically fragile area. Both variants are needed. (Source: SME interview, Jeb, 2026-02-16)                                                                                |
