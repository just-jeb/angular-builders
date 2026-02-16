# Timestamp Builder

> Tutorial/teaching builder that writes a formatted timestamp to a file. Created for the ["Angular CLI under the hood -- builders demystified"](https://www.justjeb.com/post/angular-cli-under-the-hood-builders-demystified) blog post. Not intended for production use -- its value is as a minimal example of how to write an Angular CLI builder. (Source: SME interview, Jeb, 2026-02-16)

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

**Known limitations** (acceptable for a tutorial package, see `src/index.ts` line 13) (Source: code investigation, 2026-02-16):

- **No path traversal validation** -- `path` is concatenated as `${workspaceRoot}/${path}` without checking for `../` sequences
- **No parent directory creation** -- if `path` includes nested directories that don't exist, `fs.writeFile()` fails with `ENOENT` (caught, returns `{ success: false }` silently)
- **No permission pre-checks** -- write failures in restricted environments are caught but not distinguished from other errors

### Canonical angular.json Configuration

```json
{
  "builder": "@angular-builders/timestamp:file",
  "options": {}
}
```

Schema defaults: `path` defaults to `"./timestamp"`, `format` defaults to `"dd/mm/yyyy"`. Run with `ng run [project]:timestamp`. Can be chained: `"build": "ng build && ng run example:timestamp"`. (Source: code investigation, 2026-02-16)

## Common Tasks

| Task                    | How                                    |
| ----------------------- | -------------------------------------- |
| Build the package       | `yarn build` from `packages/timestamp` |
| Regenerate schema types | Automatic via prebuild (`quicktype`)   |

## Pitfalls

| Trap                            | Reality                                                                                                                                                                                                      |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| "Schema types are hand-written" | `src/schema.ts` is auto-generated from `src/schema.json` via `quicktype` during prebuild. Edit the JSON schema, not the TS file.                                                                             |
| "This is a toy/unused package"  | It is published to npm but has minimal real-world usage. Its primary value is as a builder authoring reference. It has a full example app at `examples/timestamp/`. (Source: SME interview, Jeb, 2026-02-16) |

## Testing

```bash
# Integration tests in examples/timestamp
# No unit tests
```

## Dependencies

**Breaks if changed:** Users' `angular.json` referencing `@angular-builders/timestamp:file`
**Breaks us if changed:** `dateformat`, `@angular-devkit/architect`, `@angular-devkit/core`
