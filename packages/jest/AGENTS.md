# Jest Builder

> Angular CLI builder that replaces Karma with Jest for `ng test`. The primary objective is hiding away the complexity behind Jest setup and the dependencies needed -- it encapsulates jest-preset-angular, handles mocks, handles multi-project setup, etc. (Source: SME interview, Jeb, 2026-02-16)

## At a Glance

|                  |                                                                                                            |
| ---------------- | ---------------------------------------------------------------------------------------------------------- |
| **Type**         | Self-contained Package                                                                                     |
| **Owns**         | `@angular-builders/jest` -- Jest test runner integration with Angular CLI, config resolution, global mocks |
| **Does NOT own** | Jest itself, `jest-preset-angular` internals (though it is a required dependency), application builds      |
| **Users**        | Angular developers who prefer Jest over Karma for unit testing                                             |

## Navigation

- Parent: [`../AGENTS.md`](../AGENTS.md)
- Related: [`../common/AGENTS.md`](../common/AGENTS.md) -- listed dependency (custom config loading uses its own resolution)

## Entry Points & Contracts

- `builders.json` registers: `@angular-builders/jest:run`
- Builder entry: `src/index.ts` -- `runJest(options, context): Observable<BuilderOutput>`
  - **Guarantees:** Builds a merged Jest configuration from four layers (global defaults, project defaults, global custom, project custom), converts builder options to CLI args, runs Jest CLI.
  - **Requires:** Schema options defined in `src/schema.json`. Key options: `config` (custom jest config path or inline JSON), `globalMocks` (array, default `["matchMedia"]`), `zoneless` (boolean, default `true` for Angular 21+).

### Configuration Resolution (4-layer merge)

Handled by `JestConfigurationBuilder`, which merges configs in this order (later overrides earlier):

1. **Global defaults** (`DefaultConfigResolver.resolveGlobal()`) -- `jest-preset-angular` preset, zone setup file, global mocks
2. **Project defaults** (`DefaultConfigResolver.resolveForProject()`) -- `testMatch` pattern scoped to project root, `transform` config for `jest-preset-angular`
3. **Global custom** (`CustomConfigResolver.resolveGlobal()`) -- user's root-level jest config
4. **Project custom** (`CustomConfigResolver.resolveForProject()`) -- user's project-level jest config (e.g., `jest.config.js`)

The merge uses lodash `mergeWith` with special handling: `setupFilesAfterEnv` and `astTransformers` arrays are concatenated (not replaced). All other arrays follow standard lodash merge (index-based). The philosophy: the package's objective is to save users hassle, so if the most common use case is to add something on top of what already works, concatenation is the right default for these arrays. (Source: SME interview, Jeb, 2026-02-16)

## Invariants

**MUST:** Builder-specific options (`config`, `globalMocks`, `zoneless`) are deleted from the options object before converting to Jest CLI args. These are consumed by the configuration builder and must not leak to Jest CLI.

**MUST:** User's jest config must never be silently overwritten by builder defaults. The 4-layer merge exists specifically to ensure user config always takes precedence. (Source: SME interview, Jeb, 2026-02-16)

**MUST:** The `jest-preset-angular` preset must never be dropped during the configuration merge. It is a required dependency that provides Angular-specific transformations. (Source: SME interview, Jeb, 2026-02-16)

**MUST:** The `tsconfig` path in the `jest-preset-angular` transform config is resolved relative to the project root using `getTsConfigPath()`. If the user does not specify a `tsConfig` option, it falls back to `tsconfig.spec.json` in the project.

**MUST NEVER:** Pass inline Jest configuration as a file path. The `config` option supports both file paths (string ending in `.js`/`.ts`/`.mjs`/`.json`) and inline Jest config objects. `CustomConfigResolver` distinguishes between them.

## Patterns

**Do:** Override Jest config at the project level via `jest.config.js` or `jest.config.ts`.

```json
// angular.json
{
  "test": {
    "builder": "@angular-builders/jest:run",
    "options": {
      "config": "jest.config.ts"
    }
  }
}
```

**Do:** Use `zoneless: true` (default for Angular 21+) for new projects. This uses `setup-zoneless.js` which sets up `provideZonelessChangeDetection`. Set `zoneless: false` only if your app uses zone.js change detection.

**Don't:** Specify Jest CLI args that conflict with the builder's config resolution. The builder passes `--config` with the fully merged JSON config. A user-provided `--config` CLI arg would be overwritten.

## Common Tasks

| Task                    | How                                                                            |
| ----------------------- | ------------------------------------------------------------------------------ |
| Build the package       | `yarn build` from `packages/jest`                                              |
| Run unit tests          | `yarn test` from `packages/jest`                                               |
| Run integration tests   | `node scripts/run-local-tests.js --package jest` from repo root                |
| Regenerate schema types | `quicktype -s schema src/schema.json -o src/schema.ts` (automatic in prebuild) |

## Pitfalls

| Trap                                                             | Reality                                                                                                                                                                                                            |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| "`schema.ts` is the source of truth for the schema"              | `schema.json` is the source of truth. `schema.ts` is auto-generated from it via `quicktype` during prebuild. Edit `schema.json`, not `schema.ts`.                                                                  |
| "All array configs are concatenated during merge"                | Only `setupFilesAfterEnv` and `astTransformers` are concatenated. Other arrays use lodash's default index-based merge, which can produce unexpected results for arrays of different lengths.                       |
| "The builder uses `@angular-builders/common` for config loading" | `CustomConfigResolver` uses its own `loadModule` from `@angular-builders/common` only indirectly. It also uses `require()` directly for JSON configs. The 4-layer config merge is entirely custom to this package. |
| "Global mocks include style transforms"                          | Since v21, `globalMocks` defaults to `["matchMedia"]` only. The `styleTransform`, `getComputedStyle`, and `doctype` mocks were removed because Jest 30's jsdom supports them natively.                             |
| "The Jest 29-to-30 upgrade was routine" | It caused significant breakage and required major rework. Major Jest version bumps are a known source of large breaking changes for this package. (Source: SME interview, Jeb, 2026-02-16) |
| "Running Jest programmatically would be better" | The builder runs Jest via CLI (`run(argv)`) because historically there was no convenient way to run it programmatically. Whether this has changed in Jest 30 is unclear. This is a known limitation, not a design choice. (Source: SME interview, Jeb, 2026-02-16) |
| "Test pattern matches all `.spec.ts` files"                      | The default `testMatch` pattern is `/\*_/_(\*.)@(spec                                                                                                                                                              | test).[tj]s?(x)`-- it matches both`spec`and`test` file naming conventions, in both TS and JS. |

## Testing

```bash
yarn test  # Unit tests (jest-configuration-builder, default-config-resolver, custom-config-resolver, options-converter)
```

Verify: `jest-configuration-builder.spec.ts` covers the 4-layer merge. `options-converter.spec.ts` covers CLI arg conversion including arrays, booleans, and `--` passthrough.

## Dependencies

**Breaks if changed:** Users' `angular.json` referencing `@angular-builders/jest:run`
**Breaks us if changed:** `jest` (v30 CLI API), `jest-preset-angular` (v16), `@angular-devkit/architect`, `@angular-devkit/core`, `lodash`
