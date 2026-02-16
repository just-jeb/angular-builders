---
type: sme-interview
repository: angular-builders
area: packages/custom-webpack
created: 2026-02-16
status: complete
last_merged: 2026-02-16
---

# SME Interview: Custom Webpack

## Respondent

- **Name:** Jeb (maintainer)
- **Role:** Project maintainer
- **Date:** 2026-02-16

## Boundaries

### What is the primary responsibility of `@angular-builders/custom-webpack`? What does it NOT do?

> Let users merge custom webpack configuration (including plugins, which are part of webpack config) into Angular's webpack config. It extends Angular's webpack build, not replaces it.

### Is this package considered legacy now that Angular is moving to esbuild, or will it be maintained long-term?

> Follows Angular — maintained as long as Angular supports webpack builders. When Angular drops webpack, this follows suit.

## Critical Invariants

### What must NEVER happen during webpack config merging? Are there merge edge cases that have caused production issues?

> Plugin clobbering (accidentally overwriting Angular's critical webpack plugins breaks builds silently) and loader conflicts (duplicate or conflicting loader rules cause subtle compilation issues). Specific historical incidents need investigation via issue history.

### Why are the DEFAULT_MERGE_RULES set to match loaders by `test` and `use.loader`? What breaks if these defaults change?

> Goes way back in history — the original rationale is unclear and needs to be checked in git history.

## Patterns

### When should users choose a factory function over an object export for their webpack config?

> Factory function when you need access to Angular's resolved config, target info, or builder options. Static object export for simple, unconditional config additions.

### What's the canonical way to replace an Angular default webpack plugin?

> Mostly by adding a plugin with the same constructor name (name matching). However, there have been some issues with this approach — possibly related to duplicate plugins or duplicate versions. Needs investigation of issue history.

### What approaches to webpack config merging have been tried and abandoned (e.g., the old `mergeStrategies`)?

> Had a `mergeStrategies` API that was replaced by the current merge rules approach.

## Tribal Knowledge

### What do users most commonly get wrong about plugin merging behavior?

> Would need to check issues to identify common patterns.

### What are the most common issues when upgrading to a new Angular version?

> Same as general packages — internal API moves and schema changes from Angular CLI.

### Why does `indexTransform` receive `(target, indexHtml)` with target first, unlike most Angular transforms?

> Unknown — would need to check the history for the original reasoning.

## Additional Notes

> N/A
