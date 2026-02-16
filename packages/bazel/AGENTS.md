# Bazel Builder

> Angular CLI builder that delegates build/test commands to Bazel via bazelisk, with optional ibazel watch mode.

## At a Glance

|                  |                                                                                 |
| ---------------- | ------------------------------------------------------------------------------- |
| **Type**         | Self-contained Package                                                          |
| **Owns**         | `@angular-builders/bazel` -- Angular Architect builder wrapping Bazel execution |
| **Does NOT own** | Bazel workspace configuration, BUILD files, Angular build logic                 |
| **Origin**       | Contributed by the Angular team as a bridge between Angular CLI and Bazel -- not organically developed by the angular-builders maintainer. (Source: SME interview, Jeb, 2026-02-16) |
| **Users**        | Small user base. Mostly experimental/proof-of-concept. Not widely used in production. (Source: SME interview, Jeb, 2026-02-16) |

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

**MUST NEVER:** Pass arbitrary shell commands through `targetLabel` -- it is passed directly as a spawn argument, not through a shell.

## Patterns

**Do:** Handle process signals. The builder registers SIGINT/SIGTERM handlers to forward shutdown to the spawned Bazel process.

## Common Tasks

| Task                    | How                                                                                     |
| ----------------------- | --------------------------------------------------------------------------------------- |
| Build the package       | `yarn build` from `packages/bazel`                                                      |
| Regenerate schema types | `quicktype -s schema src/schema.json -o src/schema.ts` (done automatically in prebuild) |

## Pitfalls

| Trap                                           | Reality                                                                                                                                                          |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "Schema types are hand-written"                | `src/schema.ts` is auto-generated from `src/schema.json` via `quicktype` during prebuild. Do not edit `schema.ts` directly -- edit `schema.json` and regenerate. |
| "This package uses `@angular-builders/common`" | Unlike other packages, Bazel does NOT depend on `common`. It has no module-loading needs.                                                                        |

## Testing

```bash
# Integration tests run via CI against examples/bazel
# No unit tests -- the builder is a thin process wrapper
```

## Dependencies

**Breaks if changed:** Users' `angular.json` referencing `@angular-builders/bazel:build`
**Breaks us if changed:** `@bazel/bazelisk`, `@bazel/ibazel`, `@angular-devkit/architect`
