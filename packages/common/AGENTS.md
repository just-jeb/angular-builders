# Common

> Shared module-loading and path-resolution utilities consumed by all `@angular-builders/*` packages.

## At a Glance

|                  |                                                                                                                                                                 |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Type**         | Shared Kernel                                                                                                                                                   |
| **Owns**         | CJS/ESM/TS module loading via jiti, package path resolution. Scope may grow if common patterns emerge across builders. (Source: SME interview, Jeb, 2026-02-16) |
| **Does NOT own** | Builder logic, schema merging, CLI integration                                                                                                                  |
| **Users**        | `custom-esbuild`, `custom-webpack`, `jest` (via `workspace:*` dependency)                                                                                       |

## Navigation

- Parent: [`../AGENTS.md`](../AGENTS.md)
- Related: [`../custom-esbuild/AGENTS.md`](../custom-esbuild/AGENTS.md) -- primary consumer for plugin/transformer loading
- Related: [`../custom-webpack/AGENTS.md`](../custom-webpack/AGENTS.md) -- primary consumer for webpack config loading
- Related: [`../jest/AGENTS.md`](../jest/AGENTS.md) -- does NOT use `loadModule` directly but depends on this package

## Entry Points & Contracts

- `loadModule<T>(modulePath, tsConfig, logger): Promise<T>` -- Loads a user-provided module (plugin, config, transformer) regardless of format.
  - **Guarantees:** Loads `.ts`, `.mts`, `.cts`, `.js`, `.mjs`, and `.cjs` uniformly via [jiti](https://github.com/unjs/jiti) (`jiti.import`). TypeScript is **transpiled, not type-checked**. Default exports are unwrapped via jiti's `interopDefault` (`mod.default ?? mod`): a single default is returned; a nested `{ default: ... }` is preserved. TypeScript path aliases (`baseUrl`/`paths`) are resolved from the passed `tsConfig`. (Source: code investigation, 2026-06-07)
  - **Does NOT handle:** `.jsx`/`.tsx`. Build-time type-checking (run `tsc --noEmit` separately). (Source: code investigation, 2026-06-07)
  - **Requires:** Absolute `modulePath`. A `tsConfig` path (used for path-alias resolution). An Angular `LoggerApi` instance (retained for API compatibility; currently unused). (Source: code investigation, 2026-06-07)

- `resolvePackagePath(packageName, subPath): string` -- Resolves a file path within an installed npm package by locating its `package.json` first.
  - **Guarantees:** Returns the absolute joined path.
  - **Requires:** The package must be installed and resolvable via `require.resolve`.

Enforcement: All user-supplied module loading across the monorepo MUST go through `loadModule`. Direct `require()` or `import()` of user config files bypasses jiti's TypeScript transpilation and ESM/CJS interop.

## Invariants

**MUST:** Each distinct `tsConfig` gets its own isolated jiti instance (cached by tsconfig path). Loads with different tsconfigs do not interfere -- there is no process-global "first tsconfig wins" registration (the old ts-node limitation, now removed). (Source: code investigation, 2026-06-07)

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

| Trap                                                            | Reality                                                                                                                                                                                                                                                                                                                                                                                                          |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "I can pin ts-node compiler options / one tsconfig per process" | There is no ts-node anymore. Loading is via jiti with one isolated instance per `tsConfig` (cached by path), so different configs/transforms resolve against their own tsconfig. (Source: code investigation, 2026-06-07)                                                                                                                                                                                        |
| "Default export unwrapping is simple"                           | `loadModule` returns `mod.default ?? mod` over jiti's `interopDefault` result. A single default export is unwrapped; a nested `{ default: ... }` is preserved (covered by `load-module.spec.ts`). Double-wrapped defaults still yield the inner object, not the deepest value. (Source: code investigation, 2026-06-07)                                                                                          |
| "jiti's `tsconfigPaths` option honors any tsconfig path"        | It does not -- jiti/`get-tsconfig` treats the path as a search location and only loads a file literally named `tsconfig.json`, walking up otherwise. Build targets use names like `tsconfig.app.json`, so `loadModule` parses the exact `tsConfig` via `get-tsconfig`'s `parseTsconfig` and builds jiti's `alias` map itself. Do not switch to `tsconfigPaths: <path>`. (Source: code investigation, 2026-06-07) |
| "`resolvePackagePath` is just `path.join`"                      | It resolves from the package's actual installed location (via `require.resolve` on `package.json`), not from the workspace root. This matters when packages are hoisted differently.                                                                                                                                                                                                                             |
| "ESM/CJS interop is straightforward"                            | ESM/CJS interop has been a significant pain point with multiple abandoned approaches before landing on the current implementation. Do not attempt to "simplify" the loading logic without understanding the full history of failures. (Source: SME interview, Jeb, 2026-02-16)                                                                                                                                   |

## Testing

```bash
# Loader unit tests (all module formats + #816/#2025 regressions):
npx jest --config jest-ut.config.js packages/common/src/load-module.spec.ts
yarn build  # from packages/common
```

## Dependencies

**Breaks if changed:** `custom-esbuild` (plugin loading), `custom-webpack` (config + transform loading), `jest` (listed dependency but indirect usage)
**Breaks us if changed:** `jiti` (module loading + TS transform), `get-tsconfig` (tsconfig path-alias parsing), `@angular-devkit/core` (for `logging.LoggerApi` type)
