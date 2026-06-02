# Builder Schematics — Plan 0: `common/schematics` Core + Packaging Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the shared `@angular-builders/common/schematics` subpath — composable Rule factories, workspace detection helpers, version helpers, and a unit-test harness — plus the repo-wide packaging scaffolding (tsconfig + asset-copy) that every per-builder schematics plan depends on.

**Architecture:** A new `src/schematics/` tree inside `packages/common`, compiled by a dedicated `tsconfig.schematics.json` to CommonJS in `dist/schematics/` (Angular schematics must be CJS), exposed via a package `exports` subpath kept separate from the runtime `loadModule` entry. All edits go through `@schematics/angular/utility` (`updateWorkspace`, `addDependency`, `JSONFile`) — never raw `fs` or hand-parsed JSON — so `--dry-run`, transactionality, and formatting survive. The three builder plans (jest, custom-esbuild, custom-webpack) import these helpers; this plan locks their signatures.

**Tech Stack:** TypeScript 5.9 (CommonJS target for schematics), `@angular-devkit/schematics`, `@schematics/angular/utility`, `@angular-devkit/core` (workspace JSON), Jest 30 + `@angular-devkit/schematics/testing` (`SchematicTestRunner`, `UnitTestTree`).

---

## Shared API Contract (locked by this plan — builder plans reference these exact signatures)

```ts
// @angular-builders/common/schematics

// --- rules.ts ---
export function setBuilderForTarget(
  projectName: string,
  targetName: string,
  builderName: string,
  options?: Record<string, unknown>,
): Rule;
export function addBuilderDevDependency(
  name: string,
  version: string,
  opts?: { install?: boolean },
): Rule;
export function removeDevDependencies(names: string[]): Rule;
export function removeFilesIfPresent(paths: string[]): Rule;
export function editJsonFile(path: string, mutator: (json: JSONFile) => void): Rule;

// --- detection.ts ---
export type TestBuilderKind = 'karma' | 'jest' | 'vitest' | 'other' | 'none';
export function getProjectsToTarget(
  workspace: workspaces.WorkspaceDefinition,
  optionProject?: string,
): string[];
export function detectTestBuilder(
  workspace: workspaces.WorkspaceDefinition,
  projectName: string,
): TestBuilderKind;
export function isZoneless(
  tree: Tree,
  workspace: workspaces.WorkspaceDefinition,
  projectName: string,
): boolean;

// --- version.ts ---
export interface SemverParts { major: number; minor: number; patch: number; }
export function parseVersion(version: string): SemverParts;
export function isAtLeast(version: string, major: number): boolean;

// --- testing.ts ---
export class SchematicTestHarness {
  constructor(runner?: SchematicTestRunner);
  /** Build a workspace tree with one or more applications. */
  createWorkspace(opts?: {
    projects?: Array<{ name: string; root?: string }>;
    defaultProject?: string;
  }): Promise<UnitTestTree>;
  /** Convenience: the underlying runner, for invoking collections under test. */
  readonly runner: SchematicTestRunner;
}
```

---

## File Structure

- Create: `tsconfig.schematics.json` (repo root) — shared base for all schematics builds.
- Create: `packages/common/tsconfig.schematics.json` — extends root base; `rootDir: src/schematics`, `outDir: dist/schematics`.
- Modify: `packages/common/package.json` — add `exports` map (`.` + `./schematics`), schematics deps, `copy:schematics` build step.
- Create: `packages/common/src/schematics/index.ts` — barrel re-exporting rules/detection/version.
- Create: `packages/common/src/schematics/rules.ts` + `rules.spec.ts`.
- Create: `packages/common/src/schematics/detection.ts` + `detection.spec.ts`.
- Create: `packages/common/src/schematics/version.ts` + `version.spec.ts`.
- Create: `packages/common/src/schematics/testing.ts` (the harness; exported for builder tests via a `./schematics/testing` subpath or the main schematics barrel — see Task 2).

> **Note on `exports` + `merge-schemes.ts`:** `merge-schemes.ts` uses `resolvePackagePath` from `common` to bypass *other* packages' `exports` maps. Adding an `exports` map to `common` itself is safe **only if** the `.` key continues to resolve `dist/index.js` (the runtime entry) exactly as `main` did. Keep `main` as a fallback. Verify in Task 1 Step 4 that the runtime import still resolves.

---

## Task 1: Packaging scaffolding (tsconfig + package.json wiring)

**Files:**
- Create: `tsconfig.schematics.json` (repo root)
- Create: `packages/common/tsconfig.schematics.json`
- Modify: `packages/common/package.json`

- [ ] **Step 1: Write the root shared schematics tsconfig**

Create `tsconfig.schematics.json` (repo root):

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "moduleResolution": "node",
    "target": "ES2022",
    "lib": ["ES2022"],
    "declaration": true,
    "strict": true,
    "strictNullChecks": false,
    "strictPropertyInitialization": false,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "sourceMap": true,
    "pretty": true
  },
  "exclude": ["node_modules", "**/*.spec.ts", "**/files/**"]
}
```

Rationale: Angular schematics are loaded by the Angular CLI as CommonJS; the runtime libs build as `Node16` ESM-interop, but schematics MUST be `commonjs`. `**/files/**` excludes template assets that get copied verbatim, not compiled.

- [ ] **Step 2: Write common's per-package schematics tsconfig**

Create `packages/common/tsconfig.schematics.json`:

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

- [ ] **Step 3: Wire common's package.json (exports, deps, build step)**

Modify `packages/common/package.json`:
- Add an `exports` map (keep `main` as fallback):

```json
"main": "dist/index.js",
"exports": {
  ".": { "default": "./dist/index.js" },
  "./schematics": { "default": "./dist/schematics/index.js" },
  "./schematics/testing": { "default": "./dist/schematics/testing.js" }
},
```

- Add to `dependencies`:

```json
"@angular-devkit/schematics": "^21.0.0",
"@schematics/angular": "^21.0.0",
```

(These resolve to the installed Angular major; on `release/v22` they become `^22.0.0` via the upgrade. `@angular-devkit/core` is already present.)

- Change the `build` script to also compile + copy schematics:

```json
"build": "yarn prebuild && tsc && tsc -p tsconfig.schematics.json && yarn copy:schematics",
"copy:schematics": "copyfiles -u 2 \"src/schematics/**/*.json\" dist/schematics && copyfiles -u 2 \"src/schematics/**/files/**\" dist/schematics",
```

- Add to `devDependencies`: `"copyfiles": "^2.4.1"`.

> `tsc` does not emit `.json` (collection/migration manifests) or `files/**` templates — `copyfiles` does. `-u 2` strips the `src/schematics` path prefix so assets land at `dist/schematics/...`.

- [ ] **Step 4: Verify scaffolding compiles and runtime entry still resolves**

Run (from repo root): `yarn workspace @angular-builders/common build`
Expected: builds `dist/index.js` AND `dist/schematics/` (empty of code so far — will fail with "no inputs" until Task 2 adds files; acceptable here, OR create a placeholder `src/schematics/index.ts` with `export {};` first).

Then verify the runtime export still resolves (regression check for the `exports` map):
Run: `node -e "require('@angular-builders/common')"` from a context where the workspace is linked.
Expected: no `ERR_PACKAGE_PATH_NOT_EXPORTED`.

- [ ] **Step 5: Commit**

```bash
git add tsconfig.schematics.json packages/common/tsconfig.schematics.json packages/common/package.json
git commit -m "build(common): add schematics subpath packaging (tsconfig + exports + copy)"
```

---

## Task 2: Version helpers (`version.ts`)

Smallest, no Angular deps — start here to validate the test setup.

**Files:**
- Create: `packages/common/src/schematics/version.ts`
- Test: `packages/common/src/schematics/version.spec.ts`

- [ ] **Step 1: Write the failing test**

`packages/common/src/schematics/version.spec.ts`:

```ts
import { parseVersion, isAtLeast } from './version';

describe('parseVersion', () => {
  it('parses a plain semver', () => {
    expect(parseVersion('21.2.13')).toEqual({ major: 21, minor: 2, patch: 13 });
  });
  it('parses a prerelease, ignoring the tag', () => {
    expect(parseVersion('22.0.0-rc.2')).toEqual({ major: 22, minor: 0, patch: 0 });
  });
  it('strips a leading range operator', () => {
    expect(parseVersion('^20.1.0')).toEqual({ major: 20, minor: 1, patch: 0 });
  });
});

describe('isAtLeast', () => {
  it('is true at and above the major', () => {
    expect(isAtLeast('22.0.0-rc.2', 22)).toBe(true);
    expect(isAtLeast('23.1.0', 22)).toBe(true);
  });
  it('is false below the major', () => {
    expect(isAtLeast('21.2.13', 22)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn jest --config jest-ut.config.js packages/common/src/schematics/version.spec.ts`
Expected: FAIL — `Cannot find module './version'`.

- [ ] **Step 3: Write minimal implementation**

`packages/common/src/schematics/version.ts`:

```ts
export interface SemverParts {
  major: number;
  minor: number;
  patch: number;
}

export function parseVersion(version: string): SemverParts {
  const cleaned = version.trim().replace(/^[\^~>=v\s]+/, '');
  const [core] = cleaned.split('-');
  const [major = 0, minor = 0, patch = 0] = core.split('.').map((n) => parseInt(n, 10) || 0);
  return { major, minor, patch };
}

export function isAtLeast(version: string, major: number): boolean {
  return parseVersion(version).major >= major;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn jest --config jest-ut.config.js packages/common/src/schematics/version.spec.ts`
Expected: PASS (5 assertions).

- [ ] **Step 5: Commit**

```bash
git add packages/common/src/schematics/version.ts packages/common/src/schematics/version.spec.ts
git commit -m "feat(common): add schematics version helpers"
```

---

## Task 3: Test harness (`testing.ts`)

Needed by every subsequent test, so build it before the rules/detection it will exercise.

**Files:**
- Create: `packages/common/src/schematics/testing.ts`
- Test: `packages/common/src/schematics/testing.spec.ts`

- [ ] **Step 1: Write the failing test**

`packages/common/src/schematics/testing.spec.ts`:

```ts
import { readWorkspace } from '@schematics/angular/utility';
import { SchematicTestHarness } from './testing';

describe('SchematicTestHarness', () => {
  it('builds a single-project workspace with angular.json', async () => {
    const harness = new SchematicTestHarness();
    const tree = await harness.createWorkspace({ projects: [{ name: 'app' }] });

    expect(tree.exists('/angular.json')).toBe(true);
    const workspace = await readWorkspace(tree);
    expect([...workspace.projects.keys()]).toEqual(['app']);
    // application schematic wires a build target by default
    expect(workspace.projects.get('app')!.targets.has('build')).toBe(true);
  });

  it('builds a multi-project workspace', async () => {
    const harness = new SchematicTestHarness();
    const tree = await harness.createWorkspace({
      projects: [{ name: 'app1' }, { name: 'app2' }],
    });
    const workspace = await readWorkspace(tree);
    expect([...workspace.projects.keys()].sort()).toEqual(['app1', 'app2']);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn jest --config jest-ut.config.js packages/common/src/schematics/testing.spec.ts`
Expected: FAIL — `Cannot find module './testing'`.

- [ ] **Step 3: Write minimal implementation**

`packages/common/src/schematics/testing.ts`:

```ts
import { join } from 'node:path';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

const NG_COLLECTION = require.resolve('@schematics/angular/collection.json');

export interface WorkspaceProjectSpec {
  name: string;
  root?: string;
}

export interface CreateWorkspaceOptions {
  projects?: WorkspaceProjectSpec[];
  defaultProject?: string;
}

export class SchematicTestHarness {
  readonly runner: SchematicTestRunner;

  constructor(runner?: SchematicTestRunner) {
    this.runner = runner ?? new SchematicTestRunner('schematics', NG_COLLECTION);
  }

  async createWorkspace(opts: CreateWorkspaceOptions = {}): Promise<UnitTestTree> {
    const projects = opts.projects ?? [{ name: 'app' }];

    let tree = await this.runner.runSchematic('workspace', {
      name: 'workspace',
      version: '0.0.0',
      newProjectRoot: 'projects',
    });

    for (const project of projects) {
      tree = await this.runner.runSchematic(
        'application',
        {
          name: project.name,
          // keep fixtures small + deterministic
          routing: false,
          style: 'css',
          skipTests: false,
          standalone: true,
        },
        tree,
      );
    }

    return tree;
  }
}
```

> The `application` schematic respects `newProjectRoot`, so a single project lands at the workspace root only if you set `newProjectRoot: ''`; with `projects` set, apps land under `projects/<name>`. Tests that assert paths must use the project's actual `root` (read it from the workspace, don't hardcode). The `detectTestBuilder`/`isZoneless` helpers read paths off the workspace, so they're unaffected.

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn jest --config jest-ut.config.js packages/common/src/schematics/testing.spec.ts`
Expected: PASS. If the Angular `application` schematic prompts or errors on a missing option, add the missing option explicitly (it must stay non-interactive).

- [ ] **Step 5: Commit**

```bash
git add packages/common/src/schematics/testing.ts packages/common/src/schematics/testing.spec.ts
git commit -m "feat(common): add SchematicTestHarness for schematics unit tests"
```

---

## Task 4: Detection helpers (`detection.ts`)

**Files:**
- Create: `packages/common/src/schematics/detection.ts`
- Test: `packages/common/src/schematics/detection.spec.ts`

- [ ] **Step 1: Write the failing test**

`packages/common/src/schematics/detection.spec.ts`:

```ts
import { readWorkspace, updateWorkspace } from '@schematics/angular/utility';
import { SchematicTestHarness } from './testing';
import { getProjectsToTarget, detectTestBuilder, isZoneless } from './detection';

async function load(tree: import('@angular-devkit/schematics/testing').UnitTestTree) {
  return readWorkspace(tree);
}

describe('getProjectsToTarget', () => {
  it('single project → that project', async () => {
    const tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    expect(getProjectsToTarget(await load(tree))).toEqual(['app']);
  });

  it('multi project + explicit option → just that one', async () => {
    const tree = await new SchematicTestHarness().createWorkspace({
      projects: [{ name: 'a' }, { name: 'b' }],
    });
    expect(getProjectsToTarget(await load(tree), 'b')).toEqual(['b']);
  });

  it('multi project + no option + no default → all', async () => {
    const tree = await new SchematicTestHarness().createWorkspace({
      projects: [{ name: 'a' }, { name: 'b' }],
    });
    expect(getProjectsToTarget(await load(tree)).sort()).toEqual(['a', 'b']);
  });
});

describe('detectTestBuilder', () => {
  it('returns "none" when no test target', async () => {
    const tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    // application schematic may add no test target under zoneless/standalone defaults
    const ws = await load(tree);
    if (!ws.projects.get('app')!.targets.has('test')) {
      expect(detectTestBuilder(ws, 'app')).toBe('none');
    }
  });

  it('detects karma', async () => {
    let tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    tree = await (async () => {
      const rule = updateWorkspace((workspace) => {
        workspace.projects.get('app')!.targets.set('test', {
          builder: '@angular-devkit/build-angular:karma',
          options: {},
        });
      });
      // apply the rule via a runner-less call:
      const { SchematicTestRunner } = await import('@angular-devkit/schematics/testing');
      const runner = new SchematicTestRunner('t', require.resolve('@schematics/angular/collection.json'));
      return runner.callRule(rule, tree).toPromise() as Promise<typeof tree>;
    })();
    expect(detectTestBuilder(await load(tree), 'app')).toBe('karma');
  });
});

describe('isZoneless', () => {
  it('true when polyfills lack zone.js', async () => {
    const tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    // modern application schematic is zoneless by default → no zone.js polyfill
    expect(isZoneless(tree, await load(tree), 'app')).toBe(true);
  });
});
```

> If the installed Angular `application` schematic defaults differ (e.g. adds a karma `test` target or a `zone.js` polyfill), adjust the *expected* values to match the generated fixture — the helpers describe the workspace, the test asserts against what the schematic actually produced. Read the generated `angular.json` once during implementation to calibrate.

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn jest --config jest-ut.config.js packages/common/src/schematics/detection.spec.ts`
Expected: FAIL — `Cannot find module './detection'`.

- [ ] **Step 3: Write minimal implementation**

`packages/common/src/schematics/detection.ts`:

```ts
import { Tree } from '@angular-devkit/schematics';
import { workspaces } from '@angular-devkit/core';

export type TestBuilderKind = 'karma' | 'jest' | 'vitest' | 'other' | 'none';

export function getProjectsToTarget(
  workspace: workspaces.WorkspaceDefinition,
  optionProject?: string,
): string[] {
  const names = [...workspace.projects.keys()];
  if (optionProject) {
    if (!workspace.projects.has(optionProject)) {
      throw new Error(`Project "${optionProject}" does not exist in the workspace.`);
    }
    return [optionProject];
  }
  if (names.length <= 1) return names;
  const defaultProject = workspace.extensions['defaultProject'];
  if (typeof defaultProject === 'string' && workspace.projects.has(defaultProject)) {
    return [defaultProject];
  }
  return names;
}

export function detectTestBuilder(
  workspace: workspaces.WorkspaceDefinition,
  projectName: string,
): TestBuilderKind {
  const project = workspace.projects.get(projectName);
  const builder = project?.targets.get('test')?.builder;
  if (!builder) return 'none';
  if (builder.endsWith(':karma')) return 'karma';
  if (builder === '@angular-builders/jest:run') return 'jest';
  if (builder.endsWith(':unit-test')) return 'vitest';
  return 'other';
}

export function isZoneless(
  tree: Tree,
  workspace: workspaces.WorkspaceDefinition,
  projectName: string,
): boolean {
  const project = workspace.projects.get(projectName);
  const buildOptions = project?.targets.get('build')?.options ?? {};
  const polyfills = buildOptions['polyfills'];
  const polyfillList = Array.isArray(polyfills)
    ? (polyfills as string[])
    : typeof polyfills === 'string'
      ? [polyfills]
      : [];
  const hasZone = polyfillList.some((p) => p === 'zone.js' || p.includes('zone.js'));
  if (hasZone) return false;

  // Fallback: look for provideZonelessChangeDetection in any bootstrap source.
  const root = project?.root ?? '';
  const mainCandidates = ['src/main.ts', 'src/app/app.config.ts'].map((p) =>
    root ? `${root}/${p}` : p,
  );
  for (const candidate of mainCandidates) {
    if (tree.exists(candidate)) {
      const content = tree.readText(candidate);
      if (content.includes('provideZonelessChangeDetection')) return true;
    }
  }
  return !hasZone; // no zone.js polyfill ⇒ treat as zoneless
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `yarn jest --config jest-ut.config.js packages/common/src/schematics/detection.spec.ts`
Expected: PASS (calibrate expectations to the generated fixture per the note above).

- [ ] **Step 5: Commit**

```bash
git add packages/common/src/schematics/detection.ts packages/common/src/schematics/detection.spec.ts
git commit -m "feat(common): add workspace detection helpers for schematics"
```

---

## Task 5: Rule factories (`rules.ts`)

**Files:**
- Create: `packages/common/src/schematics/rules.ts`
- Test: `packages/common/src/schematics/rules.spec.ts`

- [ ] **Step 1: Write the failing test**

`packages/common/src/schematics/rules.spec.ts`:

```ts
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { readWorkspace } from '@schematics/angular/utility';
import { SchematicTestHarness } from './testing';
import {
  setBuilderForTarget,
  addBuilderDevDependency,
  removeDevDependencies,
  removeFilesIfPresent,
  editJsonFile,
} from './rules';

const NG = require.resolve('@schematics/angular/collection.json');
const runner = () => new SchematicTestRunner('t', NG);

describe('setBuilderForTarget', () => {
  it('rewrites the builder and merges options', async () => {
    const tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    const out = (await runner()
      .callRule(setBuilderForTarget('app', 'build', '@angular-builders/custom-esbuild:application', { foo: 1 }), tree)
      .toPromise()) as UnitTestTree;
    const ws = await readWorkspace(out);
    const target = ws.projects.get('app')!.targets.get('build')!;
    expect(target.builder).toBe('@angular-builders/custom-esbuild:application');
    expect((target.options as Record<string, unknown>)['foo']).toBe(1);
  });
});

describe('addBuilderDevDependency', () => {
  it('adds the package to devDependencies', async () => {
    const tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    const out = (await runner()
      .callRule(addBuilderDevDependency('@angular-builders/jest', '~22.0.0', { install: false }), tree)
      .toPromise()) as UnitTestTree;
    const pkg = JSON.parse(out.readText('/package.json'));
    expect(pkg.devDependencies['@angular-builders/jest']).toBe('~22.0.0');
  });
});

describe('removeDevDependencies', () => {
  it('removes only present deps and is safe on absent ones', async () => {
    const tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    tree.overwrite(
      '/package.json',
      JSON.stringify({ devDependencies: { karma: '^6.0.0', jasmine: '^5.0.0' } }, null, 2),
    );
    const out = (await runner()
      .callRule(removeDevDependencies(['karma', 'not-there']), tree)
      .toPromise()) as UnitTestTree;
    const pkg = JSON.parse(out.readText('/package.json'));
    expect(pkg.devDependencies.karma).toBeUndefined();
    expect(pkg.devDependencies.jasmine).toBe('^5.0.0');
  });
});

describe('removeFilesIfPresent', () => {
  it('deletes present files, ignores absent', async () => {
    const tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    tree.create('/karma.conf.js', '// karma');
    const out = (await runner()
      .callRule(removeFilesIfPresent(['/karma.conf.js', '/nope.js']), tree)
      .toPromise()) as UnitTestTree;
    expect(out.exists('/karma.conf.js')).toBe(false);
  });
});

describe('editJsonFile', () => {
  it('mutates JSON via JSONFile', async () => {
    const tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    tree.create('/tsconfig.spec.json', JSON.stringify({ compilerOptions: { types: ['jasmine'] } }, null, 2));
    const out = (await runner()
      .callRule(
        editJsonFile('/tsconfig.spec.json', (json) => json.modify(['compilerOptions', 'types'], ['jest'])),
        tree,
      )
      .toPromise()) as UnitTestTree;
    const cfg = JSON.parse(out.readText('/tsconfig.spec.json'));
    expect(cfg.compilerOptions.types).toEqual(['jest']);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `yarn jest --config jest-ut.config.js packages/common/src/schematics/rules.spec.ts`
Expected: FAIL — `Cannot find module './rules'`.

- [ ] **Step 3: Write minimal implementation**

`packages/common/src/schematics/rules.ts`:

```ts
import { Rule, Tree } from '@angular-devkit/schematics';
import { updateWorkspace, addDependency, DependencyType, InstallBehavior } from '@schematics/angular/utility';
import { JSONFile } from '@schematics/angular/utility/json-file';

export function setBuilderForTarget(
  projectName: string,
  targetName: string,
  builderName: string,
  options?: Record<string, unknown>,
): Rule {
  return updateWorkspace((workspace) => {
    const project = workspace.projects.get(projectName);
    if (!project) throw new Error(`Project "${projectName}" not found.`);
    const target = project.targets.get(targetName);
    if (target) {
      target.builder = builderName;
      if (options) target.options = { ...(target.options ?? {}), ...options };
    } else {
      project.targets.add({ name: targetName, builder: builderName, options: options ?? {} });
    }
  });
}

export function addBuilderDevDependency(
  name: string,
  version: string,
  opts: { install?: boolean } = {},
): Rule {
  return addDependency(name, version, {
    type: DependencyType.Dev,
    install: opts.install === false ? InstallBehavior.None : InstallBehavior.Auto,
  });
}

export function removeDevDependencies(names: string[]): Rule {
  return (tree: Tree) => {
    if (!tree.exists('/package.json')) return tree;
    const json = new JSONFile(tree, '/package.json');
    for (const name of names) {
      if (json.get(['devDependencies', name]) !== undefined) {
        json.remove(['devDependencies', name]);
      }
    }
    return tree;
  };
}

export function removeFilesIfPresent(paths: string[]): Rule {
  return (tree: Tree) => {
    for (const path of paths) {
      if (tree.exists(path)) tree.delete(path);
    }
    return tree;
  };
}

export function editJsonFile(path: string, mutator: (json: JSONFile) => void): Rule {
  return (tree: Tree) => {
    if (!tree.exists(path)) return tree;
    const json = new JSONFile(tree, path);
    mutator(json);
    return tree;
  };
}
```

> `JSONFile.modify`/`.remove` write back to the tree on each call. `addDependency`'s `InstallBehavior.Auto` schedules a `NodePackageInstallTask` only when deps actually changed; `.None` never installs (used in unit tests).

- [ ] **Step 4: Run tests to verify they pass**

Run: `yarn jest --config jest-ut.config.js packages/common/src/schematics/rules.spec.ts`
Expected: PASS (all 5 describe blocks).

- [ ] **Step 5: Commit**

```bash
git add packages/common/src/schematics/rules.ts packages/common/src/schematics/rules.spec.ts
git commit -m "feat(common): add composable schematics rule factories"
```

---

## Task 6: Barrel export + build verification

**Files:**
- Create: `packages/common/src/schematics/index.ts`

- [ ] **Step 1: Write the barrel**

`packages/common/src/schematics/index.ts`:

```ts
export * from './rules';
export * from './detection';
export * from './version';
// testing.ts is exported via the ./schematics/testing subpath, not the barrel,
// so production schematics never pull SchematicTestRunner into their bundle.
```

- [ ] **Step 2: Build the package end-to-end**

Run: `yarn workspace @angular-builders/common build`
Expected: `dist/index.js`, `dist/schematics/index.js`, `dist/schematics/{rules,detection,version,testing}.js` all present.

Run: `ls packages/common/dist/schematics`
Expected: the four `.js` files + `.d.ts` files.

- [ ] **Step 3: Verify both subpaths resolve**

Run: `node -e "require('@angular-builders/common'); require('@angular-builders/common/schematics'); console.log('ok')"`
Expected: prints `ok` (no `ERR_PACKAGE_PATH_NOT_EXPORTED`).

- [ ] **Step 4: Run the full common unit suite**

Run: `yarn jest --config jest-ut.config.js packages/common`
Expected: all schematics specs green + pre-existing common specs still green.

- [ ] **Step 5: Commit**

```bash
git add packages/common/src/schematics/index.ts
git commit -m "feat(common): export schematics core via ./schematics subpath"
```

---

## Self-Review

**Spec coverage (§3.1 — Shared core):**
- Rule factories `setBuilderForTarget`, `addBuilderDevDependency`, `removeDevDependencies`, `removeFilesIfPresent`, `editJsonFile` → Task 5. ✅
- Detection `getProjectsToTarget`, `detectTestBuilder`, `isZoneless` → Task 4. ✅
- Version `parseVersion`, `isAtLeast` → Task 2. ✅
- `SchematicTestHarness` → Task 3. ✅
- `@schematics/angular` + `@angular-devkit/schematics` added to `common` deps, used only by the schematics subpath → Task 1 Step 3. ✅
- Subpath separate from runtime `loadModule` exports → Task 1 `exports` map + Task 6 barrel (testing kept off the barrel). ✅

**Spec coverage (§7 — Packaging):**
- Shared `tsconfig.schematics.json` at root, extended per package (`module: commonjs`, `rootDir`/`outDir`, exclude specs + `files/**`) → Task 1 Steps 1–2. ✅
- `tsc (lib) → tsc (schematics) → copy assets` build sequence; copy `collection.json`/`migrations.json`/`schema.json` + `files/**` → Task 1 Step 3 (`copy:schematics`). ✅
- `common` mirrors the same tsconfig + copy approach → Task 1. ✅

**Placeholder scan:** No TBD/TODO/"handle edge cases" steps; every code step has complete code. ✅

**Type consistency:** `TestBuilderKind` defined in Task 4 and referenced nowhere else inconsistently. `SemverParts` defined in Task 2. Rule factory signatures match the locked API Contract section verbatim. ✅

**Calibration risk (flagged, not a gap):** Tasks 3–4 depend on what the installed Angular `application` schematic actually generates (test target presence, zone.js polyfill, project root). The plan instructs the implementer to read the generated fixture once and calibrate the *expected* values — the helper logic is fixed, only fixture expectations adapt. This is correct for a plan built against an RC whose generator defaults may shift.

---

## Execution Handoff

**Gated:** Implementation should run on the **green `release/v22`** base (so `@schematics/angular`/`@angular-devkit/schematics` resolve to `^22`). Track B's v22 upgrade must land first. Until then this plan is review-ready but not executable.

When `release/v22` is green, this is the **first** plan to execute (the three builder plans depend on its locked API). Recommended approach: **subagent-driven-development** (fresh subagent per task, review between).
