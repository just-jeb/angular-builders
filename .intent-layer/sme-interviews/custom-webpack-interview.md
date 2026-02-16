---
type: sme-interview
repository: angular-builders
area: packages/custom-webpack
created: 2026-02-16
status: draft
last_merged: null
---

# SME Interview: Custom Webpack

## Respondent

- **Name:**
- **Role:**
- **Date:**

## Boundaries

### What is the primary responsibility of `@angular-builders/custom-webpack`? What does it NOT do?

> [Answer]

### Is this package considered legacy now that Angular is moving to esbuild, or will it be maintained long-term?

> [Answer]

## Critical Invariants

### What must NEVER happen during webpack config merging? Are there merge edge cases that have caused production issues?

> [Answer]

### Why are the DEFAULT_MERGE_RULES set to match loaders by `test` and `use.loader`? What breaks if these defaults change?

> [Answer]

## Patterns

### When should users choose a factory function over an object export for their webpack config?

> [Answer]

### What's the canonical way to replace an Angular default webpack plugin?

> [Answer]

### What approaches to webpack config merging have been tried and abandoned (e.g., the old `mergeStrategies`)?

> [Answer]

## Tribal Knowledge

### What do users most commonly get wrong about plugin merging behavior?

> [Answer]

### What are the most common issues when upgrading to a new Angular version?

> [Answer]

### Why does `indexTransform` receive `(target, indexHtml)` with target first, unlike most Angular transforms?

> [Answer]

## Additional Notes

> [Free-form]
