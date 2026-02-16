---
type: sme-interview
repository: angular-builders
area: packages/common
created: 2026-02-16
status: complete
last_merged: 2026-02-16
---

# SME Interview: Common (Shared Kernel)

## Respondent

- **Name:** Jeb (maintainer)
- **Role:** Project maintainer
- **Date:** 2026-02-16

## Boundaries

### What is the primary responsibility of `@angular-builders/common`? What does it NOT do?

> General shared utilities used across all builder packages. Currently focused on module loading and path resolution but not limited to that scope.

### Are there plans to expand this package's scope beyond module loading and path resolution?

> Possible — might grow if common patterns emerge across builders, but no specific plans at this time.

## Critical Invariants

### What must NEVER happen with ts-node registration? Are there known edge cases with multiple tsconfig files?

> ts-node must never be registered twice (causes conflicts). The first tsconfig wins and is sticky — registering with the wrong tsconfig first breaks everything. There is a recent open issue related to the wrong tsconfig edge case.

### Are there any file extensions or module formats that `loadModule` intentionally does NOT support?

> `loadModule` explicitly handles four extension cases (see `packages/common/src/load-module.ts` lines 83-122): `.mjs` (ESM via dynamic import), `.cjs` (CJS via require), `.ts` (TypeScript via ts-node, with ESM fallback on `ERR_REQUIRE_ESM`), and a default case for `.js` and all other extensions (try CJS first, fall back to ESM on `ERR_REQUIRE_ESM`). JSON files are not explicitly handled but may work through Node's native `require()` support. There is no explicit support for `.jsx`, `.tsx`, or `.mts`/`.cts` extensions. (Source: code investigation, 2026-02-16)

## Patterns

### What's the canonical way to add support for a new module format?

> No formal/established pattern — done ad-hoc when needed.

### What approaches to ESM/CJS interop have been tried and abandoned?

> Multiple approaches have been tried — ESM/CJS interop has been a significant pain point with several abandoned attempts before landing on the current approach.

## Tribal Knowledge

### What do new contributors always get wrong about the `loadModule` function?

> Two common gotchas: (1) **Default export unwrapping** — `loadModule` does `require(modulePath).default || require(modulePath)` for `.ts` and `.js` files (lines 96, 111), which means it prefers `.default` if present. Users exporting `{ default: { default: ... } }` will get double-unwrapped unexpectedly. (2) **ts-node registration is sticky** — `_tsNodeRegister` (lines 5-43) only registers once with the first tsconfig it receives. If a different tsconfig is passed later, it logs a warning but does NOT re-register, so the first tsconfig wins for the entire process. This catches contributors who assume each `loadModule` call can use a different tsconfig. (Source: code investigation, 2026-02-16)

### Why is the `new Function('modulePath', 'return import(modulePath)')` pattern used instead of a direct dynamic import?

> Documented in the JSDoc at `packages/common/src/load-module.ts` lines 57-71: TypeScript unconditionally downlevels dynamic `import()` expressions into `require()` calls during compilation. Since `require()` cannot load ESM modules, this causes runtime errors. The `new Function()` constructor creates the import expression at runtime, preventing TypeScript from transforming it. The comment notes this is a workaround that can be dropped once TypeScript provides support for preserving dynamic imports. This is the same pattern used by Angular CLI internally. (Source: code investigation, 2026-02-16)

## Additional Notes

> N/A
