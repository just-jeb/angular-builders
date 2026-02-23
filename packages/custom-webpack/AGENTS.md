# Custom Webpack

> Angular CLI builders that extend `@angular-devkit/build-angular` (webpack-based) with user-supplied webpack configurations, index HTML transforms, and plugin merging.

## At a Glance

|                  |                                                                                                                                                          |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Type**         | Self-contained Package                                                                                                                                   |
| **Owns**         | `@angular-builders/custom-webpack` -- browser, server, dev-server, karma, and extract-i18n builders with webpack config injection                        |
| **Does NOT own** | The webpack build pipeline itself (delegated to `@angular-devkit/build-angular`), esbuild-based builds                                                   |
| **Lifecycle**    | Maintained as long as Angular supports webpack builders. When Angular drops webpack, this package follows suit. (Source: SME interview, Jeb, 2026-02-16) |
| **Users**        | Angular developers who need custom webpack configuration without ejecting from the CLI                                                                   |

## Navigation

- Parent: [`../AGENTS.md`](../AGENTS.md)
- Related: [`../common/AGENTS.md`](../common/AGENTS.md) -- provides `loadModule` used for config and transform loading
- Related: [`../custom-esbuild/AGENTS.md`](../custom-esbuild/AGENTS.md) -- esbuild counterpart, shares the schema-merging build step

## Entry Points & Contracts

Five builders registered in `builders.json`:

- **`browser`** (`src/browser/index.ts`) -- Wraps `executeBrowserBuilder`.
- **`server`** (`src/server/index.ts`) -- Wraps `executeServerBuilder`.
- **`karma`** (`src/karma/index.ts`) -- Wraps `executeKarmaBuilder`.
- **`extract-i18n`** (`src/extract-i18n/index.ts`) -- Wraps `executeExtractI18nBuilder`.
- **`dev-server`** (`src/dev-server/index.ts`) -- Wraps `executeDevServerBuilder` via `executeBrowserBasedBuilder`.

All builders except `dev-server` follow this pattern:

1. Get custom webpack config options from builder options
2. Call `getTransforms(options, context)` to produce `webpackConfiguration` and `indexHtml` transform functions
3. Pass transforms to Angular's execute function

The `dev-server` and `extract-i18n` builders use `executeBrowserBasedBuilder` -- a higher-order function that resolves the `buildTarget`, retrieves its custom webpack options, and applies transforms.

### Core Architecture

- **`CustomWebpackBuilder.buildWebpackConfig()`** -- The central orchestrator. Loads the user's webpack config (object, promise, or factory function), then either:
  - If factory function: calls it with `(baseConfig, buildOptions, targetOptions)`, returns the result directly (user has full control)
  - If object/promise: merges it with Angular's base config using `mergeConfigs()`

- **`mergeConfigs()`** (`src/webpack-config-merger.ts`) -- Merges two webpack configurations using `webpack-merge` with custom plugin handling.

- **`getTransforms()`** (`src/transform-factories.ts`) -- Produces the `webpackConfiguration` transform (via `CustomWebpackBuilder`) and the `indexHtml` transform (loads user's transform module).

## Schema Merging

This package extends Angular's base builder schemas with custom properties. During build:

1. `tsc` compiles TypeScript
2. `merge-schemes.ts` (repo root) reads `src/schemes.ts` which defines five schema merge operations
3. Each merge takes an Angular base schema (from `@angular-devkit/build-angular`), applies extensions (including the shared `src/schema.ext.json` for browser/server/karma), and writes merged schemas to `dist/*/schema.json`

Unlike `custom-esbuild`, this package resolves schemas directly via Node resolution (no `originalSchemaPackage` needed) because `@angular-devkit/build-angular` exports its schema files.

**Custom schema properties added:** `customWebpackConfig` (path, mergeRules, replaceDuplicatePlugins, verbose), `indexTransform`.

## Invariants

**MUST:** The webpack config merge uses `webpack-merge`'s `mergeWithRules` with `DEFAULT_MERGE_RULES` (in `src/webpack-config-merger.ts`) that match loaders by `test: Match` and `use.loader: Match`, merging `use.options: Merge`. These were hardcoded when migrating from the deprecated `smartStrategy` (webpack-merge v5) to `mergeWithRules` (webpack-merge v6) in commit `5d8194c` (Dec 2020). Changing these defaults breaks builds: removing `test: Match` causes rules with different test patterns to merge incorrectly; removing `use.loader: Match` prevents loader option merging by name, creating duplicate loaders; changing `options: Merge` to `Append` or `Replace` loses Angular's critical defaults. Evidence in `src/webpack-config-merger.spec.ts` line 177. (Source: code investigation, 2026-02-16)

**MUST:** Plugin merging uses lodash `merge` by default (deep merge matching plugins by `constructor.name` string equality). Three methods exist (see `src/webpack-config-merger.ts` lines 26-39): (1) **Default merge** -- plugins of the same class have options deep-merged. (2) **Complete replacement** -- set `replaceDuplicatePlugins: true`; user plugin replaces the matching base plugin entirely. (3) **Factory function** -- bypasses merge entirely, user has full programmatic control. Spec tests at lines 6-33 and 77-118 confirm these behaviors. (Source: code investigation, 2026-02-16)

**MUST NEVER:** Add custom properties to schema extensions without also adding them to the shared `src/schema.ext.json` (for properties shared across browser/server/karma) or the builder-specific `src/{builder}/schema.ext.json`.

**MUST NEVER:** Accidentally clobber Angular's critical webpack plugins during merge -- this breaks builds silently. Duplicate or conflicting loader rules cause subtle compilation issues. These are the two most dangerous merge failure modes. (Source: SME interview, Jeb, 2026-02-16)

## Patterns

**Do:** Use a factory function when you need access to Angular's resolved config, target info, or builder options. Use a static object export for simple, unconditional config additions. (Source: SME interview, Jeb, 2026-02-16)

```js
// webpack.config.js -- factory function approach (recommended for complex cases)
module.exports = (baseConfig, buildOptions, targetOptions) => {
  // Full control -- return a complete config
  baseConfig.plugins.push(new MyPlugin());
  return baseConfig;
};
```

**Do:** Use object export with merge rules for simple additions.

```js
// webpack.config.js -- object approach (auto-merged with Angular's config)
module.exports = {
  plugins: [new MyPlugin()],
  module: { rules: [{ test: /\.csv$/, use: 'csv-loader' }] },
};
```

**Don't:** Mix factory and object approaches in the same file. If you export a function, the merge rules are bypassed entirely -- you own the full config.

**Don't:** Rely on plugin ordering from merge. Plugins from the base config that do NOT appear in the custom config come first, then custom config plugins (with matching base plugins merged or replaced).

## Common Tasks

| Task                  | How                                                                       |
| --------------------- | ------------------------------------------------------------------------- |
| Build the package     | `yarn build` from `packages/custom-webpack`                               |
| Run unit tests        | `yarn test` from `packages/custom-webpack`                                |
| Run E2E schema tests  | `yarn e2e` from `packages/custom-webpack`                                 |
| Run integration tests | `node scripts/run-local-tests.js --package custom-webpack` from repo root |

## Pitfalls

| Trap                                                                 | Reality                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "Plugin merge is straightforward deep merge"                         | Plugins are matched by `constructor.name`. Unmatched base plugins are prepended, matched plugins are lodash-deep-merged (or replaced if `replaceDuplicatePlugins: true`). The ordering is: unmatched-base, then custom (with matches merged in).                                                                                                                                                                                                                                |
| "Exporting a plugin replaces the base plugin"                        | No -- by default, options are quietly deep-merged. Users must set `replaceDuplicatePlugins: true` for actual replacement. Also, `replaceDuplicatePlugins` only affects plugins with matching `constructor.name` in both configs, not all plugins. (Source: code investigation, 2026-02-16)                                                                                                                                                                                      |
| "Plugin constructor defaults are safe"                               | Plugin constructor defaults in the user's `new Plugin({...})` can silently override Angular's settings during the deep merge (README warns about this at line 383). Be explicit about which options you intend to set. (Source: code investigation, 2026-02-16)                                                                                                                                                                                                                 |
| "Multiple instances of the same plugin class merge correctly"        | When both configs have multiple instances of the same class, matching is ambiguous and may clobber data. Avoid duplicate plugin instances across base and custom configs. (Source: code investigation, 2026-02-16)                                                                                                                                                                                                                                                              |
| "The `dev-server` builder reads webpack config from its own options" | No -- `executeBrowserBasedBuilder` resolves the `buildTarget` and reads `customWebpackConfig` from THAT target's options. The dev-server's own options only control dev-server behavior.                                                                                                                                                                                                                                                                                        |
| "`mergeStrategies` still works"                                      | Deprecated since v11. Only `mergeRules` is supported (using `webpack-merge` v6 `mergeWithRules`).                                                                                                                                                                                                                                                                                                                                                                               |
| "The `verbose` option logs the full webpack config"                  | It only logs specific properties listed in `verbose.properties`, to the depth specified by `verbose.serializationDepth`. Angular's base webpack config is enormous.                                                                                                                                                                                                                                                                                                             |
| "`indexTransform` receives just the HTML string"                     | The transform signature is `(target, indexHtml) => string \| Promise<string>` (see `src/transform-factories.ts` lines 32-50). `target` comes first because the most common use case is build-target-specific transformations (dev vs prod config). The README (lines 489-491) calls the first parameter `options`, but what is actually passed is the Architect `Target` object (project, target, configuration), not builder options. (Source: code investigation, 2026-02-16) |

## Testing

```bash
yarn test   # Unit tests (webpack-config-merger, transform-factories, custom-webpack-builder)
yarn e2e    # Schema validation tests
```

Verify: `webpack-config-merger.spec.ts` covers merge rules, plugin replacement, and plugin merging by constructor name.

## Dependencies

**Breaks if changed:** Users' `angular.json` referencing `@angular-builders/custom-webpack:browser`, `:server`, `:dev-server`, `:karma`, `:extract-i18n`
**Breaks us if changed:** `@angular-devkit/build-angular` (builder functions + schema structure), `@angular/build` (`IndexHtmlTransform` type), `@angular-builders/common` (module loading), `webpack-merge`, `lodash`, `@angular-devkit/architect`
