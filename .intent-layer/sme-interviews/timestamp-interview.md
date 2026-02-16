---
type: sme-interview
repository: angular-builders
area: packages/timestamp
created: 2026-02-16
status: complete
last_merged: 2026-02-16
---

# SME Interview: Timestamp Builder

## Respondent

- **Name:** Jeb (maintainer)
- **Role:** Project maintainer
- **Date:** 2026-02-16

## Boundaries

### What is the primary responsibility of `@angular-builders/timestamp`? Is it intended as a production tool or mainly a reference/tutorial?

> Tutorial/example — created as a teaching tool to demonstrate how to write Angular CLI builders. Not intended for production use.

## Critical Invariants

### Are there any known issues with file path resolution or permissions when writing the timestamp file?

> Three potential issues found in `src/index.ts` (line 13): (1) **No path traversal validation** — the `path` option is concatenated as `${workspaceRoot}/${path}` without checking for `../` sequences, so a user could write outside the workspace root. (2) **No parent directory creation** — if the `path` includes nested directories that don't exist, `fs.writeFile()` fails with `ENOENT`. The error is caught but returns `{ success: false }` silently. (3) **No permission pre-checks** — on restricted CI/container environments, write failures are caught but not distinguished from other errors. These are known limitations of a tutorial/teaching package, not production concerns. (Source: code investigation, 2026-02-16)

## Patterns

### What's the canonical `angular.json` configuration for using this builder?

> From README.md and `examples/timestamp/angular.json`: `{ "builder": "@angular-builders/timestamp:file", "options": {} }`. Schema defaults: `path` defaults to `"./timestamp"`, `format` defaults to `"dd/mm/yyyy"`. Run with `ng run [project]:timestamp`. The example app chains it: `"build": "ng build && ng run example:timestamp"`. (Source: code investigation, 2026-02-16)

## Tribal Knowledge

### Was this builder created primarily for the "Angular CLI under the hood" blog post? Is there significant real-world usage?

> Yes, created for the blog post. Minimal real-world usage.

## Additional Notes

> This is a teaching/reference package, not a production tool. Its value is as a minimal example of how to write an Angular CLI builder.
