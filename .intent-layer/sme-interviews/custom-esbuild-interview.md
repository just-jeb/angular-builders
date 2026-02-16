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

> Two custom options must be stripped before delegation: `plugins` and `indexHtmlTransformer`. The application builder passes them as separate `extensions` to `buildApplication()` (see `src/application/index.ts`). The dev-server builder strips them via `cleanBuildTargetOptions()` in `src/dev-server/patch-builder-context.ts`, which does `delete options.plugins; delete options.indexHtmlTransformer`. Without stripping, Angular's schema validation rejects the unknown properties. The unit-test builder passes `plugins` via `extensions` similarly. (Source: code investigation, 2026-02-16)

### Why does the dev-server builder need to patch the builder context? What breaks without this?

> The context patching in `src/dev-server/patch-builder-context.ts` serves two critical functions: (1) **Server selection** — Angular's dev-server checks `context.getBuilderNameForTarget()` to decide Vite vs Webpack. Without patching, `@angular-builders/custom-esbuild:application` is unrecognized and Angular falls back to the wrong dev server. The patch remaps it to `@angular/build:application`. (2) **Custom option stripping** — it intercepts `context.getTargetOptions()` to remove `plugins` and `indexHtmlTransformer` before Angular's builder receives them, preventing schema validation failures. Without this patch, `ng serve` would silently use the wrong server and/or fail validation. (Source: code investigation, 2026-02-16)

## Patterns

### What's the canonical way for users to write an esbuild plugin that needs access to builder options?

> Three patterns supported (see `src/load-plugins.ts`): (1) **Factory function** (recommended) — export a function `(builderOptions, target) => Plugin | Plugin[]` from a plain string plugin path. (2) **Factory with custom options** — use `{ path, options }` config in angular.json; the function receives `(pluginOptions, builderOptions, target) => Plugin`. (3) **Static plugin** — export a Plugin object directly (no builder options access). Parameter count differs: string paths get 2 params, `{path, options}` objects get 3. Plugins can be `.ts`, `.js`, `.cjs`, or `.mjs`. Examples in `examples/custom-esbuild/sanity-esbuild-app/esbuild/`. (Source: code investigation, 2026-02-16)

### What's the recommended approach for index.html transformations?

> Use the `indexHtmlTransformer` option pointing to a TS/JS file.

### What approaches to esbuild plugin loading have failed or been abandoned?

> Don't recall specific abandoned approaches.

## Tribal Knowledge

### What do users most commonly get wrong when configuring plugins?

> Common mistakes from code analysis: (1) **Parameter count confusion** — string paths give factory `(builderOptions, target)` (2 params) while `{path, options}` gives `(pluginOptions, builderOptions, target)` (3 params). (2) **Putting plugins on dev-server** — dev-server schema only accepts `middlewares`, not `plugins`; plugins go on the build target. (3) **Module format confusion** — `.js` means CJS or ESM depending on package `type` field; users mix extensions in wrong contexts. (4) **Plugin ordering assumptions** — plugins are loaded via `Promise.all` (parallel) but output order matches declaration order. (5) **Default export issues** — `loadModule` unwraps `.default`, so double-wrapping causes problems. (Source: code investigation, 2026-02-16)

### What changes in `@angular/build` between Angular versions have broken this package? What's the upgrade process?

> Internal API moves (imports/exports renamed or moved between @angular packages) and plugin API changes (how Angular's esbuild integration handles plugins).

### Why does the unit-test builder hardcode `runner: 'vitest'`? Was Karma support ever considered?

> This is Angular's choice — Angular's unit-test builder uses Vitest, and this package simply extends it.

## Additional Notes

> N/A
