# Builder Schematics — Plan 01: `@angular-builders/jest` ng-add + Migrations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `@angular-builders/jest` schematics — a zero-prompt `ng add` that wires Jest into a workspace (replacing Karma when detected) and two `ng update` migrations (`@21` heavy auto-transform; `@22` advisory-only) — plus the per-package packaging that exposes them to the Angular CLI.

**Architecture:** A new `src/schematics/` tree inside `packages/jest`, compiled to CommonJS in `dist/schematics/` by a dedicated `tsconfig.schematics.json` (mirrors Plan 0's pattern). The `ng-add` and migration entry points are thin `chain([...])` rules that delegate all workspace/JSON/dependency edits to the shared helpers locked by Plan 0 (`@angular-builders/common/schematics`) — never raw `fs` or hand-parsed JSON. Migrations run headless (Renovate/CI): no prompts, only `context.logger` advisories, safe detected defaults. `package.json` gains `schematics`/`ng-add`/`ng-update` fields pointing at the copied dist manifests.

**Tech Stack:** TypeScript 5.9 (CommonJS for schematics), `@angular-devkit/schematics`, `@schematics/angular/utility`, `@angular-builders/common/schematics` (Plan 0 helpers), Jest 30 + `@angular-devkit/schematics/testing` (`SchematicTestRunner`, `UnitTestTree`) driven through `SchematicTestHarness` from `@angular-builders/common/schematics/testing`.

---

## Dependency on Plan 0 (do not redefine)

This plan **imports** the following from `@angular-builders/common/schematics` (signatures locked by Plan 0 — never reimplement them here):

```ts
import {
  setBuilderForTarget,      // (project, target, builder, options?) => Rule
  addBuilderDevDependency,  // (name, version, { install? }) => Rule
  removeDevDependencies,    // (names: string[]) => Rule
  removeFilesIfPresent,     // (paths: string[]) => Rule
  editJsonFile,             // (path, (json: JSONFile) => void) => Rule
  getProjectsToTarget,      // (workspace, optionProject?) => string[]
  detectTestBuilder,        // (workspace, projectName) => TestBuilderKind
  isZoneless,               // (tree, workspace, projectName) => boolean
} from '@angular-builders/common/schematics';
import { SchematicTestHarness } from '@angular-builders/common/schematics/testing';
```

`parseVersion`/`isAtLeast` are also available from the same barrel if needed; this plan does not require them (migrations are version-gated by `migrations.json` thresholds, not by runtime version parsing).

`readWorkspace`/`updateWorkspace` come from `@schematics/angular/utility`; `JSONFile` from `@schematics/angular/utility/json-file`.

**Gating:** Plan 0 must be merged/green first (it locks the `@angular-builders/common/schematics` API and packaging). Execute this plan on a base where `yarn workspace @angular-builders/common build` produces `dist/schematics/`.

---

## File Structure

- Create: `packages/jest/tsconfig.schematics.json` — extends root `tsconfig.schematics.json`; `rootDir: src/schematics`, `outDir: dist/schematics`.
- Modify: `packages/jest/package.json` — add `schematics`/`ng-add`/`ng-update` fields, schematics deps, `copy:schematics` build step, wire into `build`.
- Create: `packages/jest/src/schematics/collection.json` — declares the `ng-add` schematic.
- Create: `packages/jest/src/schematics/ng-add/schema.json` — `--project` flag only, no `x-prompt`.
- Create: `packages/jest/src/schematics/ng-add/schema.ts` — TS interface for the ng-add options.
- Create: `packages/jest/src/schematics/ng-add/index.ts` + `index.spec.ts` — the ng-add rule.
- Create: `packages/jest/src/schematics/migrations.json` — declares `@21` and `@22` migrations with semver thresholds.
- Create: `packages/jest/src/schematics/migrations/v21/index.ts` + `index.spec.ts` — heavy auto-transform.
- Create: `packages/jest/src/schematics/migrations/v22/index.ts` + `index.spec.ts` — advisory-only.

> **Version pin convention:** dependency versions added by `ng-add` and bumped by migrations are written as caret/tilde range strings (e.g. `^30.0.0`). The jest builder's own version added to `devDependencies` tracks the Angular major (v22). Use the literal strings shown in each step.

---

## Task 1: Packaging scaffolding (tsconfig + package.json wiring)

**Files:**
- Create: `packages/jest/tsconfig.schematics.json`
- Modify: `packages/jest/package.json`

- [ ] **Step 1: Write the per-package schematics tsconfig**

Create `packages/jest/tsconfig.schematics.json`:

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

Rationale: mirrors Plan 0's `packages/common/tsconfig.schematics.json` exactly. Angular loads schematics as CommonJS; the root base sets `module: "commonjs"`. Specs and `files/**` templates are excluded from compilation.

- [ ] **Step 2: Wire jest's package.json (fields, deps, build step)**

Modify `packages/jest/package.json`.

Add these top-level fields (next to the existing `"builders": "builders.json"` line):

```json
"schematics": "./dist/schematics/collection.json",
"ng-add": { "save": "devDependencies" },
"ng-update": { "migrations": "./dist/schematics/migrations.json" },
```

Add to `dependencies` (alongside `@angular-builders/common`):

```json
"@angular-devkit/schematics": "^22.0.0",
"@schematics/angular": "^22.0.0",
```

Add to `devDependencies`:

```json
"copyfiles": "^2.4.1",
```

Change the `build` and add a `copy:schematics` script. The current scripts are:

```json
"build": "yarn prebuild && tsc -p tsconfig.lib.json && yarn postbuild",
"postbuild": "yarn copy && yarn test",
```

Replace `build` and add `copy:schematics` so the sequence is `lib tsc → schematics tsc → copy schematics assets → existing postbuild`:

```json
"build": "yarn prebuild && tsc -p tsconfig.lib.json && tsc -p tsconfig.schematics.json && yarn copy:schematics && yarn postbuild",
"copy:schematics": "copyfiles -u 2 \"src/schematics/**/*.json\" dist/schematics && copyfiles -u 2 \"src/schematics/**/files/**\" dist/schematics",
```

> `tsc` does not emit `.json` (collection/migration manifests, ng-add schema) or `files/**` templates — `copyfiles` does. `-u 2` strips the `src/schematics` prefix so assets land at `dist/schematics/...` (e.g. `src/schematics/collection.json` → `dist/schematics/collection.json`). The existing `cpy` `copy` step (builder `schema.json`) is unchanged; it runs inside `postbuild`.

> Why both `@angular-devkit/schematics` and `@schematics/angular` in `dependencies`: the migration/ng-add code imports `Rule`, `chain`, `SchematicContext` (from the former) and `readWorkspace`/`updateWorkspace`/`JSONFile` (from the latter) at runtime when the Angular CLI executes the schematics. They are not test-only.

- [ ] **Step 3: Add a placeholder so the schematics tsconfig compiles**

The schematics tsconfig will error with "No inputs were found" until Task 2 adds real files. Create a temporary placeholder so Step 4 can verify the build wiring now:

Create `packages/jest/src/schematics/index.ts`:

```ts
export {};
```

> This file is kept harmlessly; the collection/migration entry points are separate files. It guarantees `tsc -p tsconfig.schematics.json` has at least one input.

- [ ] **Step 4: Verify the build wiring compiles**

Run: `yarn workspace @angular-builders/jest build`
Expected: completes without error; produces `packages/jest/dist/schematics/index.js`. (The builder `dist/index.js`, `dist/schema.json`, and the existing unit suite from `postbuild` also run — all green.)

If `postbuild`'s `yarn test` is slow or noisy during iteration, you may run the schematics-only compile directly to check wiring:
Run: `yarn workspace @angular-builders/jest exec tsc -p tsconfig.schematics.json`
Expected: no output, exit 0.

- [ ] **Step 5: Commit**

```bash
git add packages/jest/tsconfig.schematics.json packages/jest/package.json packages/jest/src/schematics/index.ts
git commit -m "build(jest): add schematics packaging (tsconfig + fields + copy)"
```

---

## Task 2: `ng-add` schema + collection (no behavior yet)

**Files:**
- Create: `packages/jest/src/schematics/collection.json`
- Create: `packages/jest/src/schematics/ng-add/schema.json`
- Create: `packages/jest/src/schematics/ng-add/schema.ts`

- [ ] **Step 1: Write the collection manifest**

Create `packages/jest/src/schematics/collection.json`:

```json
{
  "$schema": "../../../node_modules/@angular-devkit/schematics/collection-schema.json",
  "schematics": {
    "ng-add": {
      "description": "Set up @angular-builders/jest as the ng test runner.",
      "factory": "./ng-add/index#ngAdd",
      "schema": "./ng-add/schema.json"
    }
  }
}
```

> `factory` is dist-relative at runtime (`./ng-add/index` resolves to `dist/schematics/ng-add/index.js`). `#ngAdd` is the exported rule factory (defined in Task 3).

- [ ] **Step 2: Write the ng-add JSON schema (—project only, no x-prompt)**

Create `packages/jest/src/schematics/ng-add/schema.json`:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema",
  "$id": "JestNgAddSchema",
  "title": "@angular-builders/jest ng-add options",
  "type": "object",
  "properties": {
    "project": {
      "type": "string",
      "description": "The project to set up Jest for. Defaults to all projects (or the default project) when omitted.",
      "$default": {
        "$source": "projectName"
      }
    }
  },
  "additionalProperties": false
}
```

> No `x-prompt` anywhere (spec §2/§4.1: zero prompts). `$default.$source: projectName` lets the CLI pre-fill `--project` from the workspace default; it is still optional. `getProjectsToTarget` (Plan 0) handles the omitted-and-multi-project case by targeting all projects.

- [ ] **Step 3: Write the TS options interface**

Create `packages/jest/src/schematics/ng-add/schema.ts`:

```ts
export interface NgAddOptions {
  project?: string;
}
```

> Hand-authored (not quicktype). The MUST-NEVER list covers `packages/jest/src/schema.ts` (the builder schema); this is a different file under `src/schematics/` and is not quicktype-generated.

- [ ] **Step 4: Verify the schematics tsconfig still compiles**

Run: `yarn workspace @angular-builders/jest exec tsc -p tsconfig.schematics.json`
Expected: no output, exit 0 (`schema.ts` compiles; JSON files are not compiled by tsc).

- [ ] **Step 5: Commit**

```bash
git add packages/jest/src/schematics/collection.json packages/jest/src/schematics/ng-add/schema.json packages/jest/src/schematics/ng-add/schema.ts
git commit -m "feat(jest): add ng-add collection + schema (project flag only)"
```

---

## Task 3: `ng-add` — add jest stack + rewrite test target (no-Karma branch)

Start with the simplest branch: a workspace with no Karma. ng-add must add the jest devDeps, rewrite `test` → `@angular-builders/jest:run`, set `zoneless` to match detection, and schedule install.

**Files:**
- Create: `packages/jest/src/schematics/ng-add/index.ts`
- Test: `packages/jest/src/schematics/ng-add/index.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/jest/src/schematics/ng-add/index.spec.ts`:

```ts
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { readWorkspace, updateWorkspace } from '@schematics/angular/utility';
import { SchematicTestHarness } from '@angular-builders/common/schematics/testing';

const COLLECTION = require.resolve('../../../src/schematics/collection.json');

function runner(): SchematicTestRunner {
  return new SchematicTestRunner('jest', COLLECTION);
}

describe('jest ng-add (no Karma)', () => {
  it('adds the jest stack to devDependencies and schedules install', async () => {
    const tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    const r = runner();
    const out = (await r.runSchematic('ng-add', {}, tree)) as UnitTestTree;

    const pkg = JSON.parse(out.readText('/package.json'));
    expect(pkg.devDependencies['@angular-builders/jest']).toBeDefined();
    expect(pkg.devDependencies['jest']).toBeDefined();
    expect(pkg.devDependencies['jest-preset-angular']).toBeDefined();
    expect(pkg.devDependencies['jest-environment-jsdom']).toBeDefined();
    // install scheduled (a NodePackageInstallTask was queued)
    expect(r.tasks.length).toBeGreaterThan(0);
  });

  it('rewrites the test target to @angular-builders/jest:run', async () => {
    let tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    // ensure a non-jest test target exists to rewrite
    await runner()
      .callRule(
        updateWorkspace((ws) => {
          ws.projects.get('app')!.targets.set('test', {
            builder: '@angular-devkit/build-angular:karma',
            options: {},
          });
        }),
        tree,
      )
      .forEach((t) => (tree = t as UnitTestTree));

    const out = (await runner().runSchematic('ng-add', {}, tree)) as UnitTestTree;
    const ws = await readWorkspace(out);
    expect(ws.projects.get('app')!.targets.get('test')!.builder).toBe(
      '@angular-builders/jest:run',
    );
  });

  it('sets zoneless to match detection (zoneless workspace → true)', async () => {
    const tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    const out = (await runner().runSchematic('ng-add', {}, tree)) as UnitTestTree;
    const ws = await readWorkspace(out);
    const opts = ws.projects.get('app')!.targets.get('test')!.options as Record<string, unknown>;
    expect(opts['zoneless']).toBe(true);
  });
});
```

> The harness builds a modern (zoneless) application by default, so detection yields `zoneless: true`. The zone-based branch is tested in Task 5. `r.tasks` exposes scheduled tasks on the runner (NodePackageInstallTask).

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn jest --config jest-ut.config.js packages/jest/src/schematics/ng-add/index.spec.ts`
Expected: FAIL — the factory `./ng-add/index` referenced by `collection.json` cannot resolve (`Cannot find module './index'` / `ngAdd is not a function`).

- [ ] **Step 3: Write minimal implementation**

Create `packages/jest/src/schematics/ng-add/index.ts`:

```ts
import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { readWorkspace } from '@schematics/angular/utility';
import {
  addBuilderDevDependency,
  getProjectsToTarget,
  isZoneless,
  setBuilderForTarget,
} from '@angular-builders/common/schematics';
import { NgAddOptions } from './schema';

const JEST_BUILDER = '@angular-builders/jest:run';

// Versions of the jest stack added on install. Kept here (not the builder
// schema) because these are dev-tooling versions, independent of builder options.
const JEST_STACK: Array<[name: string, version: string]> = [
  ['@angular-builders/jest', '^22.0.0'],
  ['jest', '^30.0.0'],
  ['jest-preset-angular', '^16.0.0'],
  ['jest-environment-jsdom', '^30.0.0'],
];

export function ngAdd(options: NgAddOptions): Rule {
  return async (tree: Tree, _context: SchematicContext) => {
    const workspace = await readWorkspace(tree);
    const projects = getProjectsToTarget(workspace, options.project);

    const rules: Rule[] = [];

    // Add the jest stack to devDependencies. The last add schedules install
    // (InstallBehavior.Auto); earlier adds skip install to avoid duplicate tasks.
    JEST_STACK.forEach(([name, version], i) => {
      rules.push(addBuilderDevDependency(name, version, { install: i === JEST_STACK.length - 1 }));
    });

    for (const projectName of projects) {
      const zoneless = isZoneless(tree, workspace, projectName);
      rules.push(setBuilderForTarget(projectName, 'test', JEST_BUILDER, { zoneless }));
    }

    return chain(rules);
  };
}
```

> `addBuilderDevDependency` with `install: false` adds the dep without queuing a task; the final entry uses `install: true` (default Auto) so exactly one `NodePackageInstallTask` is scheduled. `setBuilderForTarget` rewrites the existing `test` target's builder and merges `{ zoneless }` into its options (Plan 0 semantics: existing options preserved). Karma cleanup is added in Task 4.

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn jest --config jest-ut.config.js packages/jest/src/schematics/ng-add/index.spec.ts`
Expected: PASS (3 tests).

> If `runSchematic('ng-add', ...)` cannot resolve `@angular-builders/common/schematics` because `common`'s `dist/schematics` isn't built, run `yarn workspace @angular-builders/common build` first (Plan 0 output) and re-run. The unit test imports the helper from the built/linked subpath.

- [ ] **Step 5: Commit**

```bash
git add packages/jest/src/schematics/ng-add/index.ts packages/jest/src/schematics/ng-add/index.spec.ts
git commit -m "feat(jest): ng-add adds jest stack and rewrites test target"
```

---

## Task 4: `ng-add` — Karma removal branch

When Karma is detected, ng-add must additionally remove karma/jasmine devDeps, delete `karma.conf.js` + `src/test.ts`, and fix `tsconfig.spec.json` (types jasmine→jest, drop `test.ts` from `files`).

**Files:**
- Modify: `packages/jest/src/schematics/ng-add/index.ts`
- Test: `packages/jest/src/schematics/ng-add/index.spec.ts` (add a describe block)

- [ ] **Step 1: Write the failing test**

Append to `packages/jest/src/schematics/ng-add/index.spec.ts`:

```ts
describe('jest ng-add (Karma present)', () => {
  async function karmaWorkspace(): Promise<UnitTestTree> {
    let tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    await runner()
      .callRule(
        updateWorkspace((ws) => {
          ws.projects.get('app')!.targets.set('test', {
            builder: '@angular-devkit/build-angular:karma',
            options: { polyfills: ['zone.js', 'zone.js/testing'] },
          });
        }),
        tree,
      )
      .forEach((t) => (tree = t as UnitTestTree));

    // seed karma/jasmine devDeps + files + a jasmine spec tsconfig
    const pkg = JSON.parse(tree.readText('/package.json'));
    pkg.devDependencies = {
      ...(pkg.devDependencies ?? {}),
      karma: '^6.4.0',
      'karma-chrome-launcher': '^3.2.0',
      'karma-jasmine': '^5.1.0',
      jasmine: '^5.1.0',
      'jasmine-core': '^5.1.0',
      '@types/jasmine': '^5.1.0',
    };
    tree.overwrite('/package.json', JSON.stringify(pkg, null, 2));
    tree.create('/karma.conf.js', '// karma config');
    tree.create('/src/test.ts', '// karma entry');
    tree.create(
      '/tsconfig.spec.json',
      JSON.stringify(
        { compilerOptions: { types: ['jasmine'] }, files: ['src/test.ts', 'src/polyfills.ts'] },
        null,
        2,
      ),
    );
    return tree;
  }

  it('removes karma/jasmine devDependencies', async () => {
    const out = (await runner().runSchematic('ng-add', {}, await karmaWorkspace())) as UnitTestTree;
    const pkg = JSON.parse(out.readText('/package.json'));
    for (const dep of [
      'karma',
      'karma-chrome-launcher',
      'karma-jasmine',
      'jasmine',
      'jasmine-core',
      '@types/jasmine',
    ]) {
      expect(pkg.devDependencies[dep]).toBeUndefined();
    }
  });

  it('deletes karma.conf.js and src/test.ts', async () => {
    const out = (await runner().runSchematic('ng-add', {}, await karmaWorkspace())) as UnitTestTree;
    expect(out.exists('/karma.conf.js')).toBe(false);
    expect(out.exists('/src/test.ts')).toBe(false);
  });

  it('fixes tsconfig.spec.json (types jasmine→jest, drops test.ts)', async () => {
    const out = (await runner().runSchematic('ng-add', {}, await karmaWorkspace())) as UnitTestTree;
    const cfg = JSON.parse(out.readText('/tsconfig.spec.json'));
    expect(cfg.compilerOptions.types).toEqual(['jest']);
    expect(cfg.files).toEqual(['src/polyfills.ts']);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn jest --config jest-ut.config.js packages/jest/src/schematics/ng-add/index.spec.ts`
Expected: FAIL — the new describe block fails (karma deps still present, files not deleted, tsconfig unchanged).

- [ ] **Step 3: Write minimal implementation**

Replace the contents of `packages/jest/src/schematics/ng-add/index.ts` with:

```ts
import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { JSONFile } from '@schematics/angular/utility/json-file';
import { readWorkspace } from '@schematics/angular/utility';
import {
  addBuilderDevDependency,
  detectTestBuilder,
  editJsonFile,
  getProjectsToTarget,
  isZoneless,
  removeDevDependencies,
  removeFilesIfPresent,
  setBuilderForTarget,
} from '@angular-builders/common/schematics';
import { NgAddOptions } from './schema';

const JEST_BUILDER = '@angular-builders/jest:run';

const JEST_STACK: Array<[name: string, version: string]> = [
  ['@angular-builders/jest', '^22.0.0'],
  ['jest', '^30.0.0'],
  ['jest-preset-angular', '^16.0.0'],
  ['jest-environment-jsdom', '^30.0.0'],
];

const KARMA_DEVDEPS = [
  'karma',
  'karma-chrome-launcher',
  'karma-coverage',
  'karma-jasmine',
  'karma-jasmine-html-reporter',
  'jasmine',
  'jasmine-core',
  '@types/jasmine',
];

const KARMA_FILES = ['karma.conf.js', 'src/test.ts'];

function hasKarma(tree: Tree, workspace: Awaited<ReturnType<typeof readWorkspace>>): boolean {
  // 1. any project's test builder is karma
  for (const name of workspace.projects.keys()) {
    if (detectTestBuilder(workspace, name) === 'karma') return true;
  }
  // 2. a karma config file exists at the workspace root
  if (tree.exists('/karma.conf.js') || tree.exists('/karma.conf.ts')) return true;
  // 3. karma/jasmine present in devDependencies
  if (tree.exists('/package.json')) {
    const pkg = JSON.parse(tree.readText('/package.json'));
    const dev = pkg.devDependencies ?? {};
    if (dev['karma'] || dev['jasmine'] || dev['jasmine-core']) return true;
  }
  return false;
}

function fixSpecTsconfig(path: string): Rule {
  return editJsonFile(path, (json: JSONFile) => {
    const types = json.get(['compilerOptions', 'types']);
    if (Array.isArray(types)) {
      const next = types.filter((t) => t !== 'jasmine');
      if (!next.includes('jest')) next.push('jest');
      json.modify(['compilerOptions', 'types'], next);
    }
    const files = json.get(['files']);
    if (Array.isArray(files)) {
      json.modify(
        ['files'],
        files.filter((f) => f !== 'src/test.ts' && f !== 'test.ts'),
      );
    }
  });
}

export function ngAdd(options: NgAddOptions): Rule {
  return async (tree: Tree, _context: SchematicContext) => {
    const workspace = await readWorkspace(tree);
    const projects = getProjectsToTarget(workspace, options.project);

    const rules: Rule[] = [];

    JEST_STACK.forEach(([name, version], i) => {
      rules.push(addBuilderDevDependency(name, version, { install: i === JEST_STACK.length - 1 }));
    });

    for (const projectName of projects) {
      const zoneless = isZoneless(tree, workspace, projectName);
      rules.push(setBuilderForTarget(projectName, 'test', JEST_BUILDER, { zoneless }));
    }

    if (hasKarma(tree, workspace)) {
      rules.push(removeDevDependencies(KARMA_DEVDEPS));
      rules.push(removeFilesIfPresent(KARMA_FILES.map((f) => `/${f}`)));
      // fix every project's spec tsconfig + a root-level one if present
      const specPaths = new Set<string>(['/tsconfig.spec.json']);
      for (const projectName of projects) {
        const root = workspace.projects.get(projectName)?.root ?? '';
        specPaths.add(root ? `/${root}/tsconfig.spec.json` : '/tsconfig.spec.json');
      }
      for (const specPath of specPaths) {
        rules.push(fixSpecTsconfig(specPath));
      }
    }

    return chain(rules);
  };
}
```

> `removeFilesIfPresent`/`removeDevDependencies`/`editJsonFile` are all guarded no-ops when targets are absent (Plan 0), keeping the rule safe across workspace shapes. `fixSpecTsconfig` removes `jasmine` from `types`, ensures `jest` present, and drops `src/test.ts`/`test.ts` from `files`. `JSONFile.get`/`.modify` operate on the tree directly.

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn jest --config jest-ut.config.js packages/jest/src/schematics/ng-add/index.spec.ts`
Expected: PASS (all describe blocks — no-Karma from Task 3 + Karma-present).

- [ ] **Step 5: Commit**

```bash
git add packages/jest/src/schematics/ng-add/index.ts packages/jest/src/schematics/ng-add/index.spec.ts
git commit -m "feat(jest): ng-add removes Karma and fixes spec tsconfig when detected"
```

---

## Task 5: `ng-add` — zoneless detection (zone branch) + idempotency

Cover the zone-based detection branch (`zoneless: false`) and idempotency (re-running when `test` is already `:run` is a no-op rewrite).

**Files:**
- Test: `packages/jest/src/schematics/ng-add/index.spec.ts` (add a describe block)
- Modify: `packages/jest/src/schematics/ng-add/index.ts` (only if a test fails)

- [ ] **Step 1: Write the failing test**

Append to `packages/jest/src/schematics/ng-add/index.spec.ts`:

```ts
describe('jest ng-add (zoneless detection + idempotency)', () => {
  it('sets zoneless:false when zone.js is in build polyfills', async () => {
    let tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    await runner()
      .callRule(
        updateWorkspace((ws) => {
          const build = ws.projects.get('app')!.targets.get('build')!;
          build.options = { ...(build.options ?? {}), polyfills: ['zone.js'] };
        }),
        tree,
      )
      .forEach((t) => (tree = t as UnitTestTree));

    const out = (await runner().runSchematic('ng-add', {}, tree)) as UnitTestTree;
    const ws = await readWorkspace(out);
    const opts = ws.projects.get('app')!.targets.get('test')!.options as Record<string, unknown>;
    expect(opts['zoneless']).toBe(false);
  });

  it('is idempotent: re-running on an already-jest workspace keeps :run', async () => {
    const tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    const once = (await runner().runSchematic('ng-add', {}, tree)) as UnitTestTree;
    const twice = (await runner().runSchematic('ng-add', {}, once)) as UnitTestTree;

    const ws = await readWorkspace(twice);
    expect(ws.projects.get('app')!.targets.get('test')!.builder).toBe(
      '@angular-builders/jest:run',
    );
    const pkg = JSON.parse(twice.readText('/package.json'));
    // dep version unchanged (single, valid range — not duplicated/corrupted)
    expect(pkg.devDependencies['jest']).toBe('^30.0.0');
  });
});
```

- [ ] **Step 2: Run test to verify it passes**

Run: `yarn jest --config jest-ut.config.js packages/jest/src/schematics/ng-add/index.spec.ts`
Expected: PASS for both (the Task 4 implementation already detects zone.js via `isZoneless` and the builder rewrite is naturally idempotent).

> This task is a verification/guard task: the behavior is already implemented; these tests lock it in. If both pass on first run, that is the success condition — proceed to commit. If the idempotency dep assertion fails (e.g. duplicate/corrupted dep entries on re-run), the fix is in Step 3.

- [ ] **Step 3: Fix only if a test failed**

If the idempotency dep assertion failed because `addDependency` corrupted the version on re-run, guard the add by skipping deps that already exist. Replace the `JEST_STACK.forEach(...)` block in `packages/jest/src/schematics/ng-add/index.ts` with:

```ts
    const existingPkg = tree.exists('/package.json')
      ? JSON.parse(tree.readText('/package.json'))
      : {};
    const existingDev: Record<string, string> = existingPkg.devDependencies ?? {};
    const toAdd = JEST_STACK.filter(([name]) => !existingDev[name]);
    toAdd.forEach(([name, version], i) => {
      rules.push(addBuilderDevDependency(name, version, { install: i === toAdd.length - 1 }));
    });
```

Then re-run Step 2's command; expected PASS. (Skip this step entirely if Step 2 already passed.)

- [ ] **Step 4: Commit**

```bash
git add packages/jest/src/schematics/ng-add/index.ts packages/jest/src/schematics/ng-add/index.spec.ts
git commit -m "test(jest): cover ng-add zone detection and idempotency"
```

---

## Task 6: Migrations manifest

Declare the two migrations with valid semver thresholds. `ng update` runs every migration where `installedVersion < version <= targetVersion`.

**Files:**
- Create: `packages/jest/src/schematics/migrations.json`

- [ ] **Step 1: Write the migrations manifest**

Create `packages/jest/src/schematics/migrations.json`:

```json
{
  "$schema": "../../../node_modules/@angular-devkit/schematics/collection-schema.json",
  "schematics": {
    "migration-v21": {
      "version": "21.0.0",
      "description": "Migrate jest builder config for v21: bump deps, Node16 tsconfig, rename builder options, strip removed mocks/options, set zoneless by detection.",
      "factory": "./migrations/v21/index#migrateV21"
    },
    "migration-v22": {
      "version": "22.0.0",
      "description": "Advise on v22 jest breaking changes (isolatedModules default, per-project coverage path). Advisory only — no file changes.",
      "factory": "./migrations/v22/index#migrateV22"
    }
  }
}
```

> Threshold semantics: a user on Angular/builder `20.x` upgrading to `21.x` triggers `migration-v21` (`20 < 21.0.0 <= 21`). Upgrading `21.x → 22.x` triggers `migration-v22` only. A multi-major jump `20 → 22` runs both, v21 then v22 (CLI orders by `version`). `factory` paths are dist-relative (`./migrations/v21/index` → `dist/schematics/migrations/v21/index.js`).
>
> **Coverage from old versions (v17–v20) and the stepwise caveat — IMPORTANT.** `ng update` always executes the migrations from the version being installed (v22), so v22 being the first builder version to ship schematics is correct — v22's `migrations.json` is the single home for the whole history. The window math (`installed < version <= target`) means a user coming from **17/18/19/20** runs **both** `migration-v21` and `migration-v22` (17→20 were all no-op transitions, so nothing is missing); a user already on **21** correctly runs only `migration-v22` (they performed the heavy 20→21 step manually, before schematics existed).
>
> This full-range coverage holds **only if the builder is updated from its old major to 22 in a single `ng update @angular-builders/jest`.** If the builder is instead dragged *stepwise* through 21 — which shipped **no** `migrations.json` — the heavy `migration-v21` is silently skipped: v21 had nothing to run it, and the final `21 → 22` step's window `(21, 22]` excludes the `21.0.0` threshold. The supported flow (document in `MIGRATION.MD` + the upgrade runbook, see Plan 2c/2d): **upgrade the Angular framework stepwise to 22 (framework discipline requires it), leaving `@angular-builders/jest` untouched, then run `ng update @angular-builders/jest` once** so the window `(old, 22]` spans 21. The migration is idempotent + detection-based, so this is safe.
>
> **Execution-time validation (RC-gated):** confirm on `22.0.0-rc.2` that `ng update` actually permits a third-party package's old→22 multi-major jump and runs the spanned migrations. Angular *blocks* multi-major for the framework itself; packages that declare a `migrations.json` generally allow it, but this MUST be verified against the real CLI during implementation (add it to the integration e2e in Plan 04). If the CLI refuses the jump, fall back to documenting an explicit `ng update @angular-builders/jest@22 --from=<old> --migrate-only` invocation.

- [ ] **Step 2: Verify it copies into dist**

Run: `yarn workspace @angular-builders/jest exec copyfiles -u 2 "src/schematics/**/*.json" dist/schematics`
Run: `ls packages/jest/dist/schematics/migrations.json`
Expected: the file exists at `dist/schematics/migrations.json`.

- [ ] **Step 3: Commit**

```bash
git add packages/jest/src/schematics/migrations.json
git commit -m "feat(jest): declare ng-update migrations manifest (v21, v22)"
```

---

## Task 7: `@21` migration — dependency bumps + tsconfig Node16

The heavy migration, built in slices. First slice: bump `jest`/`jest-environment-jsdom`/`jsdom` and patch `tsconfig.spec.json` (`module`/`moduleResolution: "Node16"`, `isolatedModules: true`).

**Files:**
- Create: `packages/jest/src/schematics/migrations/v21/index.ts`
- Test: `packages/jest/src/schematics/migrations/v21/index.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/jest/src/schematics/migrations/v21/index.spec.ts`:

```ts
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { SchematicTestHarness } from '@angular-builders/common/schematics/testing';

const COLLECTION = require.resolve('../../../../src/schematics/migrations.json');

function runner(): SchematicTestRunner {
  return new SchematicTestRunner('jest-migrations', COLLECTION);
}

async function seed(): Promise<UnitTestTree> {
  const tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
  const pkg = JSON.parse(tree.readText('/package.json'));
  pkg.devDependencies = {
    ...(pkg.devDependencies ?? {}),
    jest: '^29.0.0',
    'jest-environment-jsdom': '^29.0.0',
    jsdom: '^24.0.0',
  };
  tree.overwrite('/package.json', JSON.stringify(pkg, null, 2));
  tree.create(
    '/tsconfig.spec.json',
    JSON.stringify({ compilerOptions: { module: 'esnext', types: ['jest'] } }, null, 2),
  );
  return tree;
}

describe('jest @21 migration — deps + tsconfig', () => {
  it('bumps jest/jest-environment-jsdom/jsdom to 30/30/26', async () => {
    const out = (await runner().runSchematic('migration-v21', {}, await seed())) as UnitTestTree;
    const pkg = JSON.parse(out.readText('/package.json'));
    expect(pkg.devDependencies.jest).toBe('^30.0.0');
    expect(pkg.devDependencies['jest-environment-jsdom']).toBe('^30.0.0');
    expect(pkg.devDependencies.jsdom).toBe('^26.0.0');
  });

  it('patches tsconfig.spec.json to Node16 + isolatedModules', async () => {
    const out = (await runner().runSchematic('migration-v21', {}, await seed())) as UnitTestTree;
    const cfg = JSON.parse(out.readText('/tsconfig.spec.json'));
    expect(cfg.compilerOptions.module).toBe('Node16');
    expect(cfg.compilerOptions.moduleResolution).toBe('Node16');
    expect(cfg.compilerOptions.isolatedModules).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn jest --config jest-ut.config.js packages/jest/src/schematics/migrations/v21/index.spec.ts`
Expected: FAIL — factory `./migrations/v21/index` cannot resolve / `migrateV21 is not a function`.

- [ ] **Step 3: Write minimal implementation**

Create `packages/jest/src/schematics/migrations/v21/index.ts`:

```ts
import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { JSONFile } from '@schematics/angular/utility/json-file';
import { editJsonFile } from '@angular-builders/common/schematics';

// Target versions for the jest stack at v21.
const DEP_BUMPS: Record<string, string> = {
  jest: '^30.0.0',
  'jest-environment-jsdom': '^30.0.0',
  jsdom: '^26.0.0',
};

function bumpDeps(): Rule {
  return (tree: Tree) => {
    if (!tree.exists('/package.json')) return tree;
    const json = new JSONFile(tree, '/package.json');
    for (const [name, version] of Object.entries(DEP_BUMPS)) {
      if (json.get(['devDependencies', name]) !== undefined) {
        json.modify(['devDependencies', name], version);
      }
      if (json.get(['dependencies', name]) !== undefined) {
        json.modify(['dependencies', name], version);
      }
    }
    return tree;
  };
}

function patchSpecTsconfig(): Rule {
  return editJsonFile('/tsconfig.spec.json', (json: JSONFile) => {
    json.modify(['compilerOptions', 'module'], 'Node16');
    json.modify(['compilerOptions', 'moduleResolution'], 'Node16');
    json.modify(['compilerOptions', 'isolatedModules'], true);
  });
}

export function migrateV21(): Rule {
  return (_tree: Tree, _context: SchematicContext) => {
    return chain([bumpDeps(), patchSpecTsconfig()]);
  };
}
```

> `editJsonFile` is a guarded no-op if `/tsconfig.spec.json` is absent (Plan 0). `bumpDeps` only rewrites versions for deps already present — it never adds jest to a workspace that doesn't use it.

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn jest --config jest-ut.config.js packages/jest/src/schematics/migrations/v21/index.spec.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/jest/src/schematics/migrations/v21/index.ts packages/jest/src/schematics/migrations/v21/index.spec.ts
git commit -m "feat(jest): v21 migration bumps deps and applies Node16 tsconfig"
```

---

## Task 8: `@21` migration — builder option renames in angular.json

Rename builder options `configPath`→`config` and `testPathPattern`→`testPathPatterns` in every project's `test` target options.

**Files:**
- Modify: `packages/jest/src/schematics/migrations/v21/index.ts`
- Test: `packages/jest/src/schematics/migrations/v21/index.spec.ts` (add a describe block)

- [ ] **Step 1: Write the failing test**

Append to `packages/jest/src/schematics/migrations/v21/index.spec.ts`. Add this import at the top of the file (next to the existing imports):

```ts
import { readWorkspace, updateWorkspace } from '@schematics/angular/utility';
```

Then append the describe block:

```ts
describe('jest @21 migration — builder option renames', () => {
  async function seedWithTestOptions(options: Record<string, unknown>): Promise<UnitTestTree> {
    let tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    await runner()
      .callRule(
        updateWorkspace((ws) => {
          ws.projects.get('app')!.targets.set('test', {
            builder: '@angular-builders/jest:run',
            options,
          });
        }),
        tree,
      )
      .forEach((t) => (tree = t as UnitTestTree));
    return tree;
  }

  it('renames configPath → config', async () => {
    const tree = await seedWithTestOptions({ configPath: 'jest.config.js' });
    const out = (await runner().runSchematic('migration-v21', {}, tree)) as UnitTestTree;
    const ws = await readWorkspace(out);
    const opts = ws.projects.get('app')!.targets.get('test')!.options as Record<string, unknown>;
    expect(opts['config']).toBe('jest.config.js');
    expect(opts['configPath']).toBeUndefined();
  });

  it('renames testPathPattern → testPathPatterns', async () => {
    const tree = await seedWithTestOptions({ testPathPattern: 'foo' });
    const out = (await runner().runSchematic('migration-v21', {}, tree)) as UnitTestTree;
    const ws = await readWorkspace(out);
    const opts = ws.projects.get('app')!.targets.get('test')!.options as Record<string, unknown>;
    expect(opts['testPathPatterns']).toBe('foo');
    expect(opts['testPathPattern']).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn jest --config jest-ut.config.js packages/jest/src/schematics/migrations/v21/index.spec.ts`
Expected: FAIL — the rename describe block fails (old keys still present).

- [ ] **Step 3: Write minimal implementation**

In `packages/jest/src/schematics/migrations/v21/index.ts`, add the `updateWorkspace` import and a rename rule, and add it to the chain.

Add to the imports at the top:

```ts
import { updateWorkspace } from '@schematics/angular/utility';
```

Add this constant and function (after `patchSpecTsconfig`):

```ts
const OPTION_RENAMES: Record<string, string> = {
  configPath: 'config',
  testPathPattern: 'testPathPatterns',
};

function renameBuilderOptions(): Rule {
  return updateWorkspace((workspace) => {
    for (const project of workspace.projects.values()) {
      const test = project.targets.get('test');
      if (!test || test.builder !== '@angular-builders/jest:run') continue;
      const options = (test.options ?? {}) as Record<string, unknown>;
      for (const [from, to] of Object.entries(OPTION_RENAMES)) {
        if (from in options) {
          if (!(to in options)) options[to] = options[from];
          delete options[from];
        }
      }
      test.options = options;
    }
  });
}
```

Update the chain in `migrateV21`:

```ts
export function migrateV21(): Rule {
  return (_tree: Tree, _context: SchematicContext) => {
    return chain([bumpDeps(), patchSpecTsconfig(), renameBuilderOptions()]);
  };
}
```

> Only `@angular-builders/jest:run` test targets are touched. Rename is non-destructive if the new key already exists (preserves the new value, drops the old). Because it guards with `if (from in options)`, a second run finds no old key and is a no-op.

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn jest --config jest-ut.config.js packages/jest/src/schematics/migrations/v21/index.spec.ts`
Expected: PASS (all describe blocks so far).

- [ ] **Step 5: Commit**

```bash
git add packages/jest/src/schematics/migrations/v21/index.ts packages/jest/src/schematics/migrations/v21/index.spec.ts
git commit -m "feat(jest): v21 migration renames configPath/testPathPattern options"
```

---

## Task 9: `@21` migration — strip removed globalMocks + removed Jest options

Strip removed `globalMocks` values (`styleTransform`, `getComputedStyle`, `doctype`) and removed Jest builder options (`browser`, `init`, `mapCoverage`, `testURL`, `timers`) from each jest `test` target.

**Files:**
- Modify: `packages/jest/src/schematics/migrations/v21/index.ts`
- Test: `packages/jest/src/schematics/migrations/v21/index.spec.ts` (add a describe block)

- [ ] **Step 1: Write the failing test**

Append to `packages/jest/src/schematics/migrations/v21/index.spec.ts`:

```ts
describe('jest @21 migration — strip removed mocks/options', () => {
  async function seedWithTestOptions(options: Record<string, unknown>): Promise<UnitTestTree> {
    let tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    await runner()
      .callRule(
        updateWorkspace((ws) => {
          ws.projects.get('app')!.targets.set('test', {
            builder: '@angular-builders/jest:run',
            options,
          });
        }),
        tree,
      )
      .forEach((t) => (tree = t as UnitTestTree));
    return tree;
  }

  it('strips removed globalMocks values, keeping supported ones', async () => {
    const tree = await seedWithTestOptions({
      globalMocks: ['matchMedia', 'styleTransform', 'getComputedStyle', 'doctype'],
    });
    const out = (await runner().runSchematic('migration-v21', {}, tree)) as UnitTestTree;
    const ws = await readWorkspace(out);
    const opts = ws.projects.get('app')!.targets.get('test')!.options as Record<string, unknown>;
    expect(opts['globalMocks']).toEqual(['matchMedia']);
  });

  it('strips removed jest options', async () => {
    const tree = await seedWithTestOptions({
      browser: true,
      init: true,
      mapCoverage: true,
      testURL: 'http://localhost',
      timers: 'fake',
      ci: true,
    });
    const out = (await runner().runSchematic('migration-v21', {}, tree)) as UnitTestTree;
    const ws = await readWorkspace(out);
    const opts = ws.projects.get('app')!.targets.get('test')!.options as Record<string, unknown>;
    for (const removed of ['browser', 'init', 'mapCoverage', 'testURL', 'timers']) {
      expect(opts[removed]).toBeUndefined();
    }
    // unrelated options are preserved
    expect(opts['ci']).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn jest --config jest-ut.config.js packages/jest/src/schematics/migrations/v21/index.spec.ts`
Expected: FAIL — the strip describe block fails (removed keys/values still present).

- [ ] **Step 3: Write minimal implementation**

In `packages/jest/src/schematics/migrations/v21/index.ts`, add the constants and a strip rule, and include it in the chain.

Add these constants (near `OPTION_RENAMES`):

```ts
const REMOVED_GLOBAL_MOCKS = ['styleTransform', 'getComputedStyle', 'doctype'];
const REMOVED_JEST_OPTIONS = ['browser', 'init', 'mapCoverage', 'testURL', 'timers'];
```

Add this function (after `renameBuilderOptions`):

```ts
function stripRemovedOptions(): Rule {
  return updateWorkspace((workspace) => {
    for (const project of workspace.projects.values()) {
      const test = project.targets.get('test');
      if (!test || test.builder !== '@angular-builders/jest:run') continue;
      const options = (test.options ?? {}) as Record<string, unknown>;

      if (Array.isArray(options['globalMocks'])) {
        options['globalMocks'] = (options['globalMocks'] as unknown[]).filter(
          (v) => !REMOVED_GLOBAL_MOCKS.includes(v as string),
        );
      }
      for (const removed of REMOVED_JEST_OPTIONS) {
        if (removed in options) delete options[removed];
      }
      test.options = options;
    }
  });
}
```

Update the chain in `migrateV21`:

```ts
export function migrateV21(): Rule {
  return (_tree: Tree, _context: SchematicContext) => {
    return chain([bumpDeps(), patchSpecTsconfig(), renameBuilderOptions(), stripRemovedOptions()]);
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn jest --config jest-ut.config.js packages/jest/src/schematics/migrations/v21/index.spec.ts`
Expected: PASS (all describe blocks).

- [ ] **Step 5: Commit**

```bash
git add packages/jest/src/schematics/migrations/v21/index.ts packages/jest/src/schematics/migrations/v21/index.spec.ts
git commit -m "feat(jest): v21 migration strips removed globalMocks and jest options"
```

---

## Task 10: `@21` migration — set `zoneless` by detection + logger advisories

Set `zoneless` on each jest test target by detection (zone.js in build polyfills → `false`; else leave the default `true` — i.e. set it only when zone-based). Emit logger advisories about Node16 latent type errors and removed mocks.

**Files:**
- Modify: `packages/jest/src/schematics/migrations/v21/index.ts`
- Test: `packages/jest/src/schematics/migrations/v21/index.spec.ts` (add a describe block)

- [ ] **Step 1: Write the failing test**

Append to `packages/jest/src/schematics/migrations/v21/index.spec.ts`. Add this import at the top of the file (next to the existing imports):

```ts
import { logging } from '@angular-devkit/core';
```

Then append the describe block:

```ts
describe('jest @21 migration — zoneless detection + advisories', () => {
  it('zone-based workspace → sets zoneless:false', async () => {
    let tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    await runner()
      .callRule(
        updateWorkspace((ws) => {
          const build = ws.projects.get('app')!.targets.get('build')!;
          build.options = { ...(build.options ?? {}), polyfills: ['zone.js'] };
          ws.projects.get('app')!.targets.set('test', {
            builder: '@angular-builders/jest:run',
            options: {},
          });
        }),
        tree,
      )
      .forEach((t) => (tree = t as UnitTestTree));

    const out = (await runner().runSchematic('migration-v21', {}, tree)) as UnitTestTree;
    const ws = await readWorkspace(out);
    const opts = ws.projects.get('app')!.targets.get('test')!.options as Record<string, unknown>;
    expect(opts['zoneless']).toBe(false);
  });

  it('zoneless workspace → leaves zoneless unset (default true)', async () => {
    let tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    await runner()
      .callRule(
        updateWorkspace((ws) => {
          ws.projects.get('app')!.targets.set('test', {
            builder: '@angular-builders/jest:run',
            options: {},
          });
        }),
        tree,
      )
      .forEach((t) => (tree = t as UnitTestTree));

    const out = (await runner().runSchematic('migration-v21', {}, tree)) as UnitTestTree;
    const ws = await readWorkspace(out);
    const opts = ws.projects.get('app')!.targets.get('test')!.options as Record<string, unknown>;
    expect(opts['zoneless']).toBeUndefined();
  });

  it('emits Node16 and removed-mocks advisories', async () => {
    const messages: string[] = [];
    const r = new SchematicTestRunner('jest-migrations', COLLECTION);
    r.logger.subscribe((e: logging.LogEntry) => messages.push(e.message));

    const tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    await r.runSchematic('migration-v21', {}, tree);

    const joined = messages.join('\n');
    expect(joined).toMatch(/Node16/);
    expect(joined).toMatch(/mock/i);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn jest --config jest-ut.config.js packages/jest/src/schematics/migrations/v21/index.spec.ts`
Expected: FAIL — zoneless not set / no advisory messages emitted.

- [ ] **Step 3: Write minimal implementation**

In `packages/jest/src/schematics/migrations/v21/index.ts`:

Add to the imports (extend the existing `@schematics/angular/utility` import to include `readWorkspace`, and add the `isZoneless` import):

```ts
import { readWorkspace, updateWorkspace } from '@schematics/angular/utility';
import { editJsonFile, isZoneless } from '@angular-builders/common/schematics';
```

(Replace the earlier single-name imports for `updateWorkspace` and `editJsonFile` with these combined lines — the file ends up with exactly one import from `@schematics/angular/utility` and one from `@angular-builders/common/schematics`.)

Add this function (after `stripRemovedOptions`):

```ts
function setZonelessByDetection(): Rule {
  return async (tree: Tree) => {
    const workspace = await readWorkspace(tree);
    return updateWorkspace((ws) => {
      for (const [name, project] of ws.projects) {
        const test = project.targets.get('test');
        if (!test || test.builder !== '@angular-builders/jest:run') continue;
        // Detect against the workspace read from the tree (build polyfills + bootstrap).
        if (!isZoneless(tree, workspace, name)) {
          const options = (test.options ?? {}) as Record<string, unknown>;
          options['zoneless'] = false;
          test.options = options;
        }
        // zoneless workspaces keep the builder's default (true) — leave unset.
      }
    });
  };
}
```

Replace `migrateV21` to add the zoneless rule and the logger advisories:

```ts
export function migrateV21(): Rule {
  return (_tree: Tree, context: SchematicContext) => {
    context.logger.warn(
      '[@angular-builders/jest] v21 migration applied. Note: tsconfig.spec.json now uses ' +
        'module/moduleResolution "Node16", which may surface pre-existing type errors in your ' +
        'spec code — fix the reported type issues.',
    );
    context.logger.warn(
      '[@angular-builders/jest] Removed globalMocks (styleTransform, getComputedStyle, doctype) ' +
        'were stripped from your config; if your tests relied on them, replace them manually. ' +
        'See MIGRATION.MD (v20→v21) for details.',
    );
    return chain([
      bumpDeps(),
      patchSpecTsconfig(),
      renameBuilderOptions(),
      stripRemovedOptions(),
      setZonelessByDetection(),
    ]);
  };
}
```

> Advisories are unconditional `logger.warn` (headless-safe; no prompts). `setZonelessByDetection` only writes `zoneless: false` for zone-based projects; zoneless projects are left untouched so the builder default (`true`) governs — matching spec §4.1.

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn jest --config jest-ut.config.js packages/jest/src/schematics/migrations/v21/index.spec.ts`
Expected: PASS (all describe blocks).

- [ ] **Step 5: Commit**

```bash
git add packages/jest/src/schematics/migrations/v21/index.ts packages/jest/src/schematics/migrations/v21/index.spec.ts
git commit -m "feat(jest): v21 migration sets zoneless by detection and logs advisories"
```

---

## Task 11: `@21` migration — idempotency

Running the migration twice must equal running it once (deps already bumped, options already renamed/stripped, zoneless already set).

**Files:**
- Test: `packages/jest/src/schematics/migrations/v21/index.spec.ts` (add a describe block)
- Modify: `packages/jest/src/schematics/migrations/v21/index.ts` (only if a test fails)

- [ ] **Step 1: Write the test**

Append to `packages/jest/src/schematics/migrations/v21/index.spec.ts`:

```ts
describe('jest @21 migration — idempotency', () => {
  async function seedFull(): Promise<UnitTestTree> {
    let tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    const pkg = JSON.parse(tree.readText('/package.json'));
    pkg.devDependencies = { ...(pkg.devDependencies ?? {}), jest: '^29.0.0', jsdom: '^24.0.0' };
    tree.overwrite('/package.json', JSON.stringify(pkg, null, 2));
    tree.create(
      '/tsconfig.spec.json',
      JSON.stringify({ compilerOptions: { module: 'esnext', types: ['jest'] } }, null, 2),
    );
    await runner()
      .callRule(
        updateWorkspace((ws) => {
          const build = ws.projects.get('app')!.targets.get('build')!;
          build.options = { ...(build.options ?? {}), polyfills: ['zone.js'] };
          ws.projects.get('app')!.targets.set('test', {
            builder: '@angular-builders/jest:run',
            options: {
              configPath: 'jest.config.js',
              testPathPattern: 'foo',
              globalMocks: ['matchMedia', 'doctype'],
              browser: true,
            },
          });
        }),
        tree,
      )
      .forEach((t) => (tree = t as UnitTestTree));
    return tree;
  }

  it('run twice == run once', async () => {
    const once = (await runner().runSchematic('migration-v21', {}, await seedFull())) as UnitTestTree;
    const twice = (await runner().runSchematic('migration-v21', {}, once)) as UnitTestTree;

    const wsOnce = await readWorkspace(once);
    const wsTwice = await readWorkspace(twice);
    const optsOnce = wsOnce.projects.get('app')!.targets.get('test')!.options as Record<string, unknown>;
    const optsTwice = wsTwice.projects.get('app')!.targets.get('test')!.options as Record<string, unknown>;
    expect(optsTwice).toEqual(optsOnce);

    const pkgOnce = JSON.parse(once.readText('/package.json'));
    const pkgTwice = JSON.parse(twice.readText('/package.json'));
    expect(pkgTwice.devDependencies).toEqual(pkgOnce.devDependencies);

    const cfgOnce = JSON.parse(once.readText('/tsconfig.spec.json'));
    const cfgTwice = JSON.parse(twice.readText('/tsconfig.spec.json'));
    expect(cfgTwice).toEqual(cfgOnce);

    // concrete post-state checks
    expect(optsTwice['config']).toBe('jest.config.js');
    expect(optsTwice['configPath']).toBeUndefined();
    expect(optsTwice['testPathPatterns']).toBe('foo');
    expect(optsTwice['globalMocks']).toEqual(['matchMedia']);
    expect(optsTwice['browser']).toBeUndefined();
    expect(optsTwice['zoneless']).toBe(false);
    expect(pkgTwice.devDependencies.jest).toBe('^30.0.0');
  });
});
```

- [ ] **Step 2: Run test to verify it passes**

Run: `yarn jest --config jest-ut.config.js packages/jest/src/schematics/migrations/v21/index.spec.ts`
Expected: PASS — the migration is naturally idempotent (renames check `from in options`; strips are filters/deletes; dep bumps set absolute versions; zoneless sets an absolute boolean). This task locks that property.

> If the run-twice comparison fails, the most likely cause is a non-idempotent rename (re-adding a deleted key). The implementation in Task 8 already guards with `if (from in options)`, so a second run finds no old key and is a no-op. Only investigate further (Step 3) if this test actually fails.

- [ ] **Step 3: Fix only if a test failed**

If idempotency fails, identify the non-idempotent rule via the diff between `once` and `twice` states, and make it conditional (operate only when the pre-migration shape is present). No code change is expected; this step exists only as a contingency.

- [ ] **Step 4: Commit**

```bash
git add packages/jest/src/schematics/migrations/v21/index.spec.ts
git commit -m "test(jest): lock v21 migration idempotency (run twice == once)"
```

---

## Task 12: `@22` migration — advisory only (no file mutation)

The v22 jest breaking changes apply automatically (internal default flips). The migration only warns: #2191 (isolatedModules now defaults true) and #2212 (per-project coverage path moves). It must NOT mutate any file.

**Files:**
- Create: `packages/jest/src/schematics/migrations/v22/index.ts`
- Test: `packages/jest/src/schematics/migrations/v22/index.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/jest/src/schematics/migrations/v22/index.spec.ts`:

```ts
import { logging } from '@angular-devkit/core';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { updateWorkspace } from '@schematics/angular/utility';
import { SchematicTestHarness } from '@angular-builders/common/schematics/testing';

const COLLECTION = require.resolve('../../../../src/schematics/migrations.json');

function makeRunner(): { runner: SchematicTestRunner; messages: string[] } {
  const runner = new SchematicTestRunner('jest-migrations', COLLECTION);
  const messages: string[] = [];
  runner.logger.subscribe((e: logging.LogEntry) => messages.push(e.message));
  return { runner, messages };
}

function snapshot(tree: UnitTestTree): Record<string, string> {
  const out: Record<string, string> = {};
  tree.visit((path) => {
    out[path] = tree.readText(path);
  });
  return out;
}

describe('jest @22 migration — advisory only', () => {
  it('warns about isolatedModules default flip (#2191)', async () => {
    const { runner, messages } = makeRunner();
    const tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    await runner.runSchematic('migration-v22', {}, tree);
    expect(messages.join('\n')).toMatch(/isolatedModules/);
  });

  it('warns about per-project coverage path when projectRoot !== workspaceRoot (#2212)', async () => {
    const { runner, messages } = makeRunner();
    // harness puts apps under projects/<name> → projectRoot !== '' (workspace root)
    const tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    await runner.runSchematic('migration-v22', {}, tree);
    expect(messages.join('\n')).toMatch(/coverage/i);
  });

  it('does NOT warn about coverage when projectRoot === workspaceRoot', async () => {
    const { runner, messages } = makeRunner();
    let tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    // force the project root to '' (workspace root)
    await runner
      .callRule(
        updateWorkspace((ws) => {
          (ws.projects.get('app') as { root: string }).root = '';
        }),
        tree,
      )
      .forEach((t) => (tree = t as UnitTestTree));
    await runner.runSchematic('migration-v22', {}, tree);
    expect(messages.join('\n')).not.toMatch(/coverage/i);
  });

  it('mutates no files', async () => {
    const { runner } = makeRunner();
    const tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    const before = snapshot(tree);
    const out = (await runner.runSchematic('migration-v22', {}, tree)) as UnitTestTree;
    const after = snapshot(out);
    expect(after).toEqual(before);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn jest --config jest-ut.config.js packages/jest/src/schematics/migrations/v22/index.spec.ts`
Expected: FAIL — factory `./migrations/v22/index` cannot resolve / `migrateV22 is not a function`.

- [ ] **Step 3: Write minimal implementation**

Create `packages/jest/src/schematics/migrations/v22/index.ts`:

```ts
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { readWorkspace } from '@schematics/angular/utility';

export function migrateV22(): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    // #2191 — isolatedModules now defaults to true. Applies automatically; advise only.
    context.logger.warn(
      '[@angular-builders/jest] v22: ts-jest `isolatedModules` now defaults to true. ' +
        '`const enum` used across files and type-only re-exports without the `type` modifier ' +
        'will now error. Fix the call sites, or restore `isolatedModules: false` in your jest ' +
        'config. We do not change this automatically — the new default is intentional. ' +
        'See MIGRATION.MD (v21→v22) and #2191.',
    );

    // Optional: make the const-enum warning targeted by scanning sources (read-only).
    const constEnumHits: string[] = [];
    tree.visit((path) => {
      if (!path.endsWith('.ts')) return;
      if (path.includes('/node_modules/') || path.includes('/dist/')) return;
      const content = tree.readText(path);
      if (/\bconst\s+enum\b/.test(content)) constEnumHits.push(path);
    });
    if (constEnumHits.length > 0) {
      context.logger.warn(
        '[@angular-builders/jest] Found `const enum` in: ' +
          constEnumHits.join(', ') +
          ' — these may break under isolatedModules. Convert to a regular `enum` or `as const`.',
      );
    }

    // #2212 — per-project coverage output moves ./coverage → <projectRoot>/coverage.
    // Warn only workspaces where a project root differs from the workspace root.
    const workspace = await readWorkspace(tree);
    const affected = [...workspace.projects.entries()]
      .filter(([, project]) => (project.root ?? '') !== '')
      .map(([name]) => name);
    if (affected.length > 0) {
      context.logger.warn(
        '[@angular-builders/jest] v22: per-project coverage output now writes to ' +
          '<projectRoot>/coverage instead of ./coverage for projects: ' +
          affected.join(', ') +
          '. Update any CI/tooling that reads a hardcoded `./coverage/` path. See #2212.',
      );
    }

    // No file mutation — return the tree untouched.
    return tree;
  };
}
```

> The `tree.visit` const-enum scan is read-only (it only reads files). The coverage advisory is gated on `project.root !== ''` (workspace root). No `updateWorkspace`/`editJsonFile`/`removeX` rules are used — the tree is returned unmodified, satisfying the "no file mutation" test.

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn jest --config jest-ut.config.js packages/jest/src/schematics/migrations/v22/index.spec.ts`
Expected: PASS (4 tests).

> The "mutates no files" assertion holds because `readWorkspace` reads but does not write, and no mutating rule is invoked. If it fails, the cause is an accidental `updateWorkspace`/`editJsonFile` call — there are none here.

- [ ] **Step 5: Commit**

```bash
git add packages/jest/src/schematics/migrations/v22/index.ts packages/jest/src/schematics/migrations/v22/index.spec.ts
git commit -m "feat(jest): v22 advisory migration (isolatedModules, coverage path)"
```

---

## Task 13: Full build + manifest copy verification

Verify the whole package builds, schematics assets land in `dist`, and the CLI-visible manifests are correct.

**Files:**
- None (verification only)

- [ ] **Step 1: Note on the Task 1 placeholder**

The Task 1 placeholder `packages/jest/src/schematics/index.ts` (`export {};`) is harmless but unused. Leave it — it has no consumers and keeps the schematics tsconfig non-empty even if other files are excluded on a partial checkout. (No action needed; documented so the implementer doesn't delete it.)

- [ ] **Step 2: Build the package end-to-end**

Run: `yarn workspace @angular-builders/jest build`
Expected: completes; `postbuild`'s unit suite is green.

- [ ] **Step 3: Verify schematics assets copied to dist**

Run: `ls packages/jest/dist/schematics packages/jest/dist/schematics/ng-add packages/jest/dist/schematics/migrations/v21 packages/jest/dist/schematics/migrations/v22`
Expected:
- `dist/schematics/collection.json`, `dist/schematics/migrations.json`
- `dist/schematics/ng-add/index.js`, `dist/schematics/ng-add/schema.json`
- `dist/schematics/migrations/v21/index.js`
- `dist/schematics/migrations/v22/index.js`

- [ ] **Step 4: Verify package.json fields point at real dist paths**

Run: `node -e "const p=require('./packages/jest/package.json'); console.log(p.schematics, JSON.stringify(p['ng-add']), JSON.stringify(p['ng-update']));"`
Expected: `./dist/schematics/collection.json {"save":"devDependencies"} {"migrations":"./dist/schematics/migrations.json"}`

Run: `node -e "require('./packages/jest/dist/schematics/collection.json'); require('./packages/jest/dist/schematics/migrations.json'); console.log('manifests ok');"`
Expected: prints `manifests ok` (valid JSON).

- [ ] **Step 5: Run the full jest schematics unit suite**

Run: `yarn jest --config jest-ut.config.js packages/jest/src/schematics`
Expected: all ng-add + v21 + v22 specs green.

- [ ] **Step 6: Commit (if anything changed)**

```bash
git add -A packages/jest
git commit -m "build(jest): verify schematics build and manifests" --allow-empty
```

---

## Self-Review

**Spec §4.1 (jest) coverage:**

ng-add:
- Add jest stack (`jest`, `jest-preset-angular`, `jest-environment-jsdom`) + the builder itself via `addBuilderDevDependency` → Task 3 `JEST_STACK`. ✅
- Rewrite `test` → `@angular-builders/jest:run` via `setBuilderForTarget`; schedule install → Task 3. ✅
- Karma detected (builder `:karma` OR `karma.conf.*` OR karma/jasmine in devDeps): `removeDevDependencies`, `removeFilesIfPresent(['karma.conf.js','src/test.ts'])`, fix `tsconfig.spec.json` (types jasmine→jest, drop `test.ts`) → Task 4 `hasKarma`/`fixSpecTsconfig`. ✅
- Set `zoneless` to match `isZoneless` rather than prompting → Task 3 (zoneless) + Task 5 (zone branch). ✅
- Idempotent (`test` already `:run` → no-op) → Task 5. ✅
- Only `--project` flag, no `x-prompt` → Task 2 schema. ✅

ng-update @21:
- Bump `jest`/`jest-environment-jsdom`/`jsdom` → 30/30/26 → Task 7. ✅
- tsconfig.spec.json `module`/`moduleResolution: "Node16"`, `isolatedModules: true` → Task 7. ✅
- Rename `configPath`→`config`, `testPathPattern`→`testPathPatterns` in angular.json → Task 8. ✅
- Strip removed globalMocks (`styleTransform`,`getComputedStyle`,`doctype`) + removed jest options (`browser`,`init`,`mapCoverage`,`testURL`,`timers`) → Task 9. ✅
- Set `zoneless` by detection (zone.js → false; else leave default) → Task 10. ✅
- Logger advisories (Node16 latent type errors; removed mocks) → Task 10. ✅
- Idempotency + both zone/zoneless branches → Task 10 (branches) + Task 11 (idempotency). ✅

ng-update @22 (advisory-only, no mutation):
- #2191 isolatedModules-default warning + optional `const enum` grep; do NOT auto-set false → Task 12. ✅
- #2212 coverage-path warning only where `projectRoot !== workspaceRoot` → Task 12. ✅
- Asserts advisories logged + asserts NO file mutation → Task 12 tests. ✅

Packaging (§7):
- `packages/jest/tsconfig.schematics.json` (rootDir/outDir, extends root base) → Task 1. ✅
- `src/schematics/collection.json`, `ng-add/{index.ts,schema.json}`, `migrations.json`, `migrations/v21/index.ts`, `migrations/v22/index.ts` → Tasks 2,3,6,7,12. ✅
- package.json `schematics`, `ng-add:{save:devDependencies}`, `ng-update:{migrations:...}` fields → Task 1. ✅
- `copy:schematics` build step mirroring Plan 0 (`copyfiles -u 2`) → Task 1. ✅

§6 coverage checklist (jest column):
- deps add/remove (+jest stack / −karma,jasmine) → Tasks 3,4. ✅
- targets rewritten (`test`) → Task 3. ✅
- files deleted (`karma.conf`,`test.ts`) → Task 4. ✅
- tsconfig edits (spec `types`/`files`) → Task 4. ✅
- detection (Karma?, zoneless?) → Tasks 4,3/5. ✅
- flags (`--project`) → Task 2. ✅
- idempotency (`test` already `:run`) → Task 5. ✅
- migrations `@21`,`@22` → Tasks 6–12. ✅
- migration auto-transforms (deps, tsconfig, renames, mocks, zoneless-detected) → Tasks 7–10. ✅
- migration advisories (Node16, removed mocks, isolatedModules, coverage path) → Tasks 10,12. ✅
- package.json fields → Task 1. ✅
- tests (ng-add + migration + idempotency) → all tasks. ✅

§5 migration chain: jest `@21` heavy + `@22` advisory; thresholds `21.0.0`/`22.0.0` so a 20→21 jump runs v21, 21→22 runs v22, 20→22 runs both in order → Task 6. ✅

§11 MIGRATION.MD pairing: both `@21` and `@22` advisories point users at the relevant MIGRATION.MD section (`logger.warn` text references "MIGRATION.MD (v20→v21)" / "(v21→v22)") → Tasks 10,12. ✅

§2 principles: no `x-prompt` anywhere; migrations emit only `context.logger` advisories with safe detected defaults and never block → Tasks 2,10,12. ✅

**Plan 0 reuse:** Every workspace/JSON/dep edit goes through Plan 0 helpers (`setBuilderForTarget`, `addBuilderDevDependency`, `removeDevDependencies`, `removeFilesIfPresent`, `editJsonFile`, `getProjectsToTarget`, `detectTestBuilder`, `isZoneless`) or `@schematics/angular/utility` (`readWorkspace`/`updateWorkspace`/`JSONFile`). No shared helper is redefined; no raw `fs`. ✅

**Placeholder scan:** Every code step contains complete code; no TBD/TODO/"handle edge cases"/"similar to above". The two contingency steps (Task 5 Step 3, Task 11 Step 3) are explicitly gated "only if a test failed" and contain either the exact fix code (Task 5) or a concrete diagnostic procedure (Task 11). ✅

**Type consistency:** `NgAddOptions` (Task 2) used in Tasks 3/4. `ngAdd`/`migrateV21`/`migrateV22` factory names match `collection.json`/`migrations.json` `factory` references (Tasks 2,6). Builder string `@angular-builders/jest:run` consistent across ng-add and migrations. Dep versions consistent (`jest ^30.0.0`, `jest-environment-jsdom ^30.0.0`, `jsdom ^26.0.0`, builder `^22.0.0`). The combined import note in Task 10 prevents duplicate `@schematics/angular/utility` / `@angular-builders/common/schematics` import lines accumulating across Tasks 7–10. ✅

**Calibration risk (flagged, not a gap):** Tests assume the Angular `application` schematic produces a zoneless app (no zone.js polyfill) and roots projects under `projects/<name>`. If the installed v22 generator differs, calibrate the *expected* values (as Plan 0 Task 3/4 instructs) — the rule logic is fixed; only fixture expectations adapt. The `r.tasks`/`runner.logger` APIs are standard `SchematicTestRunner` surface.

---

## Execution Handoff

**Gated:** Execute after Plan 0 (`common/schematics`) is merged/green so `@angular-builders/common/schematics` + `/testing` resolve. Build `common` first (`yarn workspace @angular-builders/common build`) before running these unit tests.

Two execution options:
1. **Subagent-Driven (recommended)** — fresh subagent per task, review between tasks.
2. **Inline Execution** — execute tasks in-session via executing-plans with checkpoints.
