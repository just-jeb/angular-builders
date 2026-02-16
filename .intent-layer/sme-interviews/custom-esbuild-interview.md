---
type: sme-interview
repository: angular-builders
area: packages/custom-esbuild
created: 2026-02-16
status: draft
last_merged: null
---

# SME Interview: Custom ESBuild

## Respondent

- **Name:**
- **Role:**
- **Date:**

## Boundaries

### What is the primary responsibility of `@angular-builders/custom-esbuild`? What does it NOT do?

> [Answer]

### How does this package's scope differ from the custom-webpack package? Are there features that exist in one but not the other?

> [Answer]

## Critical Invariants

### What must NEVER happen when passing options to `@angular/build`'s builders? Are there options that must be stripped?

> [Answer]

### Why does the dev-server builder need to patch the builder context? What breaks without this?

> [Answer]

## Patterns

### What's the canonical way for users to write an esbuild plugin that needs access to builder options?

> [Answer]

### What's the recommended approach for index.html transformations?

> [Answer]

### What approaches to esbuild plugin loading have failed or been abandoned?

> [Answer]

## Tribal Knowledge

### What do users most commonly get wrong when configuring plugins?

> [Answer]

### What changes in `@angular/build` between Angular versions have broken this package? What's the upgrade process?

> [Answer]

### Why does the unit-test builder hardcode `runner: 'vitest'`? Was Karma support ever considered?

> [Answer]

## Additional Notes

> [Free-form]
