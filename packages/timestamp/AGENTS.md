# Timestamp Builder

> Angular CLI builder that writes a formatted timestamp to a file. Serves as a minimal reference implementation of the builder pattern.

## At a Glance

|                  |                                                                                                 |
| ---------------- | ----------------------------------------------------------------------------------------------- |
| **Type**         | Self-contained Package                                                                          |
| **Owns**         | `@angular-builders/timestamp` -- writes a timestamp file during build                           |
| **Does NOT own** | Application builds, any other build orchestration                                               |
| **Users**        | Angular developers wanting a build-time timestamp; also useful as a builder authoring reference |

## Navigation

- Parent: [`../AGENTS.md`](../AGENTS.md)
- Related: [`../bazel/AGENTS.md`](../bazel/AGENTS.md) -- similarly thin builder, same code-generation pattern

## Entry Points & Contracts

- `builders.json` registers: `@angular-builders/timestamp:file`
- Builder entry: `src/index.ts` -- `createTimestamp({ path, format }, context): Observable<BuilderOutput>`
  - **Guarantees:** Writes a file at `{workspaceRoot}/{path}` containing the current date formatted with `dateformat`. Returns `{ success: true }` on write success.
  - **Requires:** Schema options: `path` (output file path relative to workspace root), `format` (dateformat format string).

## Invariants

**MUST:** Use the `dateformat` library for formatting -- not `Date.toISOString()` or similar. The format string is user-controlled via schema.

## Common Tasks

| Task                    | How                                    |
| ----------------------- | -------------------------------------- |
| Build the package       | `yarn build` from `packages/timestamp` |
| Regenerate schema types | Automatic via prebuild (`quicktype`)   |

## Pitfalls

| Trap                            | Reality                                                                                                                          |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| "Schema types are hand-written" | `src/schema.ts` is auto-generated from `src/schema.json` via `quicktype` during prebuild. Edit the JSON schema, not the TS file. |
| "This is a toy/unused package"  | It is published to npm and used by consumers. It also has a full example app at `examples/timestamp/`.                           |

## Testing

```bash
# Integration tests in examples/timestamp
# No unit tests
```

## Dependencies

**Breaks if changed:** Users' `angular.json` referencing `@angular-builders/timestamp:file`
**Breaks us if changed:** `dateformat`, `@angular-devkit/architect`, `@angular-devkit/core`
