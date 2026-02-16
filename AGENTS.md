# angular-builders

> Community builders for Angular CLI's build facade -- extend Angular's build, test, and serve tooling without ejecting.

## Quick Start

```bash
yarn                       # Install dependencies (Yarn 3 with workspaces)
yarn build:packages:all    # Build all packages (TypeScript + schema merge)
yarn test:local            # Run integration tests locally (parallel)
```

## Intent Layer

AGENTS.md files at semantic boundaries provide AI agents with context. Start here, then drill into child nodes.

| Area                         | Node                                                                     | Type                   |
| ---------------------------- | ------------------------------------------------------------------------ | ---------------------- |
| Packages (all builders)      | [`packages/AGENTS.md`](packages/AGENTS.md)                               | Architectural Layer    |
| Common utilities             | [`packages/common/AGENTS.md`](packages/common/AGENTS.md)                 | Shared Kernel          |
| Custom ESBuild builders      | [`packages/custom-esbuild/AGENTS.md`](packages/custom-esbuild/AGENTS.md) | Self-contained Package |
| Custom Webpack builders      | [`packages/custom-webpack/AGENTS.md`](packages/custom-webpack/AGENTS.md) | Self-contained Package |
| Jest builder                 | [`packages/jest/AGENTS.md`](packages/jest/AGENTS.md)                     | Self-contained Package |
| Bazel builder                | [`packages/bazel/AGENTS.md`](packages/bazel/AGENTS.md)                   | Self-contained Package |
| Timestamp builder            | [`packages/timestamp/AGENTS.md`](packages/timestamp/AGENTS.md)           | Self-contained Package |
| Example apps / test fixtures | [`examples/AGENTS.md`](examples/AGENTS.md)                               | Test Fixtures Boundary |
| CI & build scripts           | [`scripts/AGENTS.md`](scripts/AGENTS.md)                                 | Capability Domain      |

**Keep Intent Nodes in sync with code changes. See [`MAINTENANCE.md`](MAINTENANCE.md) for sync instructions and update procedures.**

## Architecture

This is a Yarn 3 monorepo managed by Turbo (builds) and Lerna-Lite (publishing). It publishes six `@angular-builders/*` npm packages that extend Angular CLI's Architect build system. Builders' major versions track Angular's major version (currently 21).

The two primary packages -- `custom-esbuild` and `custom-webpack` -- wrap Angular's two build systems respectively: `@angular/build` (esbuild/Vite) and `@angular-devkit/build-angular` (Webpack). They allow users to inject custom build configuration without ejecting from the CLI. The `jest` package replaces Karma with Jest for `ng test`. `bazel` and `timestamp` are thinner wrappers.

### Package Dependency Graph

```
custom-esbuild ──> common ──> ts-node, tsconfig-paths
custom-webpack ──> common
jest ──────────> common
bazel            (standalone -- no common dependency)
timestamp        (standalone -- no common dependency)
```

### Schema Merging (Build-Time)

`custom-esbuild` and `custom-webpack` extend Angular's base builder schemas with custom properties. During build:

1. TypeScript compiles to `dist/`
2. `merge-schemes.ts` (repo root) runs, reading the package's `src/schemes.ts`
3. Each scheme definition specifies: the original Angular schema, extension files (`schema.ext.json`), and output path
4. The merge uses lodash `mergeWith` with two special markers:
   - `__REPLACE__` array prefix: replaces the base value entirely instead of merging
   - `__DELETE__` string value: removes the property from the output schema
5. Merged schemas are written to `dist/*/schema.json`

`merge-schemes.ts` uses `resolvePackagePath` from `common` to bypass package `exports` maps when resolving `@angular/build`'s internal schema files.

## Cross-Cutting Concerns

| Concern                     | Pattern                                                                                                                       | Reference                                                                            |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Module loading (CJS/ESM/TS) | All user-provided modules loaded via `@angular-builders/common`'s `loadModule()`                                              | [`packages/common/AGENTS.md`](packages/common/AGENTS.md)                             |
| Angular version tracking    | All packages track the same Angular major. Update via `yarn update:packages <version>`                                        | [`scripts/AGENTS.md`](scripts/AGENTS.md)                                             |
| Publishing                  | Independent versioning via Lerna-Lite. Conventional commits. Beta on master push, graduate via manual workflow dispatch       | `.github/workflows/ci.yml`                                                           |
| Testing (unit)              | Jest (v29 for most packages, v30 for the jest package itself). Config at repo root: `jest-ut.config.js`, `jest-e2e.config.js` | Package-level `yarn test`                                                            |
| Testing (integration)       | Defined in `packages/*/tests/integration.js`, executed against `examples/*` apps                                              | [`scripts/AGENTS.md`](scripts/AGENTS.md), [`examples/AGENTS.md`](examples/AGENTS.md) |
| Code formatting             | Prettier via lint-staged + Husky pre-commit hook                                                                              | Root `package.json` prettier config                                                  |
| Commits                     | Conventional Commits enforced via commitlint                                                                                  | `.commitlintrc.json`                                                                 |
| Dependency updates          | Renovate bot with config in `renovate.json`                                                                                   | `renovate.json`                                                                      |

## Invariants

**MUST:** Builder major versions match Angular CLI major version. A v21 builder requires Angular CLI 21.

**MUST:** All packages publish under `@angular-builders` npm scope with public access.

**MUST:** `custom-esbuild` and `custom-webpack` run `merge-schemes.ts` during build. Missing this step means builder schemas in `dist/` will be absent or stale, causing Angular CLI validation failures.

**MUST NEVER:** Cross-import between builder packages (e.g., `custom-esbuild` importing from `custom-webpack`). Shared code goes in `common`.

**MUST NEVER:** Edit auto-generated files: `packages/jest/src/schema.ts`, `packages/bazel/src/schema.ts`, `packages/timestamp/src/schema.ts` (generated by quicktype), and `dist/*/schema.json` (generated by merge-schemes).
