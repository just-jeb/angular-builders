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

> The DEFAULT_MERGE_RULES in `src/webpack-config-merger.ts` match loaders by `test` (file pattern regex) and `use.loader` (loader name) so the merger can find the exact loader rule to merge options into. This was hardcoded when migrating from the deprecated `smartStrategy` (webpack-merge v5) to `mergeWithRules` (webpack-merge v6) in commit `5d8194c` (Dec 2020). If these defaults change: (1) removing `test: Match` causes rules with different test patterns to merge incorrectly, (2) removing `use.loader: Match` prevents loader option merging by name, creating duplicate loaders, (3) changing `options: Merge` to `Append` or `Replace` loses Angular's critical defaults. Evidence in spec tests at `src/webpack-config-merger.spec.ts` line 177 ("Should merge loader options"). (Source: code investigation, 2026-02-16)

## Patterns

### When should users choose a factory function over an object export for their webpack config?

> Factory function when you need access to Angular's resolved config, target info, or builder options. Static object export for simple, unconditional config additions.

### What's the canonical way to replace an Angular default webpack plugin?

> Three methods (see `src/webpack-config-merger.ts` lines 26-39): (1) **Default merge** — export a plugin of the same class; matched by `constructor.name`, options are deep-merged via lodash `merge()`. Best for surgical changes. (2) **Complete replacement** — set `replaceDuplicatePlugins: true` in angular.json `customWebpackConfig`; user plugin replaces the matching base plugin entirely (no merge). (3) **Factory function** — export a function `(config, options, targetOptions) => config`; bypasses merge entirely, user has full programmatic control. Plugin matching is strictly by `constructor.name` string equality. Spec tests at lines 6-33 ("Should replace plugins") and 77-118 ("Should merge plugins if there are duplicates") confirm these behaviors. (Source: code investigation, 2026-02-16)

### What approaches to webpack config merging have been tried and abandoned (e.g., the old `mergeStrategies`)?

> Had a `mergeStrategies` API that was replaced by the current merge rules approach.

## Tribal Knowledge

### What do users most commonly get wrong about plugin merging behavior?

> From code analysis: (1) **Constructor defaults override** — plugin constructor defaults in user's `new Plugin({...})` can silently override Angular's settings during merge (README warns about this at line 383). (2) **Plugin ordering changes** — unmatched base plugins come first, then custom/merged plugins; users don't expect order changes. (3) **`replaceDuplicatePlugins` scope** — only affects plugins with matching `constructor.name` in both configs, not all plugins. (4) **Merge happens by default** — users export a plugin thinking they're "replacing" it, but options quietly deep-merge instead. (5) **Multiple instances of same plugin class** — when both configs have multiple instances of the same class, matching is ambiguous and may clobber data. (Source: code investigation, 2026-02-16)

### What are the most common issues when upgrading to a new Angular version?

> Same as general packages — internal API moves and schema changes from Angular CLI.

### Why does `indexTransform` receive `(target, indexHtml)` with target first, unlike most Angular transforms?

> From `src/transform-factories.ts` lines 32-50: the transform calls `transform(target, indexHtml)`. The README (lines 489-491, 523-531) documents the signature as `(options: TargetOptions, indexHtmlContent: string) => string | Promise<string>`. Target comes first because the most common use case is build-target-specific transformations (e.g., adding dev vs prod config), making `target` the primary decision-making input. This parallels the webpack config factory pattern where `(config, options, targetOptions)` also groups context parameters. The naming in the README (`options`) is misleading — what's actually passed is the Architect `Target` object (project, target, configuration). (Source: code investigation, 2026-02-16)

## Additional Notes

> N/A
