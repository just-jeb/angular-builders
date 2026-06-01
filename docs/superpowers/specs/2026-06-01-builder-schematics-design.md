# Builder Schematics: `ng add` + `ng update` for angular-builders (v22)

**Status:** Design approved (2026-06-01) — pending spec review → implementation plan
**Scope:** `@angular-builders/jest`, `@angular-builders/custom-esbuild`, `@angular-builders/custom-webpack`
**Target:** Ships with the v22 major; built against the Angular 22 RC so it's ready when 22 lands.

## 1. Goal & Motivation

Give every "real" builder a first-class install and upgrade experience:

- **`ng add @angular-builders/<builder>`** wires the builder into the user's workspace correctly and automatically.
- **`ng update @angular-builders/<builder>`** migrates a user's project across Angular majors (v17→v22) for the (few) transitions that actually changed user-facing config.

This is delivered as **one cohesive feature** (not per-builder PRs) introduced with the v22 major, so upgraders get migrations via `ng update`.

`bazel` and `timestamp` are out of scope — they are thin wrappers with little to scaffold or migrate.

## 2. Guiding Principles

1. **Auto-detect over ask.** Never prompt for anything we can determine by inspecting the workspace (existing builders, polyfills, config files, dependencies). Prompts are reserved only for genuinely undeterminable intent — and the design currently has **none**. Explicit overrides are exposed as flags (`--project`, `--unit-test`), not prompts.
2. **`ng add` may prompt; migrations may not.** `ng add` is foreground/interactive (`x-prompt` works). `ng update` migrations run **headless** under Renovate/Dependabot/CI — they must use safe, detected defaults and communicate via `context.logger` advisories, never block. (Source: angular-cli #23205; the optional-migration selection prompt is CLI-level, not `x-prompt`.)
3. **Tree-based, utility-backed edits.** Use `@schematics/angular/utility` (`updateWorkspace`/`readWorkspace`, `addDependency` + `NodeDependencyType`, `JSONFile`) — never hand-parse JSON or touch `fs`. Preserves `--dry-run`, transactionality, and formatting.
4. **Idempotent.** Both `ng add` and migrations must be safe to re-run and tolerate partially-migrated workspaces (multiple migrations run back-to-back on a multi-major jump).
5. **Shared logic lives in `common`.** The no-cross-import invariant means shared schematic code goes in `@angular-builders/common`; per-package schematics are thin and delegate to it.

## 3. Architecture

Three layers:

### 3.1 Shared core — `@angular-builders/common/schematics`

Exposed under a subpath separate from the runtime `loadModule` exports. Contains:

- **Rule-builder factories** (composable `Rule`s):
  - `setBuilderForTarget(project, targetName, builderName, options?)` — rewrite a target's `builder` field via `updateWorkspace`, preserving existing options.
  - `addBuilderDevDependency(name, version, { install })` — wrap `addDependency` with `NodeDependencyType.Dev`.
  - `removeDevDependencies(names[])`, `removeFilesIfPresent(paths[])` — guarded cleanup.
  - `editJsonFile(path, mutator)` — thin wrapper over `JSONFile` for `tsconfig.spec.json` etc.
- **Detection helpers:**
  - `getProjectsToTarget(tree, optionProject?)` — single project → it; multi + `defaultProject` → default; multi + explicit `--project` → that; multi + none → **all** projects.
  - `detectTestBuilder(workspace, project)` → `'karma' | 'jest' | 'vitest' | 'other' | 'none'`.
  - `isZoneless(tree, project)` — zone.js absent from build `polyfills` and/or `provideZonelessChangeDetection` present in bootstrap → zoneless.
- **Version helpers:** `parseVersion`, `isAtLeast(major)`.
- **`SchematicTestHarness`** — builds a realistic workspace tree (via `@schematics/angular` `workspace`+`application`) for unit tests.

Dependencies added to `common`: `@schematics/angular` + `@angular-devkit/schematics` (the latter is already transitive). Used **only** by the schematics subpath, not by builder runtime.

### 3.2 Per-package `ng-add` (thin)

Each package: `src/schematics/collection.json` + `ng-add/{index.ts,schema.json}`. `index.ts` is a `chain([...])` of shared rules + builder-specific bits (~40 LOC). `schema.json` exposes only `--project` (+ `--unit-test` for esbuild) with sensible defaults; **no `x-prompt`**.

### 3.3 Per-package migrations

Each package that needs them: `src/schematics/migrations.json` + `migrations/<vN>/index.ts`. Migration **logic stays per-package** (a builder's breaking-change history is its own); only shared **helpers** come from `common`. `version` fields are valid semver thresholds; `ng update` runs every migration where `installedVersion < version <= targetVersion`.

## 4. Per-Builder Behavior

### 4.1 `jest`

**Why installed:** replace Karma with Jest for `ng test`.

**`ng add` (all auto-detected, zero prompts):**

- Add jest stack to devDeps (`jest`, `jest-preset-angular`, `jest-environment-jsdom`); rewrite `test` target → `@angular-builders/jest:run`; schedule install.
- **If Karma detected** (`test` builder is `:karma`, or `karma.conf.*` present, or karma/jasmine in devDeps): remove karma/jasmine devDeps, delete `karma.conf.js` + `src/test.ts`, fix `tsconfig.spec.json` (`types` jasmine→jest, drop `test.ts` from `files`). This is the implied intent of installing jest.
- **`zoneless`**: detect via `isZoneless`; set the option to match the app rather than asking.
- Idempotent: `test` already `:run` → no-op on the rewrite.

**`ng update @21` (the one heavy migration; headless-safe):**

- Auto: bump `jest`/`jest-environment-jsdom`/`jsdom` → 30/30/26; patch `tsconfig.spec.json` (`module`/`moduleResolution: "Node16"`, `isolatedModules: true`); rename `configPath`→`config` and `testPathPattern`→`testPathPatterns` in angular.json; strip removed `globalMocks` values (`styleTransform`/`getComputedStyle`/`doctype`) and removed Jest options (`browser`/`init`/`mapCoverage`/`testURL`/`timers`); set `zoneless` by **detection** (zone.js in polyfills → `false`; else leave default `true`).
- Advise (logger): `Node16` may surface pre-existing type errors; removed mocks may need manual replacement.

**`ng update @22` (advisory-only — these land via v22-held breaking PRs):**

The v22 jest breaking changes are internal default flips that apply automatically on upgrade (no user-file rewrite needed), so the migration's job is to _warn_, not transform:

- **#2191 — `isolatedModules` now defaults to `true`** (faster ts-jest compile). Applies automatically. Advise: `const enum` across files and type-only re-exports without the `type` modifier will now error; fix the call sites, or restore `isolatedModules: false` in your jest config. Optionally grep spec sources for `const enum` to make the warning targeted. We do **not** auto-set `false` — the new default is intentional.
- **#2212 — per-project coverage output** moves from `./coverage` to `<projectRoot>/coverage`. Affects only multi-project / `projectRoot !== workspaceRoot` workspaces — **detectable**, so warn only the affected ones: update any CI/tooling reading a hardcoded `./coverage/` path.

### 4.2 `custom-esbuild`

**Why installed:** inject custom esbuild plugins / index-html transformers / configuration into the build without ejecting.

**`ng add` (auto-detected):**

- Add `@angular-builders/custom-esbuild` to devDeps; rewrite `build` → `:application`, `serve` → `:dev-server` (preserve options); schedule install.
- **Test consistency (key):** the `:unit-test` builder applies the same `codePlugins` to the Vitest run via `buildTarget`. So:
  - `test` on `@angular/build:unit-test` (Vitest) → **auto-rewrite** to `@angular-builders/custom-esbuild:unit-test`, wiring `buildTarget` to the project build target. Required so plugins apply consistently to tests.
  - `test` on Karma/Jest → **leave** (different toolchain; esbuild plugins don't apply there). Emit advisory pointing at `custom-esbuild:unit-test`.
  - `--unit-test` flag: force-create a Vitest test target even if none exists.
- Idempotent.

**`ng update`:** **none.** custom-esbuild first appeared at v17 and every change since (plugins, indexHtmlTransformer, the `unit-test` builder added in 20.1.0) was additive. No user-facing config broke.

### 4.3 `custom-webpack`

**Why installed:** inject custom webpack config into the build without ejecting (inert without a config file).

**`ng add` (auto-detected):**

- Add dep; rewrite `build` → `:browser`, `serve` → `:dev-server`; schedule install.
- **Scaffold config:** if no `customWebpackConfig` is referenced and no `webpack.config.*` exists → create a starter `webpack.config.js` and set `customWebpackConfig` to it. If one already exists → leave it. (It's the reason the builder is installed; no prompt.)
- Idempotent.

**`ng update @22` (v22-gated; ships with #2260; mostly advisory):**

- The `:karma` builder is removed in v22 with **no drop-in replacement**. Do **not** auto-delete the `test` target (would leave the project with no `ng test`).
- Advise + leave a TODO: migrate the test target to `@angular-builders/custom-esbuild:unit-test` (Vitest) or `@angular-builders/jest` (replacement tracked in #1928).
- Dead `karma.conf.*` / karma-jasmine-puppeteer devDeps: clean only once a replacement test target exists; otherwise advisory.

## 5. Migration Chain Summary

| Transition            | jest                                   | custom-esbuild   | custom-webpack                          |
| --------------------- | -------------------------------------- | ---------------- | --------------------------------------- |
| 17→18 / 18→19 / 19→20 | no-op                                  | no-op            | no-op                                   |
| 20→21                 | **migration (heavy)**                  | no-op (additive) | no-op                                   |
| 21→22                 | **migration (advisory: #2191, #2212)** | no-op            | **migration (Karma removal, advisory)** |

Real migrations: **jest `@21`** (heavy auto-transform), **jest `@22`** and **custom-webpack `@22`** (advisory). All other major transitions are plain dependency bumps handled by `ng update` itself — **no no-op placeholder migrations** (a deliberate departure from earlier prototypes that registered empty v18/v19/v20 migrations).

**The v22 migration set is defined by the v22-bound breaking PRs, not by master's changelog history.** Any PR labeled `breaking-change` and held for the major lands in v22 and MUST carry a migration step (auto-transform or logged advisory). Current set: **#2191** (jest isolatedModules default), **#2212** (jest per-project coverage), **#2260** (custom-webpack Karma removal). Re-enumerate `breaking-change`-labeled open PRs at the v22 cut to catch any added later.

## 6. Coverage Checklist (applied per builder)

| Dimension                     | jest                                                  | custom-esbuild                      | custom-webpack                      |
| ----------------------------- | ----------------------------------------------------- | ----------------------------------- | ----------------------------------- |
| ng-add: deps add/remove       | +jest stack / −karma,jasmine                          | +self                               | +self                               |
| ng-add: targets rewritten     | `test`                                                | `build`, `serve`, `test`(if Vitest) | `build`, `serve`                    |
| ng-add: files created/deleted | del `karma.conf`,`test.ts`                            | —                                   | create `webpack.config.js`          |
| ng-add: tsconfig edits        | spec `types`/`files`                                  | —                                   | —                                   |
| ng-add: detection             | Karma?, zoneless?                                     | test builder kind                   | webpack config present?             |
| ng-add: flags                 | `--project`                                           | `--project`, `--unit-test`          | `--project`                         |
| ng-add: idempotency           | `test` already `:run`                                 | `build` already `:application`      | `build` already `:browser`          |
| ng-update migrations          | `@21`, `@22`                                          | none                                | `@22`                               |
| migration auto transforms     | deps, tsconfig, renames, mocks, zoneless(detected)    | —                                   | karma cleanup (gated)               |
| migration advisories          | Node16, removed mocks, isolatedModules, coverage path | —                                   | no Karma replacement → Vitest/jest  |
| package.json fields           | `schematics`, `ng-add`, `ng-update`                   | `schematics`, `ng-add`              | `schematics`, `ng-add`, `ng-update` |
| tests                         | ng-add + migration(+idempotency)                      | ng-add                              | ng-add + migration                  |

## 7. Packaging / Build

- Shared base `tsconfig.schematics.json` (repo root), extended per package: `module: "commonjs"`, `rootDir: src/schematics`, `outDir: dist/schematics`, exclude `**/*.spec.ts` and any `files/**` templates.
- Build sequence per package: `tsc (lib) → tsc (schematics) → copy schematics assets`. A `postbuild`/`copy:schematics` step copies `collection.json`, `migrations.json`, and every `schema.json` into `dist/schematics` (TypeScript does not copy JSON/templates).
- `package.json` fields reference dist-relative paths:
  - All three: `"schematics": "./dist/schematics/collection.json"`, `"ng-add": { "save": "devDependencies" }`.
  - jest + custom-webpack: `"ng-update": { "migrations": "./dist/schematics/migrations.json" }`.
- `common` mirrors the same `tsconfig.schematics.json` + copy approach for its shared schematics subpath.

## 8. Testing Strategy

- **Unit (per package):** `SchematicTestRunner` + `UnitTestTree` on the shared `SchematicTestHarness`. Build a realistic workspace via `@schematics/angular` `workspace`+`application`; assert the transformed `angular.json`/`tsconfig.spec.json`/`package.json`. For `NodePackageInstallTask`, assert the task was scheduled (no real install in tests).
- **Migrations:** seed the tree in pre-migration shape; assert transforms; add an **idempotency** test (run twice == run once); cover both zone and zoneless detection branches for jest `@21`.
- **Integration:** one `examples/` end-to-end check that runs `ng add` on a fixture app and verifies the builder is wired and `ng test`/`ng build` works. Wired into the existing integration matrix.

## 9. Non-Goals

- No `ng add`/migrations for `bazel` or `timestamp`.
- No automatic test-runner switch for Karma/Jest users under custom-esbuild ng-add (advisory only).
- No auto-deletion of the webpack Karma test target in the `@22` migration (advisory, since no replacement exists).
- No interactive prompts anywhere.

## 10. Risks / Open Items

- **v22 not released** (only `22.0.0-rc.2`). The custom-webpack `@22` migration and `:karma` removal (#2260) are gated on the v22 release; build/validate against the RC.
- **Multi-project workspaces:** default to targeting all projects when there's no `defaultProject`; `--project` overrides. Validate behavior on the multi-project example fixtures.
- **`Node16` tsconfig change** in jest `@21` can surface latent type errors in user code — advisory only; we don't attempt to fix user types.
- **Existing WIP** (#2240, #2241, branches `feat/schematics-bundle`, `feat/jest-schematics-ng-add`, `feature/22-schematics-installation`) is reference-only. #2240/#2241 to be closed/superseded once the consolidated PR is up.

## 11. Relationship to `MIGRATION.MD` and the upgrade runbook

`MIGRATION.MD` (root, hand-written, per-major back to v7→v8) is today the _only_ migration aid — users read it and apply steps manually. Once `ng update` schematics exist, the two must be managed as a pair, not allowed to drift:

- **`MIGRATION.MD` stays the human-canonical record** of per-major breaking changes (also serves users who don't run `ng update`).
- **Each `MIGRATION.MD` breaking-change entry maps to a migration outcome**: either an auto-transform or a logged advisory. Both are driven by one source — the per-major breaking-change inventory. The v20→21 section already enumerates exactly what the jest `@21` schematic automates.
- **Annotate automation in `MIGRATION.MD`**: mark each item ✅ automated by `ng update` vs ⚠️ manual. Migration `logger.warn` advisories should point users to the relevant `MIGRATION.MD` section for detail.
- **CHANGELOG** stays auto-generated from conventional commits; it is orthogonal — `MIGRATION.MD` + the migration schematic are the human/automated migration pair.

### Process invariant (for AGENTS.md + the upgrade runbook)

> A breaking change landing in (or held for) a major release MUST ship with **both** (a) a migration step — auto-transform or logged advisory — in that builder's `migrations.json`, and (b) a `MIGRATION.MD` entry for that major.

The upgrade runbook's per-major checklist therefore includes: **enumerate every `breaking-change`-labeled PR targeting the major → for each, confirm a migration step exists and a `MIGRATION.MD` entry exists.** This closes the loop between the "hold for next major" workflow and migration coverage.
