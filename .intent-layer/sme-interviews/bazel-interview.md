---
type: sme-interview
repository: angular-builders
area: packages/bazel
created: 2026-02-16
status: complete
last_merged: 2026-02-16
---

# SME Interview: Bazel Builder

## Respondent

- **Name:** Jeb (maintainer)
- **Role:** Project maintainer
- **Date:** 2026-02-16

## Boundaries

### What is the primary responsibility of `@angular-builders/bazel`? What does it NOT do?

> Bridge between Angular CLI and Bazel — allows running Bazel commands via `ng build`/`ng serve`/`ng test`. It does not provide Bazel rules or BUILD file generation.

### What is the expected user base for this builder? Is it widely used or niche?

> Mostly experimental/proof-of-concept. It was created by the Angular team as a bridge between Angular CLI and Bazel, and they looked for a good place for it to live. Not widely used in production.

## Critical Invariants

### Are there any constraints on how Bazel commands or target labels should be validated?

> Validation is intentionally minimal and delegated to Bazel. `bazelCommand` is schema-constrained to enum `["run", "build", "test"]` (see `src/schema.json` lines 14-18). `targetLabel` is accepted as a plain string with no regex or format validation. The label is passed directly to `spawn(binary, [bazelCommand, targetLabel])` as an array argument (not through shell), so there's no shell injection risk. Bazel itself validates the target label syntax; invalid labels produce Bazel error messages, not builder errors. (Source: code investigation, 2026-02-16)

### What are the implications of the signal forwarding (SIGINT/SIGTERM) to spawned processes?

> The builder registers SIGINT and SIGTERM handlers (see `src/index.ts` lines 22-27) that forward SIGTERM to the spawned Bazel/ibazel process via `ps.kill('SIGTERM')`. This enables graceful shutdown — Bazel gets a chance to clean up before the process exits. The builder then waits for the child to exit and returns `{ success: e === 0 }`. Handlers are registered once and never deregistered (harmless but redundant if multiple builds run in same process). Particularly important for ibazel watch mode, which has long-running processes that need graceful termination on Ctrl+C. (Source: code investigation, 2026-02-16)

## Patterns

### What's the canonical `angular.json` configuration for using this builder?

> From README.md and `examples/bazel/angular.json`: `{ "builder": "@angular-builders/bazel:build", "options": { "targetLabel": "//:all", "bazelCommand": "build" } }`. Required fields: `targetLabel` (string) and `bazelCommand` (enum: "build", "test", "run"). Optional: `watch` (boolean, default false — uses ibazel when true). Only one builder is registered (`@angular-builders/bazel:build`); it works for build, serve, and test targets. For watch mode: `{ "watch": true, "bazelCommand": "run" }`. (Source: code investigation, 2026-02-16)

## Tribal Knowledge

### What do users commonly get wrong when setting up Bazel with Angular CLI?

> Inferred from code and README: (1) Missing WORKSPACE and BUILD files — the README states "this builder assumes you have already created Bazel configurations." (2) Not installing `@bazel/bazelisk` and `@bazel/ibazel` — the builder depends on these to locate Bazel binaries. (3) Incorrect target label syntax — forgetting `//` prefix or using wrong paths. (4) Not understanding watch mode uses ibazel (a separate tool with different behavior). (5) Confusing builder scope — the single `bazel:build` builder is used for build, serve, and test. Small user base limits the reported issues. (Source: code investigation, 2026-02-16)

### Has the ibazel watch mode caused any known issues?

> No explicitly documented issues in the codebase. The integration test (`packages/bazel/tests/validate.js`) only tests `bazel build`, NOT watch mode — so ibazel is under-tested in CI. The ibazel dependency is regularly updated (currently `^0.28.0`). The watch mode implementation is a simple binary swap (`watch ? ibazelBin() : bazeliskBin()`) with no special error handling. Given the package's small user base and experimental nature, ibazel issues may exist but go unreported. (Source: code investigation, 2026-02-16)

## Additional Notes

> This package was contributed by the Angular team, not organically developed by the angular-builders maintainer. It has a very small user base.
