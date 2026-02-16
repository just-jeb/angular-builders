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

**MUST:** The dev-server builder MUST call `patchBuilderContext` before delegating. Without this, Angular CLI detects a non-`@angular/build:application` builder name and falls back to the Webpack dev server instead of Vite.

**MUST NEVER:** Pass `plugins` or `indexHtmlTransformer` options through to Angular's builder. These are custom-esbuild-only options that must be consumed and removed before delegation. The dev-server's `patchBuilderContext` handles cleanup via `cleanBuildTargetOptions`.

## Patterns

**Do:** Plugins can be plain objects, arrays, or factory functions. Factories receive `(builderOptions, target)`.

```ts
// Plugin as factory function -- gets access to builder options and target
export default (options: ApplicationBuilderOptions, target: Target): Plugin => ({
  name: 'my-plugin',
  setup(build) {
    console.log(`Building ${target.project}`);
  },
});
```

```ts
// Plugin with options via {path, options} config
// angular.json: { "plugins": [{ "path": "./my-plugin.js", "options": { "key": "val" } }] }
// Plugin file receives: (pluginOptions, builderOptions, target)
export default (pluginOptions, builderOptions, target): Plugin => ({ ... });
```

**Don't:** Export an async factory that returns a Promise of plugins -- `loadPlugins` already `await`s the module load but does not await the factory return for the `{path, options}` form.

## Common Tasks

| Task                  | How                                                                                                                        |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Build the package     | `yarn build` from `packages/custom-esbuild`                                                                                |
| Run unit tests        | `yarn test` from `packages/custom-esbuild`                                                                                 |
| Run E2E schema tests  | `yarn e2e` from `packages/custom-esbuild`                                                                                  |
| Run integration tests | See `tests/integration.js` -- executed via CI or `node scripts/run-local-tests.js --package custom-esbuild` from repo root |

## Pitfalls

| Trap                                          | Reality                                                                                                                                                                                                                            |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "The dev-server is just a passthrough"        | It patches `context.getBuilderNameForTarget` to map `@angular-builders/custom-esbuild` to `@angular/build:application`. Without this, Angular falls back to the Webpack dev server. See `src/dev-server/patch-builder-context.ts`. |
| "The dev-server reads its own plugins config" | No -- it reads plugins from the **build target's** options. The dev-server config only has `middlewares`.                                                                                                                          |
| "Unit-test builder supports Karma"            | No -- it hardcodes `runner: 'vitest'`. This is Angular's design choice -- Angular's own unit-test builder uses Vitest, and this package simply extends it. (Source: SME interview, Jeb, 2026-02-16)                                |
| "`src/schemes.ts` resolves schemas normally"  | It uses `originalSchemaPackage` + `resolvePackagePath` to bypass `@angular/build`'s `exports` field in package.json, which does not expose internal schema files.                                                                  |
| "Schema extension uses deep merge"            | `__REPLACE__` prefix in arrays triggers full replacement instead of merge. `__DELETE__` string value removes a property entirely. These are NOT standard lodash merge behaviors -- they are handled by `merge-schemes.ts`.         |

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
