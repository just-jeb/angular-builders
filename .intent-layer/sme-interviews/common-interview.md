---
type: sme-interview
repository: angular-builders
area: packages/common
created: 2026-02-16
status: complete
last_merged: null
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

> Uncertain — would need to check the code to confirm.

## Patterns

### What's the canonical way to add support for a new module format?

> No formal/established pattern — done ad-hoc when needed.

### What approaches to ESM/CJS interop have been tried and abandoned?

> Multiple approaches have been tried — ESM/CJS interop has been a significant pain point with several abandoned attempts before landing on the current approach.

## Tribal Knowledge

### What do new contributors always get wrong about the `loadModule` function?

> Uncertain — would need to check issues and PRs involving this function to identify common mistakes.

### Why is the `new Function('modulePath', 'return import(modulePath)')` pattern used instead of a direct dynamic import?

> Uncertain — would need to check the git history for the original rationale.

## Additional Notes

> N/A
