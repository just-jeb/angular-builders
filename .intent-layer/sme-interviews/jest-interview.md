---
type: sme-interview
repository: angular-builders
area: packages/jest
created: 2026-02-16
status: draft
last_merged: null
---

# SME Interview: Jest Builder

## Respondent

- **Name:**
- **Role:**
- **Date:**

## Boundaries

### What is the primary responsibility of `@angular-builders/jest`? What does it NOT do?

> [Answer]

### How tightly is this package coupled to `jest-preset-angular`? Could it work without it?

> [Answer]

## Critical Invariants

### What must NEVER happen during the 4-layer configuration merge? Are there merge precedence issues users hit?

> [Answer]

### Why are only `setupFilesAfterEnv` and `astTransformers` concatenated while other arrays use index-based merge?

> [Answer]

## Patterns

### What's the canonical way for users to customize Jest configuration while keeping the builder's defaults?

> [Answer]

### What's the recommended approach for multi-project workspaces?

> [Answer]

### What approaches to zone.js setup have been tried and abandoned?

> [Answer]

## Tribal Knowledge

### What do users most commonly get wrong when migrating from Karma to this Jest builder?

> [Answer]

### What broke during the Jest 29 to Jest 30 upgrade? What lessons were learned?

> [Answer]

### Why was the `zoneless` option added and defaulted to `true`? What user confusion does this cause?

> [Answer]

### What global mocks have been removed over time, and why?

> [Answer]

## Additional Notes

> [Free-form]
