# Examples

> Integration test fixtures -- Angular workspace apps used exclusively for CI and local integration testing of `@angular-builders/*` packages. You probably do not need to be here.

## At a Glance

|                  |                                                                                                         |
| ---------------- | ------------------------------------------------------------------------------------------------------- |
| **Type**         | Test Fixtures Boundary                                                                                  |
| **Owns**         | Angular app workspaces that exercise builder packages in real `ng build`/`ng test`/`ng serve` scenarios |
| **Does NOT own** | Builder logic (lives in `../packages/`), unit tests (live alongside source in each package)             |
| **Users**        | CI pipeline, developers running integration tests locally                                               |

## Navigation

- Parent: [`../AGENTS.md`](../AGENTS.md)
- Related: [`../packages/AGENTS.md`](../packages/AGENTS.md) -- the packages these examples test

## When to Come Here

- You are adding a new builder feature and need to add or modify an integration test
- An integration test is failing in CI and you need to understand what it exercises
- You are adding a new example app for a new builder or configuration variant

**If you are:** fixing a builder bug, understanding builder architecture, or modifying builder logic -- go to [`../packages/AGENTS.md`](../packages/AGENTS.md) instead.

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

Each example app is a standalone Angular workspace registered in the root `package.json` workspaces.

## How Integration Tests Work

1. Each package defines tests in `packages/{name}/tests/integration.js` as an array of `{ id, name, purpose, app, command }` objects
2. `scripts/discover-tests.js` collects all tests, optionally filtering by Turbo's affected packages
3. **In CI:** Test matrix is generated as a JSON output from the `build` job and consumed by the `integration` job matrix strategy
4. **Locally:** `node scripts/run-local-tests.js` runs tests in parallel with optional `--package` and `--id` filters

## Invariants

**MUST:** Each example app must be a valid Angular workspace with its own `package.json`, `angular.json`, and `tsconfig.json`. Dependencies are installed via the root workspace (Yarn workspaces hoisting).

**MUST:** Integration test commands must be runnable from the example app directory with `sh -c`. They rely on the builder packages being built first (dist/ must exist).

**MUST NEVER:** Import source code directly from `packages/*/src/`. Examples use the built packages via `dist/` (resolved through workspace linking).

## Pitfalls

| Trap                                     | Reality                                                                                                                                                                                                                                      |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "These are user-facing example projects" | They are primarily test fixtures. While they can serve as references, their configurations are designed to exercise edge cases (ESM/CJS variants, TypeScript configs, multi-project workspaces), not to be minimal getting-started examples. |
| "I can run example app tests directly"   | You must build the relevant package first (`yarn build` from the package dir, or `yarn build:packages:all` from root). The examples link to `dist/`, not `src/`.                                                                             |
| "Each example tests one thing"           | A single example app often serves multiple integration test entries with different configurations (`-c esm`, `-c cjs`, `-c production`, etc.). Check the integration.js file for the full test matrix.                                       |
