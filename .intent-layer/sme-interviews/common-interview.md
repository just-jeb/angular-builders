---
type: sme-interview
repository: angular-builders
area: packages/common
created: 2026-02-16
status: draft
last_merged: null
---

# SME Interview: Common (Shared Kernel)

## Respondent

- **Name:**
- **Role:**
- **Date:**

## Boundaries

### What is the primary responsibility of `@angular-builders/common`? What does it NOT do?

> [Answer]

### Are there plans to expand this package's scope beyond module loading and path resolution?

> [Answer]

## Critical Invariants

### What must NEVER happen with ts-node registration? Are there known edge cases with multiple tsconfig files?

> [Answer]

### Are there any file extensions or module formats that `loadModule` intentionally does NOT support?

> [Answer]

## Patterns

### What's the canonical way to add support for a new module format?

> [Answer]

### What approaches to ESM/CJS interop have been tried and abandoned?

> [Answer]

## Tribal Knowledge

### What do new contributors always get wrong about the `loadModule` function?

> [Answer]

### Why is the `new Function('modulePath', 'return import(modulePath)')` pattern used instead of a direct dynamic import?

> [Answer]

## Additional Notes

> [Free-form]
