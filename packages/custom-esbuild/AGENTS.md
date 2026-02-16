# Custom ESBuild

> Angular CLI builders that extend `@angular/build` (esbuild-based) with user-supplied esbuild plugins, index HTML transformers, and dev-server middleware.

## At a Glance

|                  |                                                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Type**         | Self-contained Package                                                                                              |
| **Owns**         | `@angular-builders/custom-esbuild` -- application, dev-server, and unit-test builders with esbuild plugin injection |
| **Does NOT own** | The esbuild build pipeline itself (delegated to `@angular/build`), webpack-based builds, Jest test execution        |
| **Users**        | Angular developers who need custom esbuild plugins or index.html transformations in their build                     |

## Navigation

- Parent: [`../AGENTS.md`](../AGENTS.md)
- Related: [`../common/AGENTS.md`](../common/AGENTS.md) -- provides `loadModule` used for plugin and transformer loading
- Related: [`../custom-webpack/AGENTS.md`](../custom-webpack/AGENTS.md) -- webpack counterpart, shares the schema-merging build step. The goal is feature parity (index transforms, etc.) but the extension model is fundamentally different -- esbuild uses plugins while webpack uses config merging. (Source: SME interview, Jeb, 2026-02-16)

## Entry Points & Contracts

Three builders registered in `builders.json`:

- **`application`** (`src/application/index.ts`) -- Wraps `@angular/build:application`.
  - **Guarantees:** Loads user esbuild plugins and optional `indexHtmlTransformer`, passes them as extensions to Angular's `buildApplication`.
  - **Requires:** Standard Angular application options plus optional `plugins` (array of plugin paths or `{path, options}` objects) and `indexHtmlTransformer` (path to transformer module).

- **`dev-server`** (`src/dev-server/index.ts`) -- Wraps `@angular/build:dev-server`.
  - **Guarantees:** Loads plugins from the referenced build target, loads optional `middlewares`, patches the builder context so Angular uses the Vite dev server (not Webpack's).
  - **Requires:** `buildTarget` pointing to a `custom-esbuild:application` target. Optional `middlewares` array of module paths.

- **`unit-test`** (`src/unit-test/index.ts`) -- Wraps `@angular/build:unit-test`.
  - **Guarantees:** Loads plugins from the referenced build target, forces `runner: 'vitest'`.
  - **Requires:** `buildTarget` pointing to a `custom-esbuild:application` target.

## Schema Merging

This package extends Angular's base builder schemas with custom properties. During build:

1. `tsc` compiles TypeScript
2. `merge-schemes.ts` (repo root) reads `src/schemes.ts` which defines three schema merge operations
3. Each merge takes an Angular base schema (from `@angular/build`), applies extensions from `src/*/schema.ext.json`, and writes the merged schema to `dist/*/schema.json`

The `src/schemes.ts` file uses `originalSchemaPackage` to resolve `@angular/build`'s internal schema paths (bypassing Node's export map). See root AGENTS.md for the merge mechanism details.

**When updating to a new Angular version:** Check if base schema properties changed in `@angular/build`. The extension schemas use `__REPLACE__` array prefix for full replacement and `__DELETE__` string value for property removal.

## Invariants

**MUST:** Always delegate to `@angular/build` functions (`buildApplication`, `executeDevServerBuilder`, `executeUnitTestBuilder`) -- never reimplement their logic.

**MUST:** The dev-server builder MUST call `patchBuilderContext` before delegating. The patch serves two critical functions: (1) **Server selection** -- remaps `@angular-builders/custom-esbuild:application` to `@angular/build:application` via `context.getBuilderNameForTarget()`, so Angular uses the Vite dev server instead of falling back to Webpack. (2) **Option stripping** -- intercepts `context.getTargetOptions()` to remove `plugins` and `indexHtmlTransformer` before Angular's builder receives them, preventing schema validation failures. Without this patch, `ng serve` uses the wrong server and/or fails validation. (Source: code investigation, 2026-02-16)

**MUST NEVER:** Pass `plugins` or `indexHtmlTransformer` options through to Angular's builder. These are custom-esbuild-only options that must be consumed and removed before delegation. The application builder passes them as separate `extensions` to `buildApplication()` (see `src/application/index.ts`). The dev-server strips them via `cleanBuildTargetOptions()` in `src/dev-server/patch-builder-context.ts`, which does `delete options.plugins; delete options.indexHtmlTransformer`. Without stripping, Angular's schema validation rejects the unknown properties. (Source: code investigation, 2026-02-16)

## Patterns

Three plugin patterns are supported (see `src/load-plugins.ts`): (Source: code investigation, 2026-02-16)

**Do:** Use a factory function (recommended) -- export a function from a plain string plugin path.

```ts
// Pattern 1: Factory function (string path in angular.json "plugins" array)
// Receives 2 params: (builderOptions, target)
export default (options: ApplicationBuilderOptions, target: Target): Plugin => ({
  name: 'my-plugin',
  setup(build) {
    console.log(`Building ${target.project}`);
  },
});
```

**Do:** Use a factory with custom options via `{path, options}` config object.

```ts
// Pattern 2: Factory with custom options ({path, options} in angular.json)
// angular.json: { "plugins": [{ "path": "./my-plugin.js", "options": { "key": "val" } }] }
// Receives 3 params: (pluginOptions, builderOptions, target)
export default (pluginOptions, builderOptions, target): Plugin => ({ ... });
```

**Do:** Export a static plugin object directly when no builder options access is needed.

```ts
// Pattern 3: Static plugin (no factory, no builder options access)
export default { name: 'my-static-plugin', setup(build) { ... } };
```

**Don't:** Export an async factory that returns a Promise of plugins -- `loadPlugins` already `await`s the module load but does not await the factory return for the `{path, options}` form.

**Don't:** Confuse parameter counts -- string paths give factories 2 params `(builderOptions, target)`, while `{path, options}` objects give factories 3 params `(pluginOptions, builderOptions, target)`. (Source: code investigation, 2026-02-16)

## Common Tasks

| Task                  | How                                                                                                                        |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Build the package     | `yarn build` from `packages/custom-esbuild`                                                                                |
| Run unit tests        | `yarn test` from `packages/custom-esbuild`                                                                                 |
| Run E2E schema tests  | `yarn e2e` from `packages/custom-esbuild`                                                                                  |
| Run integration tests | See `tests/integration.js` -- executed via CI or `node scripts/run-local-tests.js --package custom-esbuild` from repo root |

## Pitfalls

| Trap                                          | Reality                                                                                                                                                                                                                             |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "The dev-server is just a passthrough"        | It patches `context.getBuilderNameForTarget` to map `@angular-builders/custom-esbuild` to `@angular/build:application`. Without this, Angular falls back to the Webpack dev server. See `src/dev-server/patch-builder-context.ts`.  |
| "The dev-server reads its own plugins config" | No -- it reads plugins from the **build target's** options. The dev-server config only has `middlewares`.                                                                                                                           |
| "Unit-test builder supports Karma"            | No -- it hardcodes `runner: 'vitest'`. This is Angular's design choice -- Angular's own unit-test builder uses Vitest, and this package simply extends it. (Source: SME interview, Jeb, 2026-02-16)                                 |
| "`src/schemes.ts` resolves schemas normally"  | It uses `originalSchemaPackage` + `resolvePackagePath` to bypass `@angular/build`'s `exports` field in package.json, which does not expose internal schema files.                                                                   |
| "Schema extension uses deep merge"            | `__REPLACE__` prefix in arrays triggers full replacement instead of merge. `__DELETE__` string value removes a property entirely. These are NOT standard lodash merge behaviors -- they are handled by `merge-schemes.ts`.          |
| "Plugins go on the dev-server target"         | Dev-server schema only accepts `middlewares`, not `plugins`. Plugins must be configured on the application build target. The dev-server reads plugins from the build target it references. (Source: code investigation, 2026-02-16) |
| "Plugin loading order is unpredictable"       | Plugins are loaded via `Promise.all` (parallel resolution) but output order matches declaration order in angular.json's `plugins` array. (Source: code investigation, 2026-02-16)                                                   |
| "`.js` plugins are always CJS"                | `.js` means CJS or ESM depending on the package's `type` field. Users mixing extensions in wrong contexts is a common source of errors. Use `.cjs`/`.mjs` for explicit format. (Source: code investigation, 2026-02-16)             |

## Testing

```bash
yarn test   # Unit tests (from package dir)
yarn e2e    # Schema validation E2E tests
```

Verify: Unit tests check plugin loading for string paths, `{path, options}` objects, and factory functions. E2E tests validate merged schemas.

## Dependencies

**Breaks if changed:** Users' `angular.json` referencing `@angular-builders/custom-esbuild:application`, `:dev-server`, or `:unit-test`
**Breaks us if changed:** `@angular/build` (builder functions + schema structure), `@angular-builders/common` (module loading), `esbuild` (Plugin type), `@angular-devkit/architect`

The most common breakages from Angular upgrades are internal API moves (imports/exports renamed or moved between `@angular` packages) and plugin API changes (how Angular's esbuild integration handles plugins). (Source: SME interview, Jeb, 2026-02-16)
