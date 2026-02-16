# Packages

> All published `@angular-builders/*` npm packages. Each package is an Angular CLI builder that extends or replaces standard Angular build/test tooling.

## At a Glance

|                  |                                                                                                                   |
| ---------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Type**         | Architectural Layer                                                                                               |
| **Owns**         | The six published packages that compose this monorepo's deliverables                                              |
| **Does NOT own** | Example apps (see `../examples/`), CI scripts (see `../scripts/`), build orchestration (Turbo/Lerna at repo root) |
| **Users**        | Package maintainers, contributors                                                                                 |

## Navigation

- Parent: [`../AGENTS.md`](../AGENTS.md)
- Children:
  - [`common/AGENTS.md`](common/AGENTS.md) -- Shared module-loading utilities (Shared Kernel)
  - [`custom-esbuild/AGENTS.md`](custom-esbuild/AGENTS.md) -- ESBuild-based builders extending `@angular/build`
  - [`custom-webpack/AGENTS.md`](custom-webpack/AGENTS.md) -- Webpack-based builders extending `@angular-devkit/build-angular`
  - [`jest/AGENTS.md`](jest/AGENTS.md) -- Jest test runner replacing Karma
  - [`bazel/AGENTS.md`](bazel/AGENTS.md) -- Bazel execution wrapper
  - [`timestamp/AGENTS.md`](timestamp/AGENTS.md) -- Build-time timestamp file writer
- Related: [`../examples/AGENTS.md`](../examples/AGENTS.md) -- Integration test fixtures for these packages

## Package Dependency Graph

```
custom-esbuild ──> common
custom-webpack ──> common
jest ──────────> common
bazel            (standalone)
timestamp        (standalone)
```

All packages depend on `@angular-devkit/architect` for the builder contract. `custom-esbuild` uses `@angular/build`, while `custom-webpack` uses `@angular-devkit/build-angular`. These are different Angular build systems and must not be confused.

## Builder Pattern

Every package follows the Angular Architect builder pattern:

1. Export a function matching `(options: SchemaType, context: BuilderContext) => Observable<BuilderOutput> | Promise<BuilderOutput>`
2. Wrap it with `createBuilder()` as the default export
3. Register it in `builders.json` with implementation path and schema path
4. Schema is either hand-authored (`schema.json`) or merged from Angular base schemas at build time

## Invariants

**MUST:** All packages use independent versioning (`"version": "independent"` in `lerna.json`). Major versions are aligned to Angular (e.g., v21.x for Angular 21), but patches and minors are released independently per package since they have different change cadences. (Source: SME interview, Jeb, 2026-02-16)

**MUST:** All packages publish under the `@angular-builders` npm scope with `"access": "public"`.

**MUST:** Packages that extend Angular builder schemas (`custom-esbuild`, `custom-webpack`) MUST run `merge-schemes.ts` during their build step. The build script sequence is: `clean -> tsc -> merge-schemes -> test -> e2e`.

**MUST NEVER:** Import from one builder package to another (e.g., `custom-esbuild` must not import from `custom-webpack`). Cross-package code sharing goes through `common`.

## Common Tasks

| Task                                | How                                                               |
| ----------------------------------- | ----------------------------------------------------------------- |
| Build all packages                  | `yarn build:packages:all` from repo root                          |
| Build affected packages (vs master) | `yarn build:packages` from repo root                              |
| Build a single package              | `yarn build` from the package directory                           |
| Run all integration tests           | `yarn test:local` from repo root                                  |
| Run tests for one package           | `node scripts/run-local-tests.js --package <name>` from repo root |
| Update package README               | Edit `packages/{name}/README.md` when adding/changing builder options or Angular prerequisites. READMEs are the npm page content (install steps, config examples, option docs) |

## Angular Version Alignment

All packages track the same Angular major version. The `scripts/update-package.js` utility updates Angular dependency version ranges across all packages. Version ranges follow a pattern:

- Stable packages (`@angular-devkit/build-angular`, `@angular/build`, etc.): `^{major}.0.0`
- Pre-release packages (`@angular-devkit/architect`): `>=0.{major}00.0 < 0.{major+1}00.0`

## Pitfalls

| Trap                                                        | Reality                                                                                                                                                                                                                                  |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "`custom-esbuild` and `custom-webpack` are interchangeable" | They wrap completely different Angular build systems. `custom-esbuild` wraps `@angular/build` (Vite/esbuild). `custom-webpack` wraps `@angular-devkit/build-angular` (Webpack). They share only `common` and the schema-merge mechanism. |
| "All packages have the same build script"                   | `custom-esbuild` and `custom-webpack` have an extra `merge-schemes.ts` step. `jest`, `bazel`, and `timestamp` use `quicktype` for schema generation. `common` has neither.                                                               |
| "Turbo handles test execution"                              | Turbo only handles the `build` task. Testing is handled by Jest (unit tests) and the custom `scripts/run-local-tests.js` (integration tests).                                                                                            |
| "New packages are planned proactively" | New packages are demand-driven -- added only if there is significant community demand. No current plans for new packages. (Source: SME interview, Jeb, 2026-02-16) |
| "Publishing always works smoothly" | Historical incidents include: npm token/auth issues in CI, version conflicts and tag issues, and on two separate occasions a package was published without a `dist` folder (for different reasons each time). Always verify `dist/` exists before publish. (Source: SME interview, Jeb, 2026-02-16) |
| "CHANGELOGs are manually maintained" | They are fully auto-generated by Lerna-Lite from conventional commits during publish. Never edit them. |
