# Builder Schematics — Plan 02: `custom-esbuild` `ng add` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give `@angular-builders/custom-esbuild` a first-class `ng add` that auto-wires the `build` → `:application` and `serve` → `:dev-server` builders (preserving options) **when the existing build is already esbuild** (`@angular/build:application`), and keeps unit tests consistent by rewiring a Vitest `test` target to `:unit-test` (with `buildTarget`) so esbuild `codePlugins` apply to tests too. When the existing build is **webpack** (`@angular-devkit/build-angular:browser` or `@angular-builders/custom-webpack:browser`), it does **NOT** silently swap to esbuild — it leaves the targets alone and logs an advisory (run Angular's `use-application-builder` migration first, then `ng add`, then port plugins to `codePlugins` manually). The `--from-webpack` flag forces only the mechanical target rewrite from a webpack build. All auto-detected, zero prompts, with `--project`, `--unit-test`, and `--from-webpack` as the only flags.

**Architecture:** A thin per-package `src/schematics/` tree compiled by a dedicated `tsconfig.schematics.json` to CommonJS in `dist/schematics/` (Angular schematics must be CJS), exactly mirroring Plan 0's packaging. The `ng-add` schematic is a `chain([...])` of shared `Rule` factories imported from `@angular-builders/common/schematics` (locked by Plan 0) plus custom-esbuild-specific wiring. **No migrations:** custom-esbuild first shipped at v17 and every change since (plugins, indexHtmlTransformer, the `unit-test` builder added in 20.1.0) was purely additive — no user-facing config ever broke — so there is no `migrations.json` and no `ng-update` field.

**Tech Stack:** TypeScript 5.9 (CommonJS for schematics), `@angular-devkit/schematics`, `@schematics/angular/utility` (via `@angular-builders/common/schematics`), Jest 30 + `@angular-devkit/schematics/testing` on `SchematicTestHarness` from `@angular-builders/common/schematics/testing`.

---

## Dependency on Plan 0 (do not redefine these)

This plan **imports** the following from `@angular-builders/common/schematics` (signatures locked by Plan 0 — `docs/superpowers/plans/2026-06-02-builder-schematics-00-common-core.md`). Call them exactly; never re-implement:

```ts
import {
  setBuilderForTarget,      // (projectName, targetName, builderName, options?) => Rule
  addBuilderDevDependency,  // (name, version, { install }?) => Rule
  getProjectsToTarget,      // (workspace, optionProject?) => string[]
  detectTestBuilder,        // (workspace, projectName) => 'karma'|'jest'|'vitest'|'other'|'none'
} from '@angular-builders/common/schematics';
```

And in tests:

```ts
import { SchematicTestHarness } from '@angular-builders/common/schematics/testing';
```

**Prerequisite:** Plan 0 must be merged/available so `@angular-builders/common/schematics` and `.../schematics/testing` resolve. This plan also assumes the workspace is on `release/v22` so Angular deps resolve to `^22`.

---

## Architecture decision: no `ng-update`, no migrations (spec §4.2, §5)

custom-esbuild is the **only** in-scope builder with **zero** migrations. Rationale, recorded here so a future maintainer does not "fill the gap":

- custom-esbuild first appeared at **v17**. Every subsequent change was **additive**: esbuild `plugins`, `indexHtmlTransformer`, and the `unit-test` (Vitest) builder added in **20.1.0**. None removed or renamed a user-facing builder option or target.
- The migration set for a major is defined by the `breaking-change`-labeled PRs held for that major (spec §5). **No custom-esbuild breaking PR is held for v22** (the v22 breaking set is jest #2191, jest #2212, custom-webpack #2260 — none touch custom-esbuild).
- Therefore: **NO** `src/schematics/migrations.json`, **NO** `migrations/` directory, **NO** `"ng-update"` field in `package.json`. The spec's coverage checklist (§6) lists custom-esbuild `package.json` fields as exactly `schematics`, `ng-add` (no `ng-update`).

If a future custom-esbuild breaking change is held for a major, that is when `migrations.json` + `ng-update` get added — not before.

---

## File Structure

- Create: `packages/custom-esbuild/tsconfig.schematics.json` — extends root `tsconfig.schematics.json` (from Plan 0); `rootDir: src/schematics`, `outDir: dist/schematics`.
- Create: `packages/custom-esbuild/src/schematics/collection.json` — registers the `ng-add` schematic.
- Create: `packages/custom-esbuild/src/schematics/ng-add/schema.json` — `--project` + `--unit-test` + `--from-webpack` flags, no `x-prompt`.
- Create: `packages/custom-esbuild/src/schematics/ng-add/schema.ts` — the typed `Schema` interface for `ng-add` options.
- Create: `packages/custom-esbuild/src/schematics/ng-add/index.ts` — the `ng-add` rule factory (the only logic file).
- Create: `packages/custom-esbuild/src/schematics/ng-add/index.spec.ts` — unit tests.
- Modify: `packages/custom-esbuild/package.json` — add `"schematics"` + `"ng-add"` fields, `@angular-builders/common` already present, add `copyfiles` devDep, rewrite `build` script to compile + copy schematics.

**Builder name constants** (real, from `packages/custom-esbuild/builders.json`):
- build → `@angular-builders/custom-esbuild:application`
- serve → `@angular-builders/custom-esbuild:dev-server`
- test (Vitest) → `@angular-builders/custom-esbuild:unit-test`

**Incumbent build-builder constants** (what the workspace may already have on `build`, used by the §12.3 guard):
- esbuild (safe to rewrite) → `@angular/build:application`
- webpack (guard — do NOT rewrite without `--from-webpack`) → `@angular-devkit/build-angular:browser` OR `@angular-builders/custom-webpack:browser`

> The build-builder guard reads `workspace.projects.get(projectName).targets.get('build')?.builder` **directly** — there is no shared build-builder detection helper in Plan 0 (Plan 0 only exposes `detectTestBuilder`), and we intentionally do **not** invent one here. The check is a small inline classification (esbuild vs webpack vs other) local to `ng-add/index.ts`.

---

## Task 1: Packaging scaffolding (tsconfig + package.json)

**Files:**
- Create: `packages/custom-esbuild/tsconfig.schematics.json`
- Modify: `packages/custom-esbuild/package.json`

- [ ] **Step 1: Write the per-package schematics tsconfig**

Create `packages/custom-esbuild/tsconfig.schematics.json` (mirrors Plan 0 Task 1 Step 2 exactly, adjusting paths):

```json
{
  "extends": "../../tsconfig.schematics.json",
  "compilerOptions": {
    "rootDir": "src/schematics",
    "outDir": "dist/schematics"
  },
  "include": ["src/schematics/**/*.ts"],
  "exclude": ["node_modules", "**/*.spec.ts", "**/files/**"]
}
```

> The root `tsconfig.schematics.json` (created in Plan 0 Task 1 Step 1) provides `module: commonjs`, `strict`, `declaration`, etc. This file only narrows `rootDir`/`outDir`. The main `tsconfig.json` (lib build, ESM-interop `Node16`) is untouched.

- [ ] **Step 2: Wire package.json fields and build script**

Modify `packages/custom-esbuild/package.json`.

Add the two schematics fields (alongside the existing `"builders": "builders.json"` line). **Do NOT add `ng-update`:**

```json
  "schematics": "./dist/schematics/collection.json",
  "ng-add": {
    "save": "devDependencies"
  },
```

Change the `build` script to also compile + copy schematics (insert the two new sub-steps before `postbuild`, preserving the existing `merge-schemes.ts` step which is a MUST per AGENTS.md):

```json
    "build": "yarn prebuild && tsc && ts-node ../../merge-schemes.ts && tsc -p tsconfig.schematics.json && yarn copy:schematics && yarn postbuild",
    "copy:schematics": "copyfiles -u 2 \"src/schematics/**/*.json\" dist/schematics",
```

> No `files/**` copy line is needed — custom-esbuild's `ng-add` creates no template files (unlike custom-webpack's scaffolded `webpack.config.js`). Only `collection.json` + `schema.json` need copying. `-u 2` strips the `src/schematics` prefix so `collection.json` lands at `dist/schematics/collection.json` and `ng-add/schema.json` at `dist/schematics/ng-add/schema.json`.

Add to `devDependencies`:

```json
    "copyfiles": "^2.4.1",
```

`@angular-builders/common` is already in `dependencies` (`workspace:*`) — the schematics import resolves through it. No new runtime dep is required.

Also add `dist/schematics` coverage to publishing — the existing `"files": ["dist", "builders.json"]` already includes all of `dist`, so `dist/schematics` ships automatically. No `files` change needed.

- [ ] **Step 3: Verify the tsconfig is syntactically valid (no source yet)**

Run: `yarn workspace @angular-builders/custom-esbuild exec tsc -p tsconfig.schematics.json --listFilesOnly`
Expected: errors with `No inputs were found in config file` (because `src/schematics/**/*.ts` does not exist yet). This is the expected "no inputs" failure — it confirms the tsconfig parses and the include glob is wired. Source arrives in Task 2.

- [ ] **Step 4: Commit**

```bash
git add packages/custom-esbuild/tsconfig.schematics.json packages/custom-esbuild/package.json
git commit -m "build(custom-esbuild): add schematics packaging (tsconfig + ng-add fields + copy)"
```

---

## Task 2: Collection + schema manifests

**Files:**
- Create: `packages/custom-esbuild/src/schematics/collection.json`
- Create: `packages/custom-esbuild/src/schematics/ng-add/schema.json`
- Create: `packages/custom-esbuild/src/schematics/ng-add/schema.ts`

- [ ] **Step 1: Write the collection manifest**

Create `packages/custom-esbuild/src/schematics/collection.json`:

```json
{
  "$schema": "../../../../node_modules/@angular-devkit/schematics/collection-schema.json",
  "schematics": {
    "ng-add": {
      "description": "Wire @angular-builders/custom-esbuild into the workspace (build, serve, and Vitest unit-test targets).",
      "factory": "./ng-add/index#ngAdd",
      "schema": "./ng-add/schema.json"
    }
  }
}
```

> `factory` points at the compiled `dist/schematics/ng-add/index.js` exporting `ngAdd`. The `$schema` path is relative to `dist/schematics/collection.json` at runtime; `../../../../node_modules` walks `dist/schematics` → `dist` → package root → `packages` → repo `node_modules` (hoisted by Yarn 3). It is advisory only (IDE validation) and does not affect CLI execution.

- [ ] **Step 2: Write the ng-add JSON schema (flags only, zero prompts)**

Create `packages/custom-esbuild/src/schematics/ng-add/schema.json`:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema",
  "$id": "CustomEsbuildNgAdd",
  "title": "@angular-builders/custom-esbuild ng-add options",
  "type": "object",
  "properties": {
    "project": {
      "type": "string",
      "description": "The project to add custom-esbuild to. Defaults to auto-detection (single project, or default project, or all projects).",
      "$default": {
        "$source": "projectName"
      }
    },
    "unitTest": {
      "type": "boolean",
      "description": "Force-create a Vitest unit-test target wired to @angular-builders/custom-esbuild:unit-test, even if no test target exists.",
      "default": false,
      "alias": "unit-test"
    },
    "fromWebpack": {
      "type": "boolean",
      "description": "Force the mechanical target rewrite (build → :application, serve → :dev-server) even when the current build is a webpack builder. By default a webpack build is left untouched with an advisory, because esbuild plugins cannot be auto-translated from webpack.config.js. Use only if you accept porting your webpack config to esbuild codePlugins manually.",
      "default": false,
      "alias": "from-webpack"
    }
  },
  "additionalProperties": false
}
```

> **No `x-prompt` anywhere** (spec §2, §4.2: zero prompts). `$default.$source: projectName` lets the CLI fill `project` from the current directory's project context but never prompts. `--unit-test` maps to `unitTest` via the `alias`; `--from-webpack` maps to `fromWebpack`. `--from-webpack` (spec §12.3) is an explicit user override of the webpack-build guard.

- [ ] **Step 3: Write the typed Schema interface**

Create `packages/custom-esbuild/src/schematics/ng-add/schema.ts`:

```ts
export interface Schema {
  /** Target project name. When omitted, projects are auto-detected. */
  project?: string;
  /** Force-create a Vitest unit-test target even if none exists. */
  unitTest?: boolean;
  /**
   * Force the mechanical build/serve rewrite even when the current build is a
   * webpack builder. Without this, a webpack build is left untouched with an
   * advisory (spec §12.3). The user must port their webpack config to esbuild
   * codePlugins manually afterwards.
   */
  fromWebpack?: boolean;
}
```

- [ ] **Step 4: Commit**

```bash
git add packages/custom-esbuild/src/schematics/collection.json packages/custom-esbuild/src/schematics/ng-add/schema.json packages/custom-esbuild/src/schematics/ng-add/schema.ts
git commit -m "feat(custom-esbuild): add ng-add collection + schema manifests"
```

---

## Task 3: ng-add — build + serve rewrite with option preservation (esbuild build only)

Start with the core rewrite, **guarded on the incumbent build builder** (spec §12.3): the rewrite fires only when `build` is already esbuild (`@angular/build:application`). The webpack-guard branch (leave + advise, plus `--from-webpack`) is added in Task 3b. Builds the `ngAdd` factory incrementally; later tasks extend it.

**Files:**
- Create: `packages/custom-esbuild/src/schematics/ng-add/index.ts`
- Test: `packages/custom-esbuild/src/schematics/ng-add/index.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/custom-esbuild/src/schematics/ng-add/index.spec.ts`:

```ts
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { readWorkspace, updateWorkspace } from '@schematics/angular/utility';
import { SchematicTestHarness } from '@angular-builders/common/schematics/testing';

const COLLECTION = require.resolve(
  '../../../src/schematics/collection.json',
);

function runner(): SchematicTestRunner {
  return new SchematicTestRunner('custom-esbuild', COLLECTION);
}

async function ngAdd(
  tree: UnitTestTree,
  options: Record<string, unknown> = {},
): Promise<UnitTestTree> {
  return runner().runSchematic('ng-add', options, tree);
}

describe('custom-esbuild ng-add: build + serve rewrite', () => {
  it('rewrites build → :application and serve → :dev-server, adding self to devDeps', async () => {
    const tree = await new SchematicTestHarness().createWorkspace({
      projects: [{ name: 'app' }],
    });

    // Seed a stock Angular build + serve target.
    const seeded = (await runner()
      .callRule(
        updateWorkspace((workspace) => {
          const project = workspace.projects.get('app')!;
          project.targets.set('build', {
            builder: '@angular/build:application',
            options: { tsConfig: 'tsconfig.app.json', outputPath: 'dist/app' },
          });
          project.targets.set('serve', {
            builder: '@angular/build:dev-server',
            options: { buildTarget: 'app:build' },
          });
        }),
        tree,
      )
      .toPromise()) as UnitTestTree;

    const out = await ngAdd(seeded, { project: 'app' });

    const ws = await readWorkspace(out);
    const build = ws.projects.get('app')!.targets.get('build')!;
    const serve = ws.projects.get('app')!.targets.get('serve')!;

    expect(build.builder).toBe('@angular-builders/custom-esbuild:application');
    // existing options preserved
    expect((build.options as Record<string, unknown>).tsConfig).toBe('tsconfig.app.json');
    expect((build.options as Record<string, unknown>).outputPath).toBe('dist/app');

    expect(serve.builder).toBe('@angular-builders/custom-esbuild:dev-server');
    expect((serve.options as Record<string, unknown>).buildTarget).toBe('app:build');

    const pkg = JSON.parse(out.readText('/package.json'));
    expect(pkg.devDependencies['@angular-builders/custom-esbuild']).toBeDefined();
  });
});
```

> The test points `COLLECTION` at the **source** `collection.json`; `runSchematic`/`callRule` execute the TypeScript via ts-jest, so no build step is required for unit tests. The factory's `factory: "./ng-add/index#ngAdd"` resolves relative to the collection file.

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn jest --config jest-ut.config.js packages/custom-esbuild/src/schematics/ng-add/index.spec.ts`
Expected: FAIL — `Cannot find module './ng-add/index'` (or factory resolution error: the `index.ts` does not exist yet).

- [ ] **Step 3: Write the minimal implementation**

Create `packages/custom-esbuild/src/schematics/ng-add/index.ts`:

```ts
import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { readWorkspace } from '@schematics/angular/utility';
import {
  addBuilderDevDependency,
  getProjectsToTarget,
  setBuilderForTarget,
} from '@angular-builders/common/schematics';

import { Schema } from './schema';

const PACKAGE_NAME = '@angular-builders/custom-esbuild';
const BUILD_BUILDER = '@angular-builders/custom-esbuild:application';
const SERVE_BUILDER = '@angular-builders/custom-esbuild:dev-server';

// Incumbent build builders the guard classifies (spec §12.3).
const ESBUILD_BUILD = '@angular/build:application';
const WEBPACK_BUILDS = [
  '@angular-devkit/build-angular:browser',
  '@angular-builders/custom-webpack:browser',
];

// eslint-disable-next-line @typescript-eslint/no-var-requires
const VERSION: string = require('../../../package.json').version;

/**
 * Classify the project's current `build` builder for the §12.3 guard.
 * Inline (no shared helper — Plan 0 exposes only detectTestBuilder).
 */
function classifyBuildBuilder(
  builder: string | undefined,
): 'esbuild' | 'webpack' | 'none' | 'other' {
  if (!builder) return 'none';
  if (builder === ESBUILD_BUILD || builder === BUILD_BUILDER) return 'esbuild';
  if (WEBPACK_BUILDS.includes(builder)) return 'webpack';
  return 'other';
}

export function ngAdd(options: Schema): Rule {
  return async (tree: Tree, _context: SchematicContext) => {
    const workspace = await readWorkspace(tree);
    const projects = getProjectsToTarget(workspace, options.project);

    const rules: Rule[] = [
      addBuilderDevDependency(PACKAGE_NAME, `~${VERSION}`, { install: true }),
    ];

    for (const projectName of projects) {
      const project = workspace.projects.get(projectName)!;
      const buildKind = classifyBuildBuilder(
        project.targets.get('build')?.builder,
      );

      // §12.3 guard: only rewrite when the build is already esbuild
      // (`@angular/build:application` or our own `:application`). The webpack
      // branch (leave + advise / --from-webpack) is added in Task 3b.
      if (buildKind === 'esbuild') {
        if (project.targets.has('build')) {
          rules.push(setBuilderForTarget(projectName, 'build', BUILD_BUILDER));
        }
        if (project.targets.has('serve')) {
          rules.push(setBuilderForTarget(projectName, 'serve', SERVE_BUILDER));
        }
      }
    }

    return chain(rules);
  };
}
```

> `setBuilderForTarget` (Plan 0) rewrites only the `builder` field and merges any passed `options` — passing no `options` here preserves all existing target options. `addBuilderDevDependency` with `{ install: true }` schedules a `NodePackageInstallTask`; the test asserts the dep entry, not a real install. `~${VERSION}` pins to the installed package's own version (the builder major == Angular major invariant). `classifyBuildBuilder` treats our own `:application` as `esbuild` too, so re-running on an already-wired workspace stays in the rewrite branch (idempotent — Task 7). The webpack/none/other kinds are handled in Task 3b.

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn jest --config jest-ut.config.js packages/custom-esbuild/src/schematics/ng-add/index.spec.ts`
Expected: PASS (1 test, all assertions).

- [ ] **Step 5: Commit**

```bash
git add packages/custom-esbuild/src/schematics/ng-add/index.ts packages/custom-esbuild/src/schematics/ng-add/index.spec.ts
git commit -m "feat(custom-esbuild): ng-add rewrites build/serve preserving options"
```

---

## Task 3b: ng-add — webpack-build guard + `--from-webpack` (spec §12.3)

A webpack `build` must NOT be silently swapped to esbuild — that strands the user's `webpack.config.js`. Instead: leave `build`/`serve` untouched and emit a `context.logger` advisory describing the manual path (`use-application-builder` migration → `ng add` → port plugins to `codePlugins`). The `--from-webpack` flag overrides the guard and forces only the mechanical target rewrite.

**Files:**
- Modify: `packages/custom-esbuild/src/schematics/ng-add/index.ts`
- Test: `packages/custom-esbuild/src/schematics/ng-add/index.spec.ts`

- [ ] **Step 1: Add the failing tests**

Append to `packages/custom-esbuild/src/schematics/ng-add/index.spec.ts`:

```ts
describe('custom-esbuild ng-add: webpack-build guard (spec §12.3)', () => {
  async function seedWebpackBuild(
    builder: string,
  ): Promise<UnitTestTree> {
    const tree = await new SchematicTestHarness().createWorkspace({
      projects: [{ name: 'app' }],
    });
    return (await runner()
      .callRule(
        updateWorkspace((workspace) => {
          const project = workspace.projects.get('app')!;
          project.targets.set('build', {
            builder,
            options: { outputPath: 'dist/app' },
          });
          project.targets.set('serve', {
            builder: '@angular-devkit/build-angular:dev-server',
            options: { buildTarget: 'app:build' },
          });
        }),
        tree,
      )
      .toPromise()) as UnitTestTree;
  }

  it('does NOT rewrite an @angular-devkit/build-angular:browser build; logs an advisory', async () => {
    const seeded = await seedWebpackBuild('@angular-devkit/build-angular:browser');

    const r = runner();
    const logs: string[] = [];
    r.logger.subscribe((entry) => logs.push(entry.message));

    const out = await r.runSchematic('ng-add', { project: 'app' }, seeded);

    const ws = await readWorkspace(out);
    const build = ws.projects.get('app')!.targets.get('build')!;
    const serve = ws.projects.get('app')!.targets.get('serve')!;

    // unchanged — no silent swap
    expect(build.builder).toBe('@angular-devkit/build-angular:browser');
    expect(serve.builder).toBe('@angular-devkit/build-angular:dev-server');

    // advisory names the migration path and the --from-webpack escape hatch
    expect(logs.some((m) => m.includes('use-application-builder'))).toBe(true);
    expect(logs.some((m) => m.includes('--from-webpack'))).toBe(true);
  });

  it('does NOT rewrite a custom-webpack:browser build; logs an advisory', async () => {
    const seeded = await seedWebpackBuild('@angular-builders/custom-webpack:browser');

    const r = runner();
    const logs: string[] = [];
    r.logger.subscribe((entry) => logs.push(entry.message));

    const out = await r.runSchematic('ng-add', { project: 'app' }, seeded);

    const ws = await readWorkspace(out);
    expect(ws.projects.get('app')!.targets.get('build')!.builder).toBe(
      '@angular-builders/custom-webpack:browser',
    );
    expect(logs.some((m) => m.includes('use-application-builder'))).toBe(true);
  });

  it('--from-webpack forces the mechanical build/serve rewrite from a webpack build', async () => {
    const seeded = await seedWebpackBuild('@angular-devkit/build-angular:browser');

    const out = await ngAdd(seeded, { project: 'app', fromWebpack: true });

    const ws = await readWorkspace(out);
    const build = ws.projects.get('app')!.targets.get('build')!;
    const serve = ws.projects.get('app')!.targets.get('serve')!;

    expect(build.builder).toBe('@angular-builders/custom-esbuild:application');
    // mechanical rewrite preserves existing options
    expect((build.options as Record<string, unknown>).outputPath).toBe('dist/app');
    expect(serve.builder).toBe('@angular-builders/custom-esbuild:dev-server');
    expect((serve.options as Record<string, unknown>).buildTarget).toBe('app:build');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `yarn jest --config jest-ut.config.js packages/custom-esbuild/src/schematics/ng-add/index.spec.ts -t "webpack-build guard"`
Expected: FAIL — the first two cases log no advisory (no `webpack` branch yet), and the `--from-webpack` case leaves `build` on `@angular-devkit/build-angular:browser` (the guard from Task 3 only rewrites `esbuild` builds, and `fromWebpack` is not yet consulted).

- [ ] **Step 3: Extend the implementation**

In `packages/custom-esbuild/src/schematics/ng-add/index.ts`, change the factory's async arrow to use the `context` parameter (rename `_context` → `context`):

```ts
  return async (tree: Tree, context: SchematicContext) => {
```

Replace the §12.3 guard block (the `if (buildKind === 'esbuild') { ... }` added in Task 3) with the full branch set:

```ts
      // §12.3 guard: distinguish the incumbent build builder.
      const wantsForcedRewrite = options.fromWebpack === true;

      if (buildKind === 'esbuild' || wantsForcedRewrite) {
        // esbuild build → safe rewrite (common case).
        // --from-webpack → forced mechanical rewrite even from a webpack build
        // (user accepts porting webpack.config.js plugins to codePlugins manually).
        if (project.targets.has('build')) {
          rules.push(setBuilderForTarget(projectName, 'build', BUILD_BUILDER));
        }
        if (project.targets.has('serve')) {
          rules.push(setBuilderForTarget(projectName, 'serve', SERVE_BUILDER));
        }
      } else if (buildKind === 'webpack') {
        // Webpack build → do NOT silently swap to esbuild (strands webpack.config.js).
        context.logger.info(
          `[@angular-builders/custom-esbuild] Project "${projectName}" builds with a ` +
            `webpack builder ("${project.targets.get('build')!.builder}"). custom-esbuild ` +
            `runs on esbuild, so it will NOT rewrite your build target automatically — that ` +
            `would strand your webpack.config.js. To migrate: (1) run Angular's ` +
            `"use-application-builder" migration to move onto "@angular/build:application", ` +
            `(2) re-run "ng add @angular-builders/custom-esbuild", then (3) port your ` +
            `webpack.config.js plugins to esbuild "codePlugins" manually (there is no ` +
            `automatic translation). To skip the guard and force only the target rewrite now, ` +
            `re-run with "--from-webpack". Leaving build/serve unchanged.`,
        );
      }
```

> `wantsForcedRewrite` (`--from-webpack`) joins the `esbuild` branch so the mechanical rewrite (`build`→`:application`, `serve`→`:dev-server`, options preserved by `setBuilderForTarget`) runs even from a webpack build. The advisory is emitted only for the default (un-forced) webpack case and names the exact path: `use-application-builder` → `ng add` → manual `codePlugins` port. `buildKind === 'none'`/`'other'` projects fall through untouched (no advisory) — `ng add` still adds the devDep and processes any test target. No auto-translation of webpack config is attempted (spec §12.3: out of scope).

- [ ] **Step 4: Run the tests to verify they pass**

Run: `yarn jest --config jest-ut.config.js packages/custom-esbuild/src/schematics/ng-add/index.spec.ts`
Expected: PASS — webpack-guard suite (no-rewrite + advisory for both webpack builders, `--from-webpack` mechanical rewrite) green; Task 3 esbuild rewrite still green.

- [ ] **Step 5: Commit**

```bash
git add packages/custom-esbuild/src/schematics/ng-add/index.ts packages/custom-esbuild/src/schematics/ng-add/index.spec.ts
git commit -m "feat(custom-esbuild): ng-add guards webpack builds, adds --from-webpack (spec §12.3)"
```

---

## Task 4: ng-add — Vitest test target auto-rewrite + buildTarget wiring

When `test` is `@angular/build:unit-test` (Vitest), auto-rewrite it to `:unit-test` and wire `buildTarget` so esbuild `codePlugins` apply to tests (spec §4.2 "Test consistency").

**Files:**
- Modify: `packages/custom-esbuild/src/schematics/ng-add/index.ts`
- Test: `packages/custom-esbuild/src/schematics/ng-add/index.spec.ts`

- [ ] **Step 1: Add the failing test**

Append to `packages/custom-esbuild/src/schematics/ng-add/index.spec.ts`:

```ts
describe('custom-esbuild ng-add: Vitest test target', () => {
  it('auto-rewrites @angular/build:unit-test → :unit-test and wires buildTarget', async () => {
    const tree = await new SchematicTestHarness().createWorkspace({
      projects: [{ name: 'app' }],
    });

    const seeded = (await runner()
      .callRule(
        updateWorkspace((workspace) => {
          const project = workspace.projects.get('app')!;
          project.targets.set('build', {
            builder: '@angular/build:application',
            options: { tsConfig: 'tsconfig.app.json' },
          });
          project.targets.set('test', {
            builder: '@angular/build:unit-test',
            options: { tsConfig: 'tsconfig.spec.json' },
          });
        }),
        tree,
      )
      .toPromise()) as UnitTestTree;

    const out = await ngAdd(seeded, { project: 'app' });

    const ws = await readWorkspace(out);
    const test = ws.projects.get('app')!.targets.get('test')!;

    expect(test.builder).toBe('@angular-builders/custom-esbuild:unit-test');
    // buildTarget wired to the project's build target so plugins apply to tests
    expect((test.options as Record<string, unknown>).buildTarget).toBe('app:build');
    // pre-existing option preserved
    expect((test.options as Record<string, unknown>).tsConfig).toBe('tsconfig.spec.json');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn jest --config jest-ut.config.js packages/custom-esbuild/src/schematics/ng-add/index.spec.ts -t "Vitest test target"`
Expected: FAIL — `test.builder` is still `@angular/build:unit-test` (the rewrite logic is not implemented yet).

- [ ] **Step 3: Extend the implementation**

In `packages/custom-esbuild/src/schematics/ng-add/index.ts`, update the imports to add `detectTestBuilder`:

```ts
import {
  addBuilderDevDependency,
  detectTestBuilder,
  getProjectsToTarget,
  setBuilderForTarget,
} from '@angular-builders/common/schematics';
```

Add the test-builder constant near the others:

```ts
const TEST_BUILDER = '@angular-builders/custom-esbuild:unit-test';
```

Inside the `for (const projectName of projects)` loop, after the `serve` block, add the Vitest branch:

```ts
      const testKind = detectTestBuilder(workspace, projectName);
      if (testKind === 'vitest') {
        rules.push(
          setBuilderForTarget(projectName, 'test', TEST_BUILDER, {
            buildTarget: `${projectName}:build`,
          }),
        );
      }
```

> `detectTestBuilder` returns `'vitest'` for any builder ending in `:unit-test` (Plan 0 detection logic). `setBuilderForTarget` merges `{ buildTarget }` into existing options, preserving `tsConfig` etc. Wiring `buildTarget` to `<project>:build` is what makes the `:unit-test` builder load the same `codePlugins` as the build (see `packages/custom-esbuild/src/unit-test/index.ts`, which reads `options.buildTarget` and pulls the build target's `plugins`).

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn jest --config jest-ut.config.js packages/custom-esbuild/src/schematics/ng-add/index.spec.ts`
Expected: PASS (Task 3 test + Vitest test both green).

- [ ] **Step 5: Commit**

```bash
git add packages/custom-esbuild/src/schematics/ng-add/index.ts packages/custom-esbuild/src/schematics/ng-add/index.spec.ts
git commit -m "feat(custom-esbuild): ng-add auto-rewrites Vitest test target with buildTarget"
```

---

## Task 5: ng-add — leave Karma/Jest test targets, log an advisory

When `test` is Karma or Jest, esbuild plugins do not apply — leave the target untouched and emit a `context.logger` advisory (spec §4.2, §9 non-goal: no auto-switch).

**Files:**
- Modify: `packages/custom-esbuild/src/schematics/ng-add/index.ts`
- Test: `packages/custom-esbuild/src/schematics/ng-add/index.spec.ts`

- [ ] **Step 1: Add the failing test**

Append to `packages/custom-esbuild/src/schematics/ng-add/index.spec.ts`:

```ts
describe('custom-esbuild ng-add: Karma / Jest test target', () => {
  it('leaves a Karma test target untouched and logs an advisory', async () => {
    const tree = await new SchematicTestHarness().createWorkspace({
      projects: [{ name: 'app' }],
    });

    const seeded = (await runner()
      .callRule(
        updateWorkspace((workspace) => {
          const project = workspace.projects.get('app')!;
          project.targets.set('build', {
            builder: '@angular/build:application',
            options: {},
          });
          project.targets.set('test', {
            builder: '@angular-devkit/build-angular:karma',
            options: { karmaConfig: 'karma.conf.js' },
          });
        }),
        tree,
      )
      .toPromise()) as UnitTestTree;

    const r = runner();
    const logs: string[] = [];
    r.logger.subscribe((entry) => logs.push(entry.message));

    const out = await r.runSchematic('ng-add', { project: 'app' }, seeded);

    const ws = await readWorkspace(out);
    const test = ws.projects.get('app')!.targets.get('test')!;

    // unchanged
    expect(test.builder).toBe('@angular-devkit/build-angular:karma');
    expect((test.options as Record<string, unknown>).karmaConfig).toBe('karma.conf.js');

    // advisory mentions the unit-test builder
    expect(logs.some((m) => m.includes('custom-esbuild:unit-test'))).toBe(true);
  });

  it('leaves a Jest test target untouched and logs an advisory', async () => {
    const tree = await new SchematicTestHarness().createWorkspace({
      projects: [{ name: 'app' }],
    });

    const seeded = (await runner()
      .callRule(
        updateWorkspace((workspace) => {
          const project = workspace.projects.get('app')!;
          project.targets.set('build', { builder: '@angular/build:application', options: {} });
          project.targets.set('test', {
            builder: '@angular-builders/jest:run',
            options: {},
          });
        }),
        tree,
      )
      .toPromise()) as UnitTestTree;

    const r = runner();
    const logs: string[] = [];
    r.logger.subscribe((entry) => logs.push(entry.message));

    const out = await r.runSchematic('ng-add', { project: 'app' }, seeded);

    const ws = await readWorkspace(out);
    expect(ws.projects.get('app')!.targets.get('test')!.builder).toBe('@angular-builders/jest:run');
    expect(logs.some((m) => m.includes('custom-esbuild:unit-test'))).toBe(true);
  });
});
```

> `SchematicTestRunner` exposes a `logger` (a `LoggerApi`) that captures `context.logger` output during `runSchematic`. Subscribe before running.

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn jest --config jest-ut.config.js packages/custom-esbuild/src/schematics/ng-add/index.spec.ts -t "Karma / Jest test target"`
Expected: FAIL — no advisory logged (the `karma`/`jest` branch is not implemented; `logs` contains no matching message).

- [ ] **Step 3: Extend the implementation**

In `packages/custom-esbuild/src/schematics/ng-add/index.ts`, the factory's async arrow already uses the `context` parameter (renamed `_context` → `context` in Task 3b for the webpack advisory). Extend the `testKind` block (added in Task 4) to handle Karma/Jest with an advisory:

```ts
      const testKind = detectTestBuilder(workspace, projectName);
      if (testKind === 'vitest') {
        rules.push(
          setBuilderForTarget(projectName, 'test', TEST_BUILDER, {
            buildTarget: `${projectName}:build`,
          }),
        );
      } else if (testKind === 'karma' || testKind === 'jest') {
        context.logger.info(
          `[@angular-builders/custom-esbuild] Project "${projectName}" uses a ` +
            `${testKind === 'karma' ? 'Karma' : 'Jest'} test runner; esbuild plugins do not ` +
            `apply there. To run your tests through esbuild/Vitest with the same plugins, ` +
            `switch the test target to "${TEST_BUILDER}" (or run ` +
            `"ng add @angular-builders/custom-esbuild --unit-test"). Leaving the test target unchanged.`,
        );
      }
```

> Karma/Jest targets are intentionally left untouched (different toolchain). The advisory points at `@angular-builders/custom-esbuild:unit-test` and the `--unit-test` flag.

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn jest --config jest-ut.config.js packages/custom-esbuild/src/schematics/ng-add/index.spec.ts`
Expected: PASS (Karma + Jest tests green, earlier tests still green).

- [ ] **Step 5: Commit**

```bash
git add packages/custom-esbuild/src/schematics/ng-add/index.ts packages/custom-esbuild/src/schematics/ng-add/index.spec.ts
git commit -m "feat(custom-esbuild): ng-add leaves Karma/Jest tests, logs unit-test advisory"
```

---

## Task 6: ng-add — `--unit-test` force-creates a Vitest test target

The `--unit-test` flag force-creates a `:unit-test` target wired to `<project>:build`, even if no `test` target exists (spec §4.2).

**Files:**
- Modify: `packages/custom-esbuild/src/schematics/ng-add/index.ts`
- Test: `packages/custom-esbuild/src/schematics/ng-add/index.spec.ts`

- [ ] **Step 1: Add the failing test**

Append to `packages/custom-esbuild/src/schematics/ng-add/index.spec.ts`:

```ts
describe('custom-esbuild ng-add: --unit-test flag', () => {
  it('force-creates a Vitest unit-test target when none exists', async () => {
    const tree = await new SchematicTestHarness().createWorkspace({
      projects: [{ name: 'app' }],
    });

    const seeded = (await runner()
      .callRule(
        updateWorkspace((workspace) => {
          const project = workspace.projects.get('app')!;
          project.targets.set('build', { builder: '@angular/build:application', options: {} });
          // no test target at all
          project.targets.delete('test');
        }),
        tree,
      )
      .toPromise()) as UnitTestTree;

    const out = await ngAdd(seeded, { project: 'app', unitTest: true });

    const ws = await readWorkspace(out);
    const test = ws.projects.get('app')!.targets.get('test');
    expect(test).toBeDefined();
    expect(test!.builder).toBe('@angular-builders/custom-esbuild:unit-test');
    expect((test!.options as Record<string, unknown>).buildTarget).toBe('app:build');
  });

  it('rewrites an existing Vitest target the same way under --unit-test', async () => {
    const tree = await new SchematicTestHarness().createWorkspace({
      projects: [{ name: 'app' }],
    });
    const seeded = (await runner()
      .callRule(
        updateWorkspace((workspace) => {
          const project = workspace.projects.get('app')!;
          project.targets.set('build', { builder: '@angular/build:application', options: {} });
          project.targets.set('test', { builder: '@angular/build:unit-test', options: {} });
        }),
        tree,
      )
      .toPromise()) as UnitTestTree;

    const out = await ngAdd(seeded, { project: 'app', unitTest: true });
    const ws = await readWorkspace(out);
    const test = ws.projects.get('app')!.targets.get('test')!;
    expect(test.builder).toBe('@angular-builders/custom-esbuild:unit-test');
    expect((test.options as Record<string, unknown>).buildTarget).toBe('app:build');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn jest --config jest-ut.config.js packages/custom-esbuild/src/schematics/ng-add/index.spec.ts -t "unit-test flag"`
Expected: FAIL — the first case has no `test` target after `ng-add` (force-create not implemented).

- [ ] **Step 3: Extend the implementation**

In `packages/custom-esbuild/src/schematics/ng-add/index.ts`, replace the whole `testKind` block (Tasks 4–5) so the `--unit-test` flag short-circuits to a forced create/rewrite:

```ts
      const testKind = detectTestBuilder(workspace, projectName);
      const wantsForcedVitest = options.unitTest === true;

      if (wantsForcedVitest || testKind === 'vitest') {
        // Force-create or rewrite the test target as a custom-esbuild Vitest runner,
        // wiring buildTarget so esbuild plugins apply to tests.
        rules.push(
          setBuilderForTarget(projectName, 'test', TEST_BUILDER, {
            buildTarget: `${projectName}:build`,
          }),
        );
      } else if (testKind === 'karma' || testKind === 'jest') {
        context.logger.info(
          `[@angular-builders/custom-esbuild] Project "${projectName}" uses a ` +
            `${testKind === 'karma' ? 'Karma' : 'Jest'} test runner; esbuild plugins do not ` +
            `apply there. To run your tests through esbuild/Vitest with the same plugins, ` +
            `switch the test target to "${TEST_BUILDER}" (or run ` +
            `"ng add @angular-builders/custom-esbuild --unit-test"). Leaving the test target unchanged.`,
        );
      }
```

> `setBuilderForTarget` (Plan 0) creates the target if absent (`project.targets.add({ name, builder, options })`) and rewrites it if present — so a single call covers both "no test target → create" and "Vitest target → rewrite". Under `--unit-test`, a pre-existing Karma/Jest target is **overwritten** to Vitest (the flag is an explicit user override of the leave-it default).

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn jest --config jest-ut.config.js packages/custom-esbuild/src/schematics/ng-add/index.spec.ts`
Expected: PASS (all suites: build/serve, Vitest, Karma/Jest, --unit-test).

- [ ] **Step 5: Commit**

```bash
git add packages/custom-esbuild/src/schematics/ng-add/index.ts packages/custom-esbuild/src/schematics/ng-add/index.spec.ts
git commit -m "feat(custom-esbuild): ng-add --unit-test force-creates Vitest target"
```

---

## Task 7: ng-add — idempotency

Re-running `ng add` on an already-wired workspace is a no-op rewrite (spec §4.2, §6).

**Files:**
- Test: `packages/custom-esbuild/src/schematics/ng-add/index.spec.ts`

- [ ] **Step 1: Add the failing/confirming test**

Append to `packages/custom-esbuild/src/schematics/ng-add/index.spec.ts`:

```ts
describe('custom-esbuild ng-add: idempotency', () => {
  it('is a no-op when build is already :application (running twice == once)', async () => {
    const tree = await new SchematicTestHarness().createWorkspace({
      projects: [{ name: 'app' }],
    });
    const seeded = (await runner()
      .callRule(
        updateWorkspace((workspace) => {
          const project = workspace.projects.get('app')!;
          project.targets.set('build', { builder: '@angular/build:application', options: {} });
          project.targets.set('serve', {
            builder: '@angular/build:dev-server',
            options: { buildTarget: 'app:build' },
          });
          project.targets.set('test', {
            builder: '@angular/build:unit-test',
            options: { tsConfig: 'tsconfig.spec.json' },
          });
        }),
        tree,
      )
      .toPromise()) as UnitTestTree;

    const once = await ngAdd(seeded, { project: 'app' });
    const twice = await ngAdd(once, { project: 'app' });

    const wsOnce = await readWorkspace(once);
    const wsTwice = await readWorkspace(twice);

    for (const ws of [wsOnce, wsTwice]) {
      const project = ws.projects.get('app')!;
      expect(project.targets.get('build')!.builder).toBe(
        '@angular-builders/custom-esbuild:application',
      );
      expect(project.targets.get('serve')!.builder).toBe(
        '@angular-builders/custom-esbuild:dev-server',
      );
      const test = project.targets.get('test')!;
      expect(test.builder).toBe('@angular-builders/custom-esbuild:unit-test');
      expect((test.options as Record<string, unknown>).buildTarget).toBe('app:build');
      expect((test.options as Record<string, unknown>).tsConfig).toBe('tsconfig.spec.json');
    }

    // The angular.json content is identical after the second run.
    expect(twice.readText('/angular.json')).toBe(once.readText('/angular.json'));
  });
});
```

- [ ] **Step 2: Run the test**

Run: `yarn jest --config jest-ut.config.js packages/custom-esbuild/src/schematics/ng-add/index.spec.ts -t "idempotency"`
Expected: PASS without code changes. `setBuilderForTarget` writing the same builder name + merging the same `buildTarget` is deterministic, so the second run produces byte-identical `angular.json`.

> If this test FAILS (e.g. `detectTestBuilder` returns `'vitest'` for the already-rewritten `:unit-test` target on the second run, which it does — `@angular-builders/custom-esbuild:unit-test` ends in `:unit-test`), that is fine: the branch re-applies the same `setBuilderForTarget` with the same `buildTarget`, which is a no-op rewrite. The assertion `twice == once` still holds. No code change is expected; this task only adds the safety-net test.

- [ ] **Step 3: Commit**

```bash
git add packages/custom-esbuild/src/schematics/ng-add/index.spec.ts
git commit -m "test(custom-esbuild): assert ng-add idempotency"
```

---

## Task 8: Full build + suite verification

**Files:** none (verification only).

- [ ] **Step 1: Run the full custom-esbuild unit suite**

Run: `yarn jest --config jest-ut.config.js packages/custom-esbuild/src/schematics`
Expected: all `ng-add` describe blocks green (build/serve, webpack-build guard, Vitest, Karma/Jest, --unit-test, idempotency).

- [ ] **Step 2: Build the package end-to-end**

Run: `yarn workspace @angular-builders/custom-esbuild build`
Expected: completes; `dist/schematics/collection.json`, `dist/schematics/ng-add/schema.json`, and `dist/schematics/ng-add/index.js` all present. (`postbuild` runs `test` + `e2e`; those must stay green.)

Run: `ls packages/custom-esbuild/dist/schematics packages/custom-esbuild/dist/schematics/ng-add`
Expected: `collection.json`; `index.js`, `index.d.ts`, `schema.json`, `schema.js`, `schema.d.ts`.

- [ ] **Step 3: Sanity-check the collection resolves from dist**

Run: `node -e "const c=require('./packages/custom-esbuild/dist/schematics/collection.json'); if(!c.schematics['ng-add']) throw new Error('ng-add missing'); console.log('ok')"`
Expected: prints `ok`.

- [ ] **Step 4: Confirm NO ng-update was introduced**

Run: `node -e "const p=require('./packages/custom-esbuild/package.json'); if(p['ng-update']) throw new Error('ng-update must NOT exist'); if(require('fs').existsSync('packages/custom-esbuild/src/schematics/migrations.json')) throw new Error('migrations.json must NOT exist'); console.log('ok: no migrations')"`
Expected: prints `ok: no migrations`.

- [ ] **Step 5: Commit (if any lockfile/formatting churn)**

```bash
git add -A
git commit -m "chore(custom-esbuild): verify schematics build + no-migrations invariant" || echo "nothing to commit"
```

---

## Self-Review

**Spec §4.2 + §12.3 (custom-esbuild) coverage:**
- Add self to devDeps via `addBuilderDevDependency` → Task 3 Step 3. ✅
- Rewrite `build` → `:application`, `serve` → `:dev-server`, preserve options — **only when build is already esbuild** (`@angular/build:application`) → Task 3 (guarded; asserts `tsConfig`/`outputPath`/`buildTarget` preserved). ✅
- **Webpack-build guard (§12.3):** build on `@angular-devkit/build-angular:browser` or `@angular-builders/custom-webpack:browser` → NO rewrite + `context.logger` advisory (`use-application-builder` → `ng add` → manual `codePlugins` port) → Task 3b (cases a + b). ✅
- **`--from-webpack` flag (§12.3):** forces only the mechanical build/serve rewrite from a webpack build → Task 3b (case c), schema.json Task 2. ✅
- Schedule install → Task 3 (`addBuilderDevDependency(..., { install: true })`). ✅
- Vitest `test` (`detectTestBuilder==='vitest'`) → auto-rewrite to `:unit-test`, wire `buildTarget` to `<project>:build` → Task 4. ✅
- Karma/Jest `test` → leave untouched + `context.logger` advisory pointing at `custom-esbuild:unit-test` → Task 5. ✅
- `--unit-test` flag → force-create Vitest target even if none exists → Task 6. ✅
- Idempotent (`build` already `:application` → no-op) → Tasks 3 & 7. ✅
- `ng-update`: NONE — no `migrations.json`, no `ng-update` field, rationale in Architecture section → enforced by Task 8 Step 4. ✅

**Spec §6 coverage checklist (custom-esbuild column):**
- deps add/remove: +self → Task 3. ✅
- targets rewritten: `build`, `serve` (only if build is esbuild, or `--from-webpack`), `test`(if Vitest) → Tasks 3, 3b, 4. ✅
- files created/deleted: — (none) → no task needed; `copy:schematics` has no `files/**` line (Task 1). ✅
- tsconfig edits: — (none). ✅
- detection: test builder kind; webpack guard → `detectTestBuilder` usage Task 4; inline `classifyBuildBuilder` (build-builder guard) Tasks 3/3b. ✅
- flags: `--project`, `--unit-test`, `--from-webpack` → schema.json Task 2, used Tasks 3/3b/6. ✅
- idempotency: `build` already `:application` → Task 7. ✅
- ng-update migrations: none → Architecture + Task 8 Step 4. ✅
- package.json fields: `schematics`, `ng-add` (no `ng-update`) → Task 1 Step 2. ✅
- tests: ng-add → Tasks 3, 3b, 4–7. ✅

**Spec §7 (packaging):** per-package `tsconfig.schematics.json` extending root base; `tsc (lib) → merge-schemes → tsc (schematics) → copy:schematics`; `schematics` field → dist-relative `collection.json`; no `ng-update` field → Task 1. Mirrors Plan 0 packaging pattern exactly. ✅

**Spec §8 (testing):** `SchematicTestRunner` + `UnitTestTree` on shared `SchematicTestHarness`; assert transformed `angular.json`/`package.json`; install task scheduled but not run (assert dep entry) → Tasks 3–7. ✅

**Plan 0 API usage:** `setBuilderForTarget`, `addBuilderDevDependency`, `getProjectsToTarget`, `detectTestBuilder`, `SchematicTestHarness` — all called with Plan 0's exact signatures; none redefined. The build-builder guard reads `project.targets.get('build')?.builder` directly via a local `classifyBuildBuilder`; no new shared helper was invented (per §12.3 integration note). ✅ No cross-import of other builder packages — the webpack constants (`@angular-devkit/build-angular:browser`, `@angular-builders/custom-webpack:browser`) are plain string literals for detection, not imports. ✅

**Placeholder scan:** No TBD/TODO/"handle edge cases"; every code step shows complete code; every command has expected output. ✅

**Type consistency:** `Schema` interface (`project?`, `unitTest?`, `fromWebpack?`) defined in Task 2, used in Tasks 3b/6. Builder-name constants (`BUILD_BUILDER`, `SERVE_BUILDER`, `TEST_BUILDER`, `PACKAGE_NAME`, plus guard constants `ESBUILD_BUILD`/`WEBPACK_BUILDS`) consistent across Tasks 3–6. Inline `classifyBuildBuilder` introduced in Task 3, extended in Task 3b — no shared build-builder helper invented (Plan 0 exposes only `detectTestBuilder`). Factory export name `ngAdd` matches `collection.json` `factory: "./ng-add/index#ngAdd"`. ✅

---

## Execution Handoff

**Gated:** Requires Plan 0 merged (locks `@angular-builders/common/schematics` + `.../schematics/testing`) and the workspace green on `release/v22`. Execute after Plan 0; independent of the jest and custom-webpack builder plans (no shared state).

Two execution options:

**1. Subagent-Driven (recommended)** — fresh subagent per task, review between tasks.
**2. Inline Execution** — execute tasks in-session via superpowers:executing-plans with checkpoints.
