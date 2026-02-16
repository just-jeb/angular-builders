---
type: sme-interview
repository: angular-builders
area: packages/jest
created: 2026-02-16
status: complete
last_merged: 2026-02-16
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

> Four iterations found in git history: (1) **Pre-v16** — `import 'jest-preset-angular'` plus global mocks. (2) **v16-v18** — switched to `import 'jest-preset-angular/setup-jest'`. (3) **v19-v20** — explicit `setupZoneTestEnv()` from `jest-preset-angular/setup-env/zone`, always zone-based. (4) **v21+** — split into `setup-zoneless.ts` and `setup-zone.ts` to support Angular 21's zoneless default. The zoneless/zone split was driven by Angular's shift to zoneless as the default change detection strategy. Users upgrading to v21 must set `zoneless: false` if their app still uses zone.js. (Source: code investigation, 2026-02-16)

## Tribal Knowledge

### What do users most commonly get wrong when migrating from Karma to this Jest builder?

> Common mistakes from code analysis: (1) Not updating `tsconfig.spec.json` — forgetting to replace `jasmine` with `jest` in `types` array and remove Karma-specific `test.ts` from `files`. (2) Zone.js confusion post-v21 — not setting `zoneless: false` when app still uses zone.js (the default changed to `true`). (3) Configuration merge misunderstanding — not realizing `setupFilesAfterEnv` and `astTransformers` are concatenated (not replaced) during the 4-layer config merge. (4) Mock changes — expecting old mocks (`styleTransform`, `getComputedStyle`, `doctype`) that were removed in v21. (5) `resetMocks` breaking matchMedia — issue #1983, fixed by using regular function instead of `jest.fn().mockImplementation()`. (6) Not removing Karma deps and config files during migration. (Source: code investigation, 2026-02-16)

### What broke during the Jest 29 to Jest 30 upgrade? What lessons were learned?

> Major breakage — significant breaking changes required major rework.

### Why was the `zoneless` option added and defaulted to `true`? What user confusion does this cause?

> Angular is moving toward zoneless, so the builder followed suit to match the ecosystem direction.

### What global mocks have been removed over time, and why?

> Removed in v21: `styleTransform` (jsdom missing `transform` on `document.body.style`), `getComputedStyle` (missing browser API), and `doctype` (missing document DOCTYPE) — all removed because Jest 30's jsdom supports them natively. Removed earlier (v20): `localStorage` and `sessionStorage` — Jest's jsdom already provides these. Only `matchMedia` remains in v21+ (jsdom still lacks native support). The matchMedia mock was also fixed to survive Jest's `resetMocks` option by switching from `jest.fn().mockImplementation()` to a regular function. Historical progression: pre-v16 had 6+ mocks, v16-v20 had 4, v21+ has only `matchMedia`. (Source: code investigation, 2026-02-16)

## Additional Notes

> N/A
