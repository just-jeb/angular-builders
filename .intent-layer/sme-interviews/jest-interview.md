---
type: sme-interview
repository: angular-builders
area: packages/jest
created: 2026-02-16
status: complete
last_merged: null
---

# SME Interview: Jest Builder

## Respondent

- **Name:** Jeb (maintainer)
- **Role:** Project maintainer
- **Date:** 2026-02-16

## Boundaries

### What is the primary responsibility of `@angular-builders/jest`? What does it NOT do?

> The primary objective is to hide away the complexity behind Jest setup and the dependencies needed. It encapsulates jest-preset-angular, handles mocks, handles multi-project setup, etc. The fact that it runs Jest CLI under the hood is more of a limitation (historically there wasn't a convenient way to run it programmatically — unclear if that's changed).

### How tightly is this package coupled to `jest-preset-angular`? Could it work without it?

> Required dependency — the builder depends on jest-preset-angular for Angular-specific transformations.

## Critical Invariants

### What must NEVER happen during the 4-layer configuration merge? Are there merge precedence issues users hit?

> Two critical invariants: (1) User's jest config must never be silently overwritten by builder defaults. (2) The jest-preset-angular preset must never be dropped during merge.

### Why are only `setupFilesAfterEnv` and `astTransformers` concatenated while other arrays use index-based merge?

> Likely a default behavior. There should be a way for users to override completely (needs confirmation). The philosophy: the package's objective is to save users hassle, so if the most common use case is to add something on top of what already works, concatenation is the right default.

## Patterns

### What's the canonical way for users to customize Jest configuration while keeping the builder's defaults?

> Both approaches work: angular.json builder options for simple overrides, and a jest.config.js/ts in project root for complex configurations. They merge with builder defaults.

### What's the recommended approach for multi-project workspaces?

> The builder auto-detects multiple projects and configures Jest accordingly (check examples for confirmation).

### What approaches to zone.js setup have been tried and abandoned?

> No specific answer — would need to check git history.

## Tribal Knowledge

### What do users most commonly get wrong when migrating from Karma to this Jest builder?

> Would need to check migration-related issues to identify patterns.

### What broke during the Jest 29 to Jest 30 upgrade? What lessons were learned?

> Major breakage — significant breaking changes required major rework.

### Why was the `zoneless` option added and defaulted to `true`? What user confusion does this cause?

> Angular is moving toward zoneless, so the builder followed suit to match the ecosystem direction.

### What global mocks have been removed over time, and why?

> Don't recall specifics — would need to check the folder history in git to identify which mocks were removed and why.

## Additional Notes

> N/A
