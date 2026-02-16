# Bazel Builder

> Angular CLI builder that delegates build/test commands to Bazel via bazelisk, with optional ibazel watch mode.

## At a Glance

|                  |                                                                                                                                                                                     |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Type**         | Self-contained Package                                                                                                                                                              |
| **Owns**         | `@angular-builders/bazel` -- Angular Architect builder wrapping Bazel execution                                                                                                     |
| **Does NOT own** | Bazel workspace configuration, BUILD files, Angular build logic                                                                                                                     |
| **Origin**       | Contributed by the Angular team as a bridge between Angular CLI and Bazel -- not organically developed by the angular-builders maintainer. (Source: SME interview, Jeb, 2026-02-16) |
| **Users**        | Small user base. Mostly experimental/proof-of-concept. Not widely used in production. (Source: SME interview, Jeb, 2026-02-16)                                                      |

## Navigation

- Parent: [`../AGENTS.md`](../AGENTS.md)
- Related: [`../timestamp/AGENTS.md`](../timestamp/AGENTS.md) -- similarly thin builder, same code-generation pattern

## Entry Points & Contracts

- `builders.json` registers a single builder: `@angular-builders/bazel:build`
- Builder entry: `src/index.ts` -- `_bazelBuilder(options, context): Promise<BuilderOutput>`
  - **Guarantees:** Spawns bazelisk (or ibazel in watch mode) with the given `bazelCommand` and `targetLabel`. Returns `{ success: true }` only if the process exits with code 0.
  - **Requires:** Bazel installed and available via `@bazel/bazelisk`. Schema options: `bazelCommand` (build/test/run), `targetLabel` (Bazel target), `watch` (boolean).

## Invariants

**MUST:** Use `@bazel/bazelisk` for Bazel execution (not a direct `bazel` binary). Bazelisk handles version management.

**MUST NEVER:** Pass arbitrary shell commands through `targetLabel` -- it is passed directly to `spawn(binary, [bazelCommand, targetLabel])` as an array argument (not through shell), so there is no shell injection risk. `bazelCommand` is schema-constrained to enum `["run", "build", "test"]` (see `src/schema.json` lines 14-18). `targetLabel` is accepted as a plain string with no regex or format validation -- Bazel itself validates the target label syntax. Invalid labels produce Bazel error messages, not builder errors. (Source: code investigation, 2026-02-16)

## Patterns

**Do:** Handle process signals. The builder registers SIGINT and SIGTERM handlers (see `src/index.ts` lines 22-27) that forward SIGTERM to the spawned Bazel/ibazel process via `ps.kill('SIGTERM')`. This enables graceful shutdown -- Bazel gets a chance to clean up before the process exits. The builder then waits for the child to exit and returns `{ success: e === 0 }`. Handlers are registered once and never deregistered (harmless but redundant if multiple builds run in the same process). Particularly important for ibazel watch mode, which has long-running processes that need graceful termination on Ctrl+C. (Source: code investigation, 2026-02-16)

### Canonical angular.json Configuration

```json
{
  "builder": "@angular-builders/bazel:build",
  "options": {
    "targetLabel": "//:all",
    "bazelCommand": "build"
  }
}
```

Required fields: `targetLabel` (string) and `bazelCommand` (enum: "build", "test", "run"). Optional: `watch` (boolean, default false -- uses ibazel when true). Only one builder is registered (`@angular-builders/bazel:build`); it works for build, serve, and test targets. For watch mode: `{ "watch": true, "bazelCommand": "run" }`. (Source: code investigation, 2026-02-16)

## Common Tasks

| Task                    | How                                                                                     |
| ----------------------- | --------------------------------------------------------------------------------------- |
| Build the package       | `yarn build` from `packages/bazel`                                                      |
| Regenerate schema types | `quicktype -s schema src/schema.json -o src/schema.ts` (done automatically in prebuild) |

## Pitfalls

| Trap                                              | Reality                                                                                                                                                                                                                                                                                             |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "Schema types are hand-written"                   | `src/schema.ts` is auto-generated from `src/schema.json` via `quicktype` during prebuild. Do not edit `schema.ts` directly -- edit `schema.json` and regenerate.                                                                                                                                    |
| "This package uses `@angular-builders/common`"    | Unlike other packages, Bazel does NOT depend on `common`. It has no module-loading needs.                                                                                                                                                                                                           |
| "I need separate builders for build/serve/test"   | The single `bazel:build` builder handles all three -- configure via `bazelCommand`: "build", "test", or "run". (Source: code investigation, 2026-02-16)                                                                                                                                             |
| "Watch mode is well-tested"                       | The integration test (`packages/bazel/tests/validate.js`) only tests `bazel build`, NOT watch mode. ibazel is under-tested in CI. The watch implementation is a simple binary swap (`watch ? ibazelBin() : bazeliskBin()`) with no special error handling. (Source: code investigation, 2026-02-16) |
| "Missing WORKSPACE/BUILD files give clear errors" | The builder assumes Bazel configurations already exist (README states this). Missing files produce Bazel error messages, not builder-level guidance. Also ensure `@bazel/bazelisk` and `@bazel/ibazel` are installed. (Source: code investigation, 2026-02-16)                                      |

## Testing

```bash
# Integration tests run via CI against examples/bazel
# No unit tests -- the builder is a thin process wrapper
```

## Dependencies

**Breaks if changed:** Users' `angular.json` referencing `@angular-builders/bazel:build`
**Breaks us if changed:** `@bazel/bazelisk`, `@bazel/ibazel`, `@angular-devkit/architect`
