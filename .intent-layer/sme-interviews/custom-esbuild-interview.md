---
type: sme-interview
repository: angular-builders
area: packages/custom-esbuild
created: 2026-02-16
status: complete
last_merged: 2026-02-16
---

# SME Interview: Custom ESBuild

## Respondent

- **Name:** Jeb (maintainer)
- **Role:** Project maintainer
- **Date:** 2026-02-16

## Boundaries

### What is the primary responsibility of `@angular-builders/custom-esbuild`? What does it NOT do?

> Let users add custom esbuild plugins and index transforms to Angular's esbuild-based builders. It extends Angular's esbuild pipeline, not replaces it.

### How does this package's scope differ from the custom-webpack package? Are there features that exist in one but not the other?

> The goal is feature parity (index transforms, etc.) but the extension model is fundamentally different — esbuild uses plugins while webpack uses config merging. There are a couple of open issues/feature requests that may expand the scope.

## Critical Invariants

### What must NEVER happen when passing options to `@angular/build`'s builders? Are there options that must be stripped?

> Uncertain — would need to check the code to confirm which options must be stripped before delegation.

### Why does the dev-server builder need to patch the builder context? What breaks without this?

> Related to how Angular handles builder resolution internally. Not clear whether Angular has fixed this on their side. Needs investigation of git history and Angular's repo to confirm current state.

## Patterns

### What's the canonical way for users to write an esbuild plugin that needs access to builder options?

> Likely a factory function pattern that receives options, but would need to verify against code and docs.

### What's the recommended approach for index.html transformations?

> Use the `indexHtmlTransformer` option pointing to a TS/JS file.

### What approaches to esbuild plugin loading have failed or been abandoned?

> Don't recall specific abandoned approaches.

## Tribal Knowledge

### What do users most commonly get wrong when configuring plugins?

> Would need to check issues to identify common patterns.

### What changes in `@angular/build` between Angular versions have broken this package? What's the upgrade process?

> Internal API moves (imports/exports renamed or moved between @angular packages) and plugin API changes (how Angular's esbuild integration handles plugins).

### Why does the unit-test builder hardcode `runner: 'vitest'`? Was Karma support ever considered?

> This is Angular's choice — Angular's unit-test builder uses Vitest, and this package simply extends it.

## Additional Notes

> N/A
