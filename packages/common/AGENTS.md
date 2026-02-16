# Common

> Shared module-loading and path-resolution utilities consumed by all `@angular-builders/*` packages.

## At a Glance

|                  |                                                                                                                                                                                  |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Type**         | Shared Kernel                                                                                                                                                                    |
| **Owns**         | CJS/ESM/TS module loading with ts-node registration, package path resolution. Scope may grow if common patterns emerge across builders. (Source: SME interview, Jeb, 2026-02-16) |
| **Does NOT own** | Builder logic, schema merging, CLI integration                                                                                                                                   |
| **Users**        | `custom-esbuild`, `custom-webpack`, `jest` (via `workspace:*` dependency)                                                                                                        |

## Navigation

- Parent: [`../AGENTS.md`](../AGENTS.md)
- Related: [`../custom-esbuild/AGENTS.md`](../custom-esbuild/AGENTS.md) -- primary consumer for plugin/transformer loading
- Related: [`../custom-webpack/AGENTS.md`](../custom-webpack/AGENTS.md) -- primary consumer for webpack config loading
- Related: [`../jest/AGENTS.md`](../jest/AGENTS.md) -- does NOT use `loadModule` directly but depends on this package

## Entry Points & Contracts

- `loadModule<T>(modulePath, tsConfig, logger): Promise<T>` -- Loads a user-provided module (plugin, config, transformer) regardless of format.
  - **Guarantees:** Handles four extension cases (see `src/load-module.ts` lines 83-122): `.mjs` (ESM via dynamic import), `.cjs` (CJS via `require`), `.ts` (TypeScript via ts-node, with ESM fallback on `ERR_REQUIRE_ESM`), and a default case for `.js` and all other extensions (try CJS first, fall back to ESM on `ERR_REQUIRE_ESM`). For `.ts` and `.js` files, unwraps default exports: `require(path).default || require(path)`. (Source: code investigation, 2026-02-16)
  - **Does NOT handle:** `.jsx`, `.tsx`, `.mts`, `.cts` extensions. JSON files are not explicitly handled but may work through Node's native `require()`. (Source: code investigation, 2026-02-16)
  - **Requires:** Absolute `modulePath`. A valid `tsConfig` path (used for ts-node registration). An Angular `LoggerApi` instance.

- `resolvePackagePath(packageName, subPath): string` -- Resolves a file path within an installed npm package by locating its `package.json` first.
  - **Guarantees:** Returns the absolute joined path.
  - **Requires:** The package must be installed and resolvable via `require.resolve`.

Enforcement: All user-supplied module loading across the monorepo MUST go through `loadModule`. Direct `require()` or `import()` of user config files bypasses ts-node registration and ESM handling.

## Invariants

**MUST:** ts-node is registered at most once per process. A second call with a different `tsConfig` logs a warning and is silently skipped -- the first registration wins. Registering with the wrong tsconfig first breaks everything. There is a known open issue related to this edge case. (Source: SME interview, Jeb, 2026-02-16)

**MUST NEVER:** Call `loadModule` with a relative path. The caller is responsible for joining `workspaceRoot` with the user-provided relative path before passing it in.

## Patterns

**Do:** Let `loadModule` handle the `default` export unwrapping.

```ts
// loadModule already does `require(path).default || require(path)`
const config = await loadModule<MyType>(absolutePath, tsConfig, logger);
```

**Don't:** Manually unwrap default exports after calling `loadModule` -- you will double-unwrap.

```ts
// WRONG -- loadModule already unwraps .default
const raw = await loadModule<{ default: MyType }>(absolutePath, tsConfig, logger);
const config = raw.default; // undefined if loadModule already unwrapped
```

## Pitfalls

| Trap                                                                 | Reality                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| "I can register ts-node with a different tsconfig for a second file" | ts-node registration is process-global and sticky. The first tsConfig wins; subsequent calls with a different tsConfig are silently ignored with a warning log. `_tsNodeRegister` (lines 5-43) only registers once. (Source: code investigation, 2026-02-16)                                                                                                                                                                                                                                                  |
| "Default export unwrapping is simple"                                | `loadModule` does `require(path).default                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |     | require(path)`for`.ts`and`.js`files (lines 96, 111). If a module exports`{ default: { default: ... } }`, the outer default is unwrapped, returning the inner `{ default: ... }` object -- not the deeply nested value. Users exporting double-wrapped defaults will get unexpected results. (Source: code investigation, 2026-02-16) |
| "ESM loading uses standard `import()`"                               | TypeScript unconditionally downlevels `import()` to `require()`, which cannot load ESM modules. The code uses `new Function('modulePath', 'return import(modulePath)')` to create the import expression at runtime, preventing TypeScript from transforming it. This is the same pattern used by Angular CLI internally. Can be dropped once TypeScript supports preserving dynamic imports (see JSDoc at `src/load-module.ts` lines 57-71). Do not "simplify" this. (Source: code investigation, 2026-02-16) |
| "`resolvePackagePath` is just `path.join`"                           | It resolves from the package's actual installed location (via `require.resolve` on `package.json`), not from the workspace root. This matters when packages are hoisted differently.                                                                                                                                                                                                                                                                                                                          |
| "ESM/CJS interop is straightforward"                                 | ESM/CJS interop has been a significant pain point with multiple abandoned approaches before landing on the current implementation. Do not attempt to "simplify" the loading logic without understanding the full history of failures. (Source: SME interview, Jeb, 2026-02-16)                                                                                                                                                                                                                                |

## Testing

```bash
# No dedicated unit tests -- tested transitively through consumer packages
yarn build  # from packages/common
```

## Dependencies

**Breaks if changed:** `custom-esbuild` (plugin loading), `custom-webpack` (config + transform loading), `jest` (listed dependency but indirect usage)
**Breaks us if changed:** `ts-node`, `tsconfig-paths`, `@angular-devkit/core` (for `logging.LoggerApi` type)
