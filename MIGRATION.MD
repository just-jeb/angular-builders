# Migration from version 21 to version 22

## What's new: automated `ng add` and `ng update`

Version 22 introduces Angular schematics for the builder packages, so you no longer have to wire builders into `angular.json` by hand:

- `ng add @angular-builders/jest` — sets up the Jest builder as your `ng test` runner. Detects an existing Karma, Vitest (Angular 22's new default), or Jest setup and migrates the test target accordingly.
- `ng add @angular-builders/custom-esbuild` / `ng add @angular-builders/custom-webpack` — scaffold the custom build setup.
- `ng update @angular-builders/jest` — runs the version migrations below automatically.

The `ng update` migration window is `(from, to]`, so a project on **any version from 17 through 21 can jump straight to 22** in a single `ng update @angular-builders/jest`. The v21 migration (dep bumps, `Node16` tsconfig, option renames/removals — see the v20→v21 section below) and the v22 advisory both run in order.

## Breaking Changes

### Jest builder: `isolatedModules` now defaults to `true`

`ts-jest` `isolatedModules` now defaults to **`true`** (previously implicitly `false`) for significantly faster compilation. This is a behavior change in the builder itself — it is **not** rewritten into your config.

Impact: a `const enum` shared across files, and type-only re-exports without the `type` modifier, will now error under `isolatedModules`.

- To keep the old behavior, set `isolatedModules: false` in your Jest config.
- Otherwise, fix the call sites: convert `const enum` to a regular `enum` (or `as const`), and use `export type` for type-only re-exports.

`ng update @angular-builders/jest` does **not** change this for you — it runs an advisory migration that warns and lists any `const enum` it finds. The new default is intentional.

### Jest builder: coverage output is now scoped per-project

`coverageDirectory` now defaults to `<projectRoot>/coverage` instead of `./coverage`. In multi-project workspaces this prevents projects from overwriting each other's coverage reports.

Impact: update any CI/tooling that reads a hardcoded `./coverage/` path. The `ng update` advisory migration warns and lists affected projects.

### All builders: TypeScript config & plugin files now load via `jiti` (`ts-node` removed)

`@angular-builders/common` — the loader shared by `custom-esbuild`, `custom-webpack`, and `jest` for your TypeScript config/plugin files (`webpack.config.ts`, esbuild `plugins.ts`, a `.ts` Jest config, etc.) — now uses [`jiti`](https://github.com/unjs/jiti) instead of `ts-node`. `ts-node` and `tsconfig-paths` are no longer dependencies of any `@angular-builders` package.

What changes for you:

- **No build-time type-checking of config/plugin files.** `jiti` transpiles (strips types) rather than type-checking. Your config runs the same, but a type error inside it no longer fails the build. To keep type-checking, run `tsc --noEmit` on those files separately (e.g. in CI).
- **The `NODE_OPTIONS='--loader ts-node/esm'` workaround is gone.** ESM apps previously needed `TS_NODE_PROJECT` / `--loader ts-node/esm` to load `.ts` configs; `jiti` handles ESM/CJS/TS natively, so those npm-script wrappers can be removed.
- **`ts-node` / `tsconfig-paths` can be dropped from `devDependencies`** (unless you use them elsewhere).
- **`ts-node`-specific tsconfig options** (the `"ts-node"` section) no longer apply; path mappings belong in `compilerOptions`.

✅ **Mostly automated.** `ng update @angular-builders/custom-esbuild` / `ng update @angular-builders/custom-webpack` run a migration (the `jest` builder runs the same logic as an advisory) that:

- strips the `NODE_OPTIONS='--loader ts-node/esm'` workaround from your npm scripts,
- removes the `ts-node` / `tsconfig-paths` devDependencies,
- lifts path-mapping options out of the `"ts-node"` tsconfig section into `compilerOptions`.

⚠️ **Manual:** the loss of build-time type-checking is intentional and can't be restored via config — add a `tsc --noEmit` step if you relied on it. Any non-path `"ts-node"` overrides that can't be migrated safely are logged as advisories rather than changed.

## Custom ESBuild builder

- No breaking changes beyond the shared `jiti` loader change above and updating to Angular 22.
- `ng add @angular-builders/custom-esbuild` is now available.

## Custom Webpack builder

- No breaking changes beyond the shared `jiti` loader change above and updating to Angular 22.
- `ng add @angular-builders/custom-webpack` is now available (scaffolds a `webpack.config.js`).

## Angular 22 test runner note (Karma vs Vitest)

Angular 22 unifies test runners under the `@angular/build:unit-test` builder with a `runner` option (`"vitest"` is the default for new apps; `"karma"` is still supported). `@angular-builders/jest` replaces this with its own `:run` target:

- `ng add @angular-builders/jest` detects a Karma, Vitest, or existing Jest setup and rewrites the test target to the Jest builder. For a Vitest project it also fixes `tsconfig.spec.json` types (`vitest` → `jest`) and advises on any `vi.*` usages in your specs.
- Karma is **not removed** in Angular 22 — it's deprecated. Running `ng update @angular/core` to v22 keeps existing Karma users on Karma (Angular rewrites the target to `@angular/build:unit-test` with `runner: "karma"`). Migrating to Jest stays opt-in via `ng add @angular-builders/jest`.

---

# Migration from version 20 to version 21

## Breaking Changes

### Jest Builder: TypeScript Configuration Required

Users of `@angular-builders/jest` must update their `tsconfig.spec.json` to include `module` and `moduleResolution` settings. See the Jest builder section below for details.

## Custom ESBuild builder

- Updated to support Angular 21's `@angular/build` schema changes
- The `buildTarget` and `tsConfig` properties are no longer required in the unit-test builder (matching Angular 21's changes)

## Custom Webpack builder

- No breaking changes (except for updating to Angular 21)

## Jest builder

**Breaking Change:** `jest-preset-angular` has been updated from v14 to v16 to support Angular 21.

### Required Changes

1. **Update Jest to v30** - `jest-preset-angular` v16 requires Jest 30:
   ```bash
   npm install --save-dev jest@^30.0.0 jest-environment-jsdom@^30.0.0 jsdom@^26.0.0
   ```

2. **Update `tsconfig.spec.json`** - Angular 21 uses `moduleResolution: "bundler"` by default, which is incompatible with Jest running in Node.js:
   ```json
   {
     "extends": "./tsconfig.json",
     "compilerOptions": {
       "module": "Node16",
       "moduleResolution": "Node16",
       "isolatedModules": true
     }
   }
   ```

### Builder Schema Changes

The following builder options have been **removed** (Jest 30 no longer supports them):
- `browser` - Removed from Jest 30
- `init` - Removed from Jest 30
- `mapCoverage` - Was deprecated, now removed
- `testURL` - Removed (use `testEnvironmentOptions.url` in jest config instead)
- `timers` - Removed (use `fakeTimers` in jest config instead)

The following builder options have been **renamed**:
- `configPath` → `config` (now also supports inline JSON configuration in addition to file paths)
- `testPathPattern` → `testPathPatterns` (now accepts multiple patterns)

The following **defaults have changed**:
- `testRunner` - Default changed from `jasmine2` to `jest-circus/runner`
- `globalMocks` - Default changed from `["styleTransform", "matchMedia"]` to `["matchMedia"]`. The `styleTransform`, `getComputedStyle`, and `doctype` mocks have been removed as Jest 30's jsdom now supports these natively.
- `zoneless` - New option, defaults to `true` for Angular 21+ zoneless applications. Set to `false` if your app uses zone.js change detection.

For more details, see the [Jest 30 changelog](https://jestjs.io/blog/2024/11/14/jest-30) and [jest-preset-angular v16 changelog](https://github.com/thymikee/jest-preset-angular/blob/main/CHANGELOG.md).

---

# Migration from version 19 to version 20

## Breaking Changes

### Node.js Version Requirements
- **Minimum Node.js version is now 20.19.0** (previously 18.19.1)
- Node.js 18 is no longer supported

### Example Projects: TSLint → ESLint Migration
All example projects have been migrated from the deprecated TSLint to modern ESLint using Angular's official migration tools. If you're using these examples as reference, update your linting setup accordingly by running `ng add @angular-eslint/schematics`.

## Custom ESBuild builder

1. The `forceEsbuild` property has been removed from the dev-server configuration. This property is no longer supported since the builder now uses `@angular/build` directly, which uses esbuild by default.

   **Before:**
   ```json
   "serve": {
     "builder": "@angular-builders/custom-esbuild:dev-server",
     "options": {
       "forceEsbuild": true,
       "port": 5006
     }
   }
   ```

   **After:**
   ```json
   "serve": {
     "builder": "@angular-builders/custom-esbuild:dev-server",
     "options": {
       "port": 5006
     }
   }
   ```

2. **New Feature:** Plugins can now access builder options and target information through factory functions. This is a **non-breaking** enhancement - existing plugins continue to work unchanged.

   **New capability:**
   ```ts
   // esbuild/plugins.ts
   import type { Plugin } from 'esbuild';
   import type { ApplicationBuilderOptions } from '@angular-devkit/build-angular';
   import type { Target } from '@angular-devkit/architect';

   export default (builderOptions: ApplicationBuilderOptions, target: Target): Plugin => {
     return {
       name: 'project-aware-plugin',
       setup(build) {
         // Access current project name
         build.initialOptions.define.PROJECT_NAME = JSON.stringify(target.project);
         
         // Access builder options like outputPath, tsConfig, etc.
         console.log('Building for project:', target.project);
         console.log('Output path:', builderOptions.outputPath);
       },
     };
   };
   ```

   This enables more sophisticated plugins that can adapt their behavior based on the current build target and configuration.

3. **Migration to @angular/build:** The custom-esbuild package now uses `@angular/build` instead of `@angular-devkit/build-angular` for better performance and modern build tooling.

## Custom Webpack builder

- No breaking changes (except for updating to Angular 20)

## Jest builder

- No breaking changes (except for updating to Angular 20)

# Migration from version 18 to version 19

## Custom ESBuild builder

- No breaking changes (except for updating to Angular 19)

## Custom Webpack builder

- No breaking changes (except for updating to Angular 19)

## Jest builder

- No breaking changes (except for updating to Angular 19)

# Migration from version 17 to version 18

## Custom ESBuild builder

- No breaking changes (except for updating to Angular 18)

## Custom Webpack builder

- No breaking changes (except for updating to Angular 18)

## Jest builder

- No breaking changes

# Migration from version 16 to version 17

## Custom Webpack builder

- No breaking changes (except for updating to Angular 17)

## Jest builder

- No breaking changes

# Migration from version 15 to version 16

## Custom Webpack builder

- No breaking changes (except for updating to Angular 16)

## Jest builder

1. Jest 29 is required now, refer to its [CHANGELOG](https://github.com/kulshekhar/ts-jest/blob/main/CHANGELOG.md#2900-2022-09-08) for details.
2. `jest-preset-angular` has been updated to version 13. Make sure you understand the implications and perform all the necessary changes to your code base as described in `jest-preset-angular` [CHANGELOG](https://github.com/thymikee/jest-preset-angular/blob/main/CHANGELOG.md#1300-2023-02-18).
3. Global mocks for `getComputedStyle` and `doctype` are disabled by default, the `jsdom` implementation is used instead. The mocks are still available via the option `globalMocks`.

# Migration from version 14 to version 15

## Custom Webpack builder

- No breaking changes (except for updating to Angular 15)

## Jest builder

- No breaking changes (except for updating to Angular 15)

# Migration from version 13 to version 14

## Custom Webpack builder

- Node 12 is no longer supported

## Jest builder

- Node 12 is no longer supported
- Minimal required version of Jest is 28
- Command line arguments in camelCase are no longer supported, use kebab-case instead
- The default value of `getComputedStyle` global mock is `{}` instead of `{display: 'none', appearance: ['-webkit-appearance']}`
- If you use it with custom configuration, make sure you read [this](https://github.com/thymikee/jest-preset-angular/blob/main/CHANGELOG.md#breaking-changes)

## Bazel builder

- Node 12 is no longer supported

# Migration from version 12 to version 13

## Custom Webpack builder

No breaking changes (except for updating to Angular 13)

## Jest builder

`jest-preset-angular` has been updated to version 11.

- If you use it without custom configuration then no action required.
- If you use it with custom configuration, you might need to [update it](https://thymikee.github.io/jest-preset-angular/docs/next/guides/angular-13+/).

# Migration from version 11 to version 12

## Custom Webpack builder

No breaking changes (except for updating to Angular 12)

## Jest builder (since 12.1.0)

1. Jest 27 is required now
2. `jest-preset-angular` has been updated to version 9, which uses Angular compiler instead of `ts-jest` in order to transform the TS files. Make sure you understand the implications and perform all the necessary changes to your code base as described in `jest-preset-angular` [CHANGELOG](https://github.com/thymikee/jest-preset-angular/blob/master/CHANGELOG.md).

# Migration from version 10 to version 11

## Custom Webpack builder

1. `mergeStrategies` field in `customWebpackConfig` has been deprecated, use `mergeRules` instead as defined [here](https://github.com/survivejs/webpack-merge#mergewithrules).

In order to make this breaking change as backward compatible as possible, the default value of `mergeRules` is the following:

```ts
{
  module: {
    rules: {
      test: "match",
      use: {
        loader: "match",
        options: "merge",
      },
    },
  },
};
```

This is as close as possible to the [`smart` merge strategy](https://github.com/survivejs/webpack-merge/tree/v4.2.2#smart-merging) that was used before, so ideally if you didn't use `mergeStrategies` then your configuration should work just as it worked before.  
Otherwise you'll have to adjust the `mergeRules` in accordance with your needs.  
If you don't want to invest time in learning how the `mergeRules` work or you have a complicated use case then consider using [Custom Webpack Config Function](./packages/custom-webpack#custom-webpack-config-function). This way you'll have full control over the configuration without relying on any merging mechanism.

# Migration from version 9 to version 10

## Jest builder

1. Update to Jest 26 if you still haven't.

# Migration from version 8 to version 9

## All builders

1. `@angular/architect` and `angular/core` are now direct builder dependencies, therefore no need to specify them explicitly in `package.json`

## Jest builder

1. jest-preset-angular version has been updated to 8. If you have any custom Jest configuration, make sure it matches the preset [version](https://github.com/thymikee/jest-preset-angular/releases/tag/v8.0.0).

2. If you're using Ivy (enabled by default in version 9) make sure you run `ngcc` in a `postinstall` hook. For more details refer to [this](https://github.com/just-jeb/angular-builders/issues/679#issuecomment-587525674) issue.

# Migration from version 7 to version 8

## Custom Webpack builder

1. `index.html` is no longer generated with Webpack. This means if your solution uses Webpack to alter `index.html` it will stop working the moment you upgrade to version 8.  
   Instead you should use [`indexTransform`](https://github.com/just-jeb/angular-builders/blob/master/packages/custom-webpack/README.md#index-transform) property.

## Dev-server builder

1. `@angular-builders/dev-server:generic` has been deprecated. Use [`@angular-builders/custom-webpack:dev-server`](https://github.com/just-jeb/angular-builders/tree/master/packages/custom-webpack#Custom-webpack-dev-server) instead.

## Jest builder

1. Update to Jest 24 if you still haven't.
