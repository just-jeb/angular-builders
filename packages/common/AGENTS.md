# Common

> Shared module-loading and path-resolution utilities consumed by all `@angular-builders/*` packages.

## At a Glance

|                  |                                                                              |
| ---------------- | ---------------------------------------------------------------------------- |
| **Type**         | Shared Kernel                                                                |
| **Owns**         | CJS/ESM/TS module loading with ts-node registration, package path resolution |
| **Does NOT own** | Builder logic, schema merging, CLI integration                               |
| **Users**        | `custom-esbuild`, `custom-webpack`, `jest` (via `workspace:*` dependency)    |

## Navigation

- Parent: [`../AGENTS.md`](../AGENTS.md)
- Related: [`../custom-esbuild/AGENTS.md`](../custom-esbuild/AGENTS.md) -- primary consumer for plugin/transformer loading
- Related: [`../custom-webpack/AGENTS.md`](../custom-webpack/AGENTS.md) -- primary consumer for webpack config loading
- Related: [`../jest/AGENTS.md`](../jest/AGENTS.md) -- does NOT use `loadModule` directly but depends on this package

## Entry Points & Contracts

- `loadModule<T>(modulePath, tsConfig, logger): Promise<T>` -- Loads a user-provided module (plugin, config, transformer) regardless of format.
  - **Guarantees:** Handles `.mjs`, `.cjs`, `.ts`, and `.js` extensions. For `.ts` files, registers ts-node lazily. For ambiguous `.js` files, tries CJS first then ESM fallback.
  - **Requires:** Absolute `modulePath`. A valid `tsConfig` path (used for ts-node registration). An Angular `LoggerApi` instance.

- `resolvePackagePath(packageName, subPath): string` -- Resolves a file path within an installed npm package by locating its `package.json` first.
  - **Guarantees:** Returns the absolute joined path.
  - **Requires:** The package must be installed and resolvable via `require.resolve`.

Enforcement: All user-supplied module loading across the monorepo MUST go through `loadModule`. Direct `require()` or `import()` of user config files bypasses ts-node registration and ESM handling.

## Invariants

**MUST:** ts-node is registered at most once per process. A second call with a different `tsConfig` logs a warning and is silently skipped -- the first registration wins.

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

| Trap                                                                 | Reality                                                                                                                                                                              |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| "I can register ts-node with a different tsconfig for a second file" | ts-node registration is process-global and sticky. The first tsConfig wins; subsequent calls with a different tsConfig are silently ignored with a warning log.                      |
| "ESM loading uses standard `import()`"                               | TypeScript unconditionally downlevels `import()` to `require()`. The code uses `new Function('modulePath', 'return import(modulePath)')` as a workaround. Do not "simplify" this.    |
| "`resolvePackagePath` is just `path.join`"                           | It resolves from the package's actual installed location (via `require.resolve` on `package.json`), not from the workspace root. This matters when packages are hoisted differently. |

## Testing

```bash
# No dedicated unit tests -- tested transitively through consumer packages
yarn build  # from packages/common
```

## Dependencies

**Breaks if changed:** `custom-esbuild` (plugin loading), `custom-webpack` (config + transform loading), `jest` (listed dependency but indirect usage)
**Breaks us if changed:** `ts-node`, `tsconfig-paths`, `@angular-devkit/core` (for `logging.LoggerApi` type)
