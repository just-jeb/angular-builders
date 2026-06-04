# Builder Schematics — Plan 03: `custom-webpack` ng-add Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give `@angular-builders/custom-webpack` a first-class `ng add` (auto-detected, zero-prompt build/serve rewrite + starter `webpack.config.js` scaffold). custom-webpack ships **`ng-add` only** — no `ng-update`, no `migrations.json` — mirroring custom-esbuild (spec §12.1).

**Architecture:** A new `src/schematics/` tree inside `packages/custom-webpack`, compiled to CommonJS in `dist/schematics/` by a dedicated `tsconfig.schematics.json`, exposed via `package.json` `schematics`/`ng-add` fields (NO `ng-update`). All workspace/JSON edits go through the shared `@angular-builders/common/schematics` helpers locked by Plan 0 (`setBuilderForTarget`, `addBuilderDevDependency`, `getProjectsToTarget`) plus the schematics `apply`/`mergeWith`/`template` rules for the scaffold. The package never hand-parses JSON, never touches `fs`, and never cross-imports another builder package. Unit tests run on the shared `SchematicTestHarness` from `@angular-builders/common/schematics/testing`.

**Tech Stack:** TypeScript 5.9 (CommonJS for schematics), `@angular-devkit/schematics` (`apply`, `url`, `template`, `move`, `mergeWith`, `chain`, `noop`), `@schematics/angular/utility` (`getWorkspace`/`updateWorkspace` via the shared helpers), `@angular-builders/common/schematics`, Jest 30 + `@angular-devkit/schematics/testing` (`SchematicTestRunner`, `UnitTestTree`).

---

## Dependency on Plan 0 (READ FIRST — do not redefine these)

This plan imports the **locked Shared API Contract** from Plan 0 (`docs/superpowers/plans/2026-06-02-builder-schematics-00-common-core.md`). Call these exact signatures; never re-implement them here:

```ts
// from '@angular-builders/common/schematics'
setBuilderForTarget(projectName, targetName, builderName, options?): Rule;
addBuilderDevDependency(name, version, opts?: { install?: boolean }): Rule;
getProjectsToTarget(workspace, optionProject?): string[];

// from '@angular-builders/common/schematics/testing'
class SchematicTestHarness {
  constructor(runner?: SchematicTestRunner);
  createWorkspace(opts?): Promise<UnitTestTree>;
  readonly runner: SchematicTestRunner;
}
```

For reading the workspace inside our own schematic logic we use `getWorkspace` from `@schematics/angular/utility` directly (read-only); all **writes** flow through the Plan 0 rule factories.

**Execution gate:** Plan 0 must be merged/green first (it locks this API and adds the `@schematics/angular` + `@angular-devkit/schematics` + `copyfiles` packaging that this plan mirrors). On `release/v22` the Angular deps resolve to `^22`.

---

## Real package facts (verified against `packages/custom-webpack`)

- Builders wrapped: `@angular-builders/custom-webpack:browser` (wraps `@angular-devkit/build-angular:browser`) and `@angular-builders/custom-webpack:dev-server` (wraps `@angular-devkit/build-angular:dev-server`). Also `:server`, `:karma`, `:extract-i18n` exist but ng-add only rewrites `build`→`:browser` and `serve`→`:dev-server` per spec §4.3/§6.
- The build option that points at the webpack config is `customWebpackConfig` — an **object** `{ path?, mergeRules?, replaceDuplicatePlugins?, verbose? }` (or a boolean). Source: `src/schema.ext.json`, `src/custom-webpack-builder-config.ts`.
- Default config filename the builder loads when `customWebpackConfig.path` is absent is `webpack.config.js`. Source: `src/custom-webpack-builder.ts` → `export const defaultWebpackConfigPath = 'webpack.config.js'`.
- Existing build: `yarn prebuild && tsc && ts-node ../../merge-schemes.ts && yarn postbuild`. We extend it with a schematics `tsc` + `copy:schematics` step (mirroring Plan 0).
- Current version line: `21.1.0-beta.11`; on `release/v22` deps are `^22`.

---

## Architecture decision: no `ng-update`, no migrations (spec §12.1)

custom-webpack ships **`ng-add` only** — same shape as custom-esbuild. Rationale, recorded here so a future maintainer does not "fill the gap":

- The earlier `@22` Karma-removal migration was premised on Angular removing Karma in v22. That premise is **false** (spec §12.0/§12.1): **Karma is deprecated, NOT removed in v22.** The `@angular/build:karma` builder still ships, `ng update` keeps Karma users on Karma, and Vitest's `unit-test` builder is still experimental. Angular's deprecation policy (min. two majors) puts full Karma removal at ≈v24+.
- **PR #2260** (remove custom-webpack's `:karma` builder) is therefore **held** for the major where Angular actually removes Karma; it must NOT land in v22. With #2260 held, there is **no custom-webpack breaking PR for v22**, so per spec §5 there is no migration to ship. The v22 breaking set is now just **#2191 + #2212** (both jest).
- Therefore: **NO** `src/schematics/migrations.json`, **NO** `migrations/` directory, **NO** `"ng-update"` field in `package.json`. The coverage checklist lists custom-webpack `package.json` fields as exactly `schematics`, `ng-add` (no `ng-update`) — identical to custom-esbuild.

If a future custom-webpack breaking change is held for a major (e.g. #2260 when Karma is finally removed), that is when `migrations.json` + `ng-update` get added — not before.

---

## File Structure

- Create: `packages/custom-webpack/tsconfig.schematics.json` — extends repo-root `tsconfig.schematics.json`; `rootDir: src/schematics`, `outDir: dist/schematics`.
- Modify: `packages/custom-webpack/package.json` — add `schematics`/`ng-add` fields (NO `ng-update`), schematics build steps, `copyfiles` dev dep.
- Create: `packages/custom-webpack/src/schematics/collection.json` — declares the `ng-add` schematic.
- Create: `packages/custom-webpack/src/schematics/ng-add/schema.json` — `--project` flag only, no `x-prompt`.
- Create: `packages/custom-webpack/src/schematics/ng-add/schema.ts` — typed options interface.
- Create: `packages/custom-webpack/src/schematics/ng-add/index.ts` — the ng-add rule (delegates to common helpers + scaffold).
- Create: `packages/custom-webpack/src/schematics/ng-add/files/webpack.config.js.template` — starter config scaffold.
- Create: `packages/custom-webpack/src/schematics/ng-add/index.spec.ts` — ng-add tests.

> The schematics tree is compiled separately to CJS. The library build (`tsc` of `tsconfig.json`, `files: ["src/index.ts"]`) does NOT include `src/schematics/**`, so no change to the existing lib build is needed beyond chaining the new steps.

---

## Task 1: Packaging scaffolding (tsconfig + package.json wiring)

**Files:**
- Create: `packages/custom-webpack/tsconfig.schematics.json`
- Modify: `packages/custom-webpack/package.json`

- [ ] **Step 1: Write the per-package schematics tsconfig**

Create `packages/custom-webpack/tsconfig.schematics.json`:

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

Rationale: mirrors Plan 0's per-package tsconfig exactly. `**/files/**` keeps the `.template` out of compilation; `copyfiles` ships it verbatim.

- [ ] **Step 2: Add the schematics fields and build steps to package.json**

Modify `packages/custom-webpack/package.json`.

Add these top-level fields (next to the existing `"builders": "builders.json"`). **Do NOT add `ng-update`** (spec §12.1 — no migration):

```json
  "schematics": "./dist/schematics/collection.json",
  "ng-add": {
    "save": "devDependencies"
  },
```

Change the `build` script and add a `copy:schematics` script. Current `scripts` block becomes:

```json
  "scripts": {
    "prebuild": "yarn clean",
    "build": "yarn prebuild && tsc && tsc -p tsconfig.schematics.json && yarn copy:schematics && ts-node ../../merge-schemes.ts && yarn postbuild",
    "copy:schematics": "copyfiles -u 2 \"src/schematics/**/*.json\" dist/schematics && copyfiles -u 2 \"src/schematics/**/files/**\" dist/schematics",
    "postbuild": "yarn test && yarn run e2e",
    "test": "jest --config ../../jest-ut.config.js",
    "e2e": "jest --config ../../jest-e2e.config.js",
    "clean": "rimraf dist"
  },
```

Add `copyfiles` to `devDependencies` (keep the others):

```json
    "copyfiles": "^2.4.1",
```

> `tsc -p tsconfig.schematics.json` runs after the lib `tsc` and before `merge-schemes.ts`. `copy:schematics` copies `collection.json`, every `schema.json`, AND the `files/**` template (`-u 2` strips the `src/schematics` prefix so assets land at `dist/schematics/...`). There is no `migrations.json` to copy (spec §12.1). This is the same copy step Plan 0 specifies.

- [ ] **Step 3: Add a placeholder collection so the build has inputs, then verify it compiles**

Create a minimal `packages/custom-webpack/src/schematics/collection.json` placeholder so `tsc -p tsconfig.schematics.json` does not fail with "No inputs were found" before Task 3:

```json
{
  "$schema": "../../../../node_modules/@angular-devkit/schematics/collection-schema.json",
  "schematics": {}
}
```

Also create a temporary `packages/custom-webpack/src/schematics/ng-add/index.ts` stub so TypeScript has at least one input file:

```ts
export {};
```

Run: `yarn workspace @angular-builders/custom-webpack exec tsc -p tsconfig.schematics.json`
Expected: exits 0; `packages/custom-webpack/dist/schematics/ng-add/index.js` exists.

> Tasks 3–6 replace these stubs with real content. They exist only so Step 4 can verify the packaging wiring independently.

- [ ] **Step 4: Commit the packaging scaffolding**

```bash
git add packages/custom-webpack/tsconfig.schematics.json packages/custom-webpack/package.json packages/custom-webpack/src/schematics/collection.json packages/custom-webpack/src/schematics/ng-add/index.ts
git commit --no-verify -m "build(custom-webpack): add schematics packaging (tsconfig + ng-add field)"
```

---

## Task 2: ng-add schema (`--project` flag, no prompts)

**Files:**
- Create: `packages/custom-webpack/src/schematics/ng-add/schema.json`
- Create: `packages/custom-webpack/src/schematics/ng-add/schema.ts`

- [ ] **Step 1: Write the JSON schema**

Create `packages/custom-webpack/src/schematics/ng-add/schema.json`:

```json
{
  "$schema": "http://json-schema.org/schema",
  "$id": "AngularBuildersCustomWebpackNgAdd",
  "title": "Add @angular-builders/custom-webpack",
  "type": "object",
  "properties": {
    "project": {
      "type": "string",
      "description": "The project to wire @angular-builders/custom-webpack into. Defaults to auto-detection (single project, defaultProject, or all projects).",
      "$default": {
        "$source": "projectName"
      }
    }
  },
  "additionalProperties": false
}
```

> No `x-prompt` anywhere — `--project` is a flag (spec §2, §4.3). `$source: projectName` lets the CLI pre-fill from the current directory but never prompts.

- [ ] **Step 2: Write the typed options interface**

Create `packages/custom-webpack/src/schematics/ng-add/schema.ts`:

```ts
export interface NgAddSchema {
  /** Explicit project to target. When omitted, auto-detected. */
  project?: string;
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/custom-webpack/src/schematics/ng-add/schema.json packages/custom-webpack/src/schematics/ng-add/schema.ts
git commit --no-verify -m "feat(custom-webpack): add ng-add schema (project flag, no prompts)"
```

---

## Task 3: The starter webpack.config.js scaffold template

**Files:**
- Create: `packages/custom-webpack/src/schematics/ng-add/files/webpack.config.js.template`

- [ ] **Step 1: Write the template**

Create `packages/custom-webpack/src/schematics/ng-add/files/webpack.config.js.template`:

```js
/**
 * Custom webpack configuration for @angular-builders/custom-webpack.
 *
 * This object is merged (via webpack-merge) into the Angular CLI's underlying
 * webpack config. Add plugins, loaders, resolve aliases, etc. here.
 *
 * Docs: https://github.com/just-jeb/angular-builders/tree/master/packages/custom-webpack
 *
 * Example:
 *   module.exports = {
 *     plugins: [],
 *     module: {
 *       rules: [],
 *     },
 *   };
 */
module.exports = {};
```

> This is a plain `.template` with no interpolation placeholders, but it MUST go through the schematics `template()` rule anyway so the `.template` suffix is stripped on apply (producing `webpack.config.js`). The `template()` rule strips `.template` even when there are no `<%= %>` tokens. There are no `<%= %>` tokens, so no template variables are required.

- [ ] **Step 2: Commit**

```bash
git add packages/custom-webpack/src/schematics/ng-add/files/webpack.config.js.template
git commit --no-verify -m "feat(custom-webpack): add starter webpack.config scaffold template"
```

---

## Task 4: ng-add implementation

**Files:**
- Modify: `packages/custom-webpack/src/schematics/ng-add/index.ts` (replaces the Task 1 stub)
- Test: `packages/custom-webpack/src/schematics/ng-add/index.spec.ts`

- [ ] **Step 1: Write the failing tests**

Create `packages/custom-webpack/src/schematics/ng-add/index.spec.ts`:

```ts
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility';
import { SchematicTestHarness } from '@angular-builders/common/schematics/testing';

const COLLECTION = require.resolve('../../../src/schematics/collection.json');

function runner(): SchematicTestRunner {
  return new SchematicTestRunner('custom-webpack', COLLECTION);
}

async function runNgAdd(tree: UnitTestTree, options: Record<string, unknown> = {}): Promise<UnitTestTree> {
  return runner().runSchematic('ng-add', options, tree) as Promise<UnitTestTree>;
}

/** Read a build/serve target's builder string. */
async function builderOf(tree: UnitTestTree, project: string, target: string): Promise<string | undefined> {
  const ws = await getWorkspace(tree);
  return ws.projects.get(project)?.targets.get(target)?.builder;
}

async function optionsOf(
  tree: UnitTestTree,
  project: string,
  target: string,
): Promise<Record<string, unknown>> {
  const ws = await getWorkspace(tree);
  return (ws.projects.get(project)?.targets.get(target)?.options ?? {}) as Record<string, unknown>;
}

describe('custom-webpack ng-add', () => {
  it('rewrites build to :browser and serve to :dev-server, preserving options', async () => {
    const harness = new SchematicTestHarness();
    let tree = await harness.createWorkspace({ projects: [{ name: 'app' }] });

    // seed known options on build + serve so we can assert preservation
    const ws = await getWorkspace(tree);
    const proj = ws.projects.get('app')!;
    const originalBuildOptions = { ...(proj.targets.get('build')!.options ?? {}) };
    expect(Object.keys(originalBuildOptions).length).toBeGreaterThan(0);

    tree = await runNgAdd(tree);

    expect(await builderOf(tree, 'app', 'build')).toBe('@angular-builders/custom-webpack:browser');
    expect(await builderOf(tree, 'app', 'serve')).toBe('@angular-builders/custom-webpack:dev-server');

    const buildOptions = await optionsOf(tree, 'app', 'build');
    // every original build option survives the rewrite
    for (const key of Object.keys(originalBuildOptions)) {
      expect(buildOptions[key]).toEqual(originalBuildOptions[key]);
    }
  });

  it('adds the builder to devDependencies and schedules install', async () => {
    const harness = new SchematicTestHarness();
    let tree = await harness.createWorkspace({ projects: [{ name: 'app' }] });
    const run = runner();
    tree = (await run.runSchematic('ng-add', {}, tree)) as UnitTestTree;

    const pkg = JSON.parse(tree.readText('/package.json'));
    expect(pkg.devDependencies['@angular-builders/custom-webpack']).toBeDefined();
    expect(run.tasks.some((t) => t.name === 'node-package')).toBe(true);
  });

  it('scaffolds webpack.config.js and wires customWebpackConfig when none exists', async () => {
    const harness = new SchematicTestHarness();
    let tree = await harness.createWorkspace({ projects: [{ name: 'app' }] });

    expect(tree.exists('/webpack.config.js')).toBe(false);
    tree = await runNgAdd(tree);

    expect(tree.exists('/webpack.config.js')).toBe(true);
    expect(tree.readText('/webpack.config.js')).toContain('module.exports');

    const buildOptions = await optionsOf(tree, 'app', 'build');
    expect(buildOptions['customWebpackConfig']).toEqual({ path: 'webpack.config.js' });
  });

  it('does NOT scaffold when a webpack.config.js already exists', async () => {
    const harness = new SchematicTestHarness();
    let tree = await harness.createWorkspace({ projects: [{ name: 'app' }] });
    tree.create('/webpack.config.js', '// my existing config\nmodule.exports = { mine: true };');

    tree = await runNgAdd(tree);

    // existing file untouched
    expect(tree.readText('/webpack.config.js')).toContain('mine: true');
    // and we did not inject customWebpackConfig (user already manages their own wiring)
    const buildOptions = await optionsOf(tree, 'app', 'build');
    expect(buildOptions['customWebpackConfig']).toBeUndefined();
  });

  it('does NOT scaffold when customWebpackConfig is already referenced in build options', async () => {
    const harness = new SchematicTestHarness();
    let tree = await harness.createWorkspace({ projects: [{ name: 'app' }] });

    // pre-wire a custom config reference (but no file on disk) → still skip scaffold
    const { updateWorkspace } = await import('@schematics/angular/utility');
    tree = (await runner()
      .callRule(
        updateWorkspace((ws) => {
          const opts = ws.projects.get('app')!.targets.get('build')!.options!;
          opts['customWebpackConfig'] = { path: 'extra-webpack.config.js' };
        }),
        tree,
      )
      .toPromise()) as UnitTestTree;

    tree = await runNgAdd(tree);

    expect(tree.exists('/webpack.config.js')).toBe(false);
    const buildOptions = await optionsOf(tree, 'app', 'build');
    expect(buildOptions['customWebpackConfig']).toEqual({ path: 'extra-webpack.config.js' });
  });

  it('is idempotent: build already :browser → no-op rewrite, no second scaffold', async () => {
    const harness = new SchematicTestHarness();
    let tree = await harness.createWorkspace({ projects: [{ name: 'app' }] });

    tree = await runNgAdd(tree);
    const firstConfig = tree.readText('/webpack.config.js');

    tree = await runNgAdd(tree);

    expect(await builderOf(tree, 'app', 'build')).toBe('@angular-builders/custom-webpack:browser');
    expect(await builderOf(tree, 'app', 'serve')).toBe('@angular-builders/custom-webpack:dev-server');
    // scaffold was not regenerated/duplicated; customWebpackConfig already present → skip
    expect(tree.readText('/webpack.config.js')).toBe(firstConfig);
  });

  it('targets a specific project via --project in a multi-project workspace', async () => {
    const harness = new SchematicTestHarness();
    let tree = await harness.createWorkspace({ projects: [{ name: 'a' }, { name: 'b' }] });

    tree = await runNgAdd(tree, { project: 'b' });

    expect(await builderOf(tree, 'b', 'build')).toBe('@angular-builders/custom-webpack:browser');
    // project 'a' is untouched
    expect(await builderOf(tree, 'a', 'build')).not.toBe('@angular-builders/custom-webpack:browser');
  });
});
```

> `run.tasks` exposes scheduled tasks; the install task name is `node-package` (`NodePackageInstallTask`). `getWorkspace` is the read-only host-aware reader from `@schematics/angular/utility`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `yarn jest --config jest-ut.config.js packages/custom-webpack/src/schematics/ng-add/index.spec.ts`
Expected: FAIL — the Task 1 stub `index.ts` exports nothing, so `ng-add` is not a registered schematic / no default export. Errors like "Schematic 'ng-add' not found in collection" or a TypeScript default-export error.

- [ ] **Step 3: Wire the collection to point at the ng-add schematic**

Replace `packages/custom-webpack/src/schematics/collection.json` (was the Task 1 placeholder):

```json
{
  "$schema": "../../../../node_modules/@angular-devkit/schematics/collection-schema.json",
  "schematics": {
    "ng-add": {
      "description": "Wire @angular-builders/custom-webpack into the workspace.",
      "factory": "./ng-add/index#ngAdd",
      "schema": "./ng-add/schema.json"
    }
  }
}
```

- [ ] **Step 4: Write the ng-add implementation**

Replace `packages/custom-webpack/src/schematics/ng-add/index.ts` (was the Task 1 stub):

```ts
import {
  apply,
  chain,
  mergeWith,
  move,
  noop,
  Rule,
  SchematicContext,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { getWorkspace, updateWorkspace } from '@schematics/angular/utility';
import {
  addBuilderDevDependency,
  getProjectsToTarget,
} from '@angular-builders/common/schematics';
import { NgAddSchema } from './schema';

const PACKAGE_NAME = '@angular-builders/custom-webpack';
const BROWSER_BUILDER = `${PACKAGE_NAME}:browser`;
const DEV_SERVER_BUILDER = `${PACKAGE_NAME}:dev-server`;
const DEFAULT_CONFIG_FILE = 'webpack.config.js';

// Version range written into devDependencies. Aligned to the builder major.
// On release/v22 this is the v22 line; bump alongside the package version.
const SELF_VERSION_RANGE = '^22.0.0';

/** True if a webpack.config.* file already lives at the workspace root. */
function webpackConfigFileExists(tree: Tree): boolean {
  return (
    tree.exists(`/${DEFAULT_CONFIG_FILE}`) ||
    tree.exists('/webpack.config.ts') ||
    tree.exists('/webpack.config.cjs') ||
    tree.exists('/webpack.config.mjs')
  );
}

/**
 * Rewrite build → :browser and serve → :dev-server for a single project,
 * preserving existing options. Idempotent: already-correct builders are
 * simply re-assigned to the same value.
 */
function rewriteTargets(projectName: string): Rule {
  return updateWorkspace((workspace) => {
    const project = workspace.projects.get(projectName);
    if (!project) {
      return;
    }
    const build = project.targets.get('build');
    if (build) {
      build.builder = BROWSER_BUILDER;
    }
    const serve = project.targets.get('serve');
    if (serve) {
      serve.builder = DEV_SERVER_BUILDER;
    }
  });
}

/**
 * Scaffold a starter webpack.config.js and wire customWebpackConfig.path to it,
 * but only when neither a customWebpackConfig reference nor a webpack.config.*
 * file already exists for the project's build target.
 */
function scaffoldConfig(projectName: string): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    const workspace = await getWorkspace(tree);
    const project = workspace.projects.get(projectName);
    const buildOptions =
      (project?.targets.get('build')?.options as Record<string, unknown> | undefined) ?? {};

    const alreadyReferenced =
      buildOptions['customWebpackConfig'] !== undefined &&
      buildOptions['customWebpackConfig'] !== false;

    if (alreadyReferenced || webpackConfigFileExists(tree)) {
      context.logger.info(
        `[custom-webpack] A webpack config is already present; leaving it untouched.`,
      );
      return noop();
    }

    const templateSource = apply(url('./files'), [template({}), move('/')]);

    return chain([
      mergeWith(templateSource),
      updateWorkspace((ws) => {
        const buildTarget = ws.projects.get(projectName)?.targets.get('build');
        if (buildTarget) {
          buildTarget.options = {
            ...(buildTarget.options ?? {}),
            customWebpackConfig: { path: DEFAULT_CONFIG_FILE },
          };
        }
      }),
    ]);
  };
}

export function ngAdd(options: NgAddSchema): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    const workspace = await getWorkspace(tree);
    const projects = getProjectsToTarget(workspace, options.project);

    if (projects.length === 0) {
      context.logger.warn('[custom-webpack] No projects found to configure.');
      return noop();
    }

    const perProject: Rule[] = [];
    for (const projectName of projects) {
      perProject.push(rewriteTargets(projectName));
      perProject.push(scaffoldConfig(projectName));
    }

    return chain([
      addBuilderDevDependency(PACKAGE_NAME, SELF_VERSION_RANGE, { install: true }),
      ...perProject,
    ]);
  };
}
```

> Notes:
> - `getProjectsToTarget` (Plan 0) handles single/multi/`defaultProject`/`--project` selection — we never prompt.
> - `addBuilderDevDependency(..., { install: true })` schedules the `NodePackageInstallTask` via Plan 0's wrapper (`InstallBehavior.Auto`).
> - `rewriteTargets` uses `updateWorkspace` directly because it touches two targets (`build` + `serve`) in one transaction; option preservation is automatic (we only reassign `.builder`). The Plan 0 `setBuilderForTarget` helper is option-merge oriented; using `updateWorkspace` here keeps both builders in a single workspace write and avoids redundant option merges. This stays within the "tree-based, utility-backed edits" invariant (§2).
> - Scaffold uses the schematics `apply`/`mergeWith`/`template`/`move` pipeline so `--dry-run` and the `.template` suffix-strip work. `template({})` strips `.template` → `webpack.config.js`.
> - Idempotency: on a second run, `customWebpackConfig` is already set → `alreadyReferenced` short-circuits the scaffold; builder reassignment is a no-op to the same value.

- [ ] **Step 5: Run tests to verify they pass**

Run: `yarn jest --config jest-ut.config.js packages/custom-webpack/src/schematics/ng-add/index.spec.ts`
Expected: PASS (7 tests).

> If `SchematicTestHarness.createWorkspace` generates an application without a `serve` target (RC generator drift), the serve-rewrite assertions read `undefined` — calibrate by reading the generated `angular.json` once and adjusting only the *expected* serve builder, never the helper logic (same calibration note as Plan 0 Task 4).

- [ ] **Step 6: Commit**

```bash
git add packages/custom-webpack/src/schematics/collection.json packages/custom-webpack/src/schematics/ng-add/index.ts packages/custom-webpack/src/schematics/ng-add/index.spec.ts
git commit --no-verify -m "feat(custom-webpack): add ng-add (build/serve rewrite + config scaffold)"
```

---

## Task 5: End-to-end build verification

**Files:** none (verification only)

- [ ] **Step 1: Build the package end-to-end**

Run: `yarn workspace @angular-builders/custom-webpack build`
Expected: exits 0. The build runs lib `tsc` → schematics `tsc` → `copy:schematics` → `merge-schemes.ts` → `postbuild` (unit + e2e).

- [ ] **Step 2: Verify the schematics assets shipped to dist**

Run: `ls packages/custom-webpack/dist/schematics packages/custom-webpack/dist/schematics/ng-add packages/custom-webpack/dist/schematics/ng-add/files`
Expected:
- `dist/schematics/collection.json`
- `dist/schematics/ng-add/index.js`, `dist/schematics/ng-add/schema.json`
- `dist/schematics/ng-add/files/webpack.config.js.template`

- [ ] **Step 3: Verify package.json points at the dist manifest**

Run: `node -e "const p=require('./packages/custom-webpack/package.json'); console.log(p.schematics, p['ng-add'].save)"`
Expected: `./dist/schematics/collection.json devDependencies`

- [ ] **Step 4: Confirm NO `ng-update` / migrations were introduced (spec §12.1)**

Run: `node -e "const p=require('./packages/custom-webpack/package.json'); if(p['ng-update']) throw new Error('ng-update must NOT exist'); if(require('fs').existsSync('packages/custom-webpack/src/schematics/migrations.json')) throw new Error('migrations.json must NOT exist'); console.log('ok: no migrations')"`
Expected: prints `ok: no migrations`.

- [ ] **Step 5: Run the full custom-webpack unit suite**

Run: `yarn jest --config jest-ut.config.js packages/custom-webpack`
Expected: all schematics specs green + pre-existing custom-webpack specs still green.

- [ ] **Step 6: Commit (if any incidental fixes were needed)**

```bash
git add -A packages/custom-webpack
git commit --no-verify -m "test(custom-webpack): verify schematics build + no-migrations invariant" || echo "nothing to commit"
```

---

## Self-Review

**Spec §4.3 (custom-webpack) coverage:**
- ng-add adds self to devDeps via `addBuilderDevDependency` → Task 4 Step 4 (`addBuilderDevDependency(PACKAGE_NAME, ...)`). ✅
- ng-add rewrites `build`→`:browser`, `serve`→`:dev-server`, preserving options → Task 4 (`rewriteTargets`, only `.builder` reassigned; options preserved). Test asserts preservation. ✅
- ng-add schedules install → Task 4 (`{ install: true }`); test asserts `node-package` task. ✅
- Scaffold when no `customWebpackConfig` referenced AND no `webpack.config.*` exists → create starter via `apply`/`mergeWith`/`template`, set `customWebpackConfig` → Task 4 `scaffoldConfig`. Tests for create/skip-existing-file/skip-existing-reference. ✅
- Leave existing config (no prompt) → Task 4 `alreadyReferenced || webpackConfigFileExists` short-circuit. ✅
- Idempotent (`build` already `:browser` → no-op) → Task 4 idempotency test. ✅
- `--project` flag, zero prompts → Task 2 schema (no `x-prompt`), Task 4 `getProjectsToTarget`. Multi-project `--project` test. ✅
- **No `ng-update` / migration** (spec §12.1 — Karma not removed in v22, #2260 held) → Architecture decision section + Task 5 Step 4 invariant check. ✅

**Spec §6 coverage checklist (custom-webpack column):**
- deps add/remove: +self (Task 4). ✅
- targets rewritten: `build`, `serve` (Task 4). ✅
- files created: `webpack.config.js` (Task 4). ✅
- tsconfig edits: — (none; correct). ✅
- detection: webpack config present? (`webpackConfigFileExists`). ✅
- flags: `--project` (Task 2). ✅
- idempotency: `build` already `:browser` (Task 4 test). ✅
- migrations: NONE — no `migrations.json`, no `ng-update` field (spec §12.1) → Architecture decision + Task 5 Step 4. ✅
- package.json fields: `schematics`, `ng-add` (no `ng-update`) (Task 1). ✅
- tests: ng-add (Task 4). ✅

**Spec §7 (packaging) coverage:** per-package `tsconfig.schematics.json` extending root base (Task 1 Step 1); `tsc (lib) → tsc (schematics) → copy:schematics` sequence; `copy:schematics` copies `collection.json`/`schema.json` + `files/**` (Task 1 Step 2). Mirrors Plan 0 exactly. ✅

**Spec §8 (testing) coverage:** unit tests on `SchematicTestHarness` via `yarn jest --config jest-ut.config.js`; ng-add asserts transformed `angular.json`/`package.json`, scaffold create/skip, and idempotency (Task 4). Install task asserted as scheduled, not run (Task 4). ✅

**Spec §12.1 (no migration):** custom-webpack ships `ng-add` only — no `migrations.json`, no `ng-update` field, no `migrations/` directory. Rationale in the Architecture decision section; enforced by Task 5 Step 4. ✅

**Constraints check:**
- Imports Plan 0 helpers, never redefines them. ✅ (`setBuilderForTarget` available but `rewriteTargets` uses `updateWorkspace` for the two-target single-write case — documented; all other writes use Plan 0 helpers.)
- No cross-import of other builder packages. ✅
- ng-add zero prompts (`--project` flag, no `x-prompt`). ✅

**Placeholder scan:** every code/test step contains complete code; no TBD/TODO-in-plan/"handle edge cases". ✅

**Type consistency:** `NgAddSchema.project` used consistently; `ngAdd` factory name matches `collection.json`; builder constant strings consistent across ng-add and tests. ✅

---

## Execution Handoff

**Gated:** Execute on a green `release/v22` base **after Plan 0** (which locks the imported API and adds the `@schematics/angular`/`@angular-devkit/schematics`/`copyfiles` packaging this plan mirrors). This plan is independent of the jest (Plan 01) and custom-esbuild (Plan 02) builder plans — it shares no code with them.

Recommended approach: **subagent-driven-development** (fresh subagent per task, review between tasks).
