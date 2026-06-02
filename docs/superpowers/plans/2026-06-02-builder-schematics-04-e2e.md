# Builder Schematics — Integration / e2e Tests (Plan 04) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the spec-§8-mandated **end-to-end layer** for the v22 builder schematics — real-CLI `ng add` runs on real fixture apps (then `ng build`/`ng test` green) plus a `ng update` post-migration build smoke for the heavy jest `@21` migration — wired into the existing integration matrix.

**Architecture:** This is a script/CI-shaped plan, not a TDD-unit one. We reuse the existing harness verbatim: each e2e case is an entry in a `packages/*/tests/integration.js` array (`{ id, name, purpose, app, command }`), executed by `scripts/discover-tests.js` → CI matrix / `scripts/run-local-tests.js`, run via `sh -c <command>` from the fixture app's directory. New fixtures live under `examples/<builder>/` as standalone Yarn-workspace Angular apps. The `ng add` cases drive the **unpublished local build** by `npm pack`-ing the built package into a tarball and running `ng add ./<tarball>` inside a throwaway copy of the fixture — exercising the real resolve → install → run-collection path including save-to-devDependencies. A shared `scripts/e2e-ng-add.js` helper encapsulates the copy → pack → `ng add` → assert dance so each integration entry is a one-line invocation. The jest `@21` smoke seeds a fixture in the **old pre-21 jest config shape**, runs the migration schematic via `ng update --migrate-only`, then `ng build`/`ng test` under v22.

**Tech Stack:** Node.js (CommonJS scripts), Yarn 3 workspaces, Turbo, Angular CLI 22 (RC during execution), `@angular-builders/*` builders, the existing `scripts/run-local-tests.js` + `scripts/discover-tests.js` harness.

---

## Prerequisites & Ground Rules

- **Gated on `release/v22` green** and Plans 00–03 executed (the schematics must exist in `packages/*/src/schematics` and build to `dist/schematics`). This plan tests the artifacts those plans produce; it does not implement any schematic logic.
- **Do NOT duplicate unit coverage.** Plans 00–03 own `SchematicTestRunner`/`UnitTestTree` assertions. Every task here invokes the **real Angular CLI** against a **real fixture** and asserts a real `ng build`/`ng test` result.
- **Harness contract (must hold for every new entry):** export an array of `{ id: string, name: string, purpose: string, app: string, command: string }` from `packages/<pkg>/tests/integration.js`. `id` MUST be globally unique. `app` is a path relative to repo root. `command` runs via `spawn('sh', ['-c', command], { cwd: <app> })`. (Source: `scripts/AGENTS.md` Invariants.)
- **CI is already ~41 jobs.** Each task tags cases **[ESSENTIAL]** or **[OPTIONAL]**. Essential cases ship in the matrix; optional cases are added to `integration.js` but commented with `// [OPTIONAL]` and a one-line rationale so a maintainer can enable them under the `ci:full` label without re-deriving intent. Prefer reusing/extending existing fixtures over new ones.
- **Node:** `.nvmrc` pins `24.16.0`. All `node`/`npm`/`yarn` commands assume that runtime (CI uses `setup-node` with `node-version-file: .nvmrc`).
- **Local run command** for any case: `node scripts/run-local-tests.js --id <id> --verbose` (build the package first: `yarn workspace @angular-builders/<pkg> build` or `yarn build:packages:all`).
- **The verdaccio option (full-fidelity publish/fetch) is deliberately NOT used** — it is overkill for these cases; the `npm pack` → `ng add ./<tarball>` approach already exercises real resolve → install → run-collection incl. save-to-devDependencies. The lighter `--collection` fallback (Task 0) covers environments where tarball resolve misbehaves on the RC.

### File Structure (created/modified by this plan)

- **`scripts/e2e-ng-add.js`** (new) — shared helper: copy fixture to a temp workdir, `npm pack` the built package, `ng add ./<tarball>` (or `--collection` fallback), then run user-supplied assert/build/test commands. One responsibility: drive a local-only `ng add` e2e.
- **`scripts/e2e-assert.js`** (new) — tiny assertion helpers (`assertFileAbsent`, `assertFileContains`, `assertBuilderForTarget`, `assertLogContains`, `assertDevDependency`) used by the `*-ng-add.json` expectation files. One responsibility: declarative post-`ng add` assertions.
- **`scripts/e2e-jest-migration.js`** (new) — jest `@21` migration post-build smoke driver.
- **`examples/jest/karma-app/`** (new fixture) — Karma→Jest `ng add` target (generated via `ng new --test-runner karma`).
- **`examples/jest/vitest-app/`** (new fixture) — Vitest→Jest `ng add` target (default v22 app).
- **`examples/jest/old-config-app/`** (new fixture) — pre-21 jest config shape for the `@21` migration smoke.
- **`examples/custom-esbuild/esbuild-add-app/`** (new fixture) — esbuild app for the build/serve rewrite `ng add` case.
- **`examples/custom-esbuild/webpack-guard-app/`** (new fixture) — webpack-build app to assert the no-silent-swap advisory.
- **`examples/custom-webpack/add-app/`** (new fixture) — clean app (no webpack config) for the build/serve rewrite + scaffold `ng add` case.
- **`packages/jest/tests/integration.js`** (modify) — append jest e2e entries.
- **`packages/custom-esbuild/tests/integration.js`** (modify) — append esbuild e2e entries.
- **`packages/custom-webpack/tests/integration.js`** (modify) — append custom-webpack e2e entry.
- **`docs/runbooks/angular-major-upgrade.md`** (modify) — record the RC-gated multi-major `ng update` validation result.

---

## Task 0: Shared local-only `ng add` e2e helper

**Why first:** Every "A" case (jest, custom-esbuild, custom-webpack) needs the same machinery: stand up a disposable copy of the fixture, pack the locally-built package, run `ng add ./<tarball>`, then assert. Locking this helper first means every later task is a one-line `integration.js` entry plus a small JSON expectation file.

**Files:**
- Create: `scripts/e2e-ng-add.js`
- Create: `scripts/e2e-assert.js`
- Create: `scripts/__fixtures__/e2e-smoke/` (a throwaway 3-file fake "fixture" used only to test the assertion helpers themselves)

- [ ] **Step 1: Write `scripts/e2e-assert.js` (assertion helpers)**

```javascript
'use strict';
// Declarative post-`ng add` assertions used by *-ng-add.json expectation files.
// Each helper throws on failure (non-zero exit propagates through e2e-ng-add.js).
const fs = require('fs');
const path = require('path');

function readJson(workdir, rel) {
  return JSON.parse(fs.readFileSync(path.join(workdir, rel), 'utf8'));
}

// Assert a file does NOT exist (e.g. karma.conf.js removed).
function assertFileAbsent(workdir, rel) {
  if (fs.existsSync(path.join(workdir, rel))) {
    throw new Error(`Expected file to be ABSENT but it exists: ${rel}`);
  }
}

// Assert a file exists and contains a substring (e.g. webpack.config.js scaffold).
function assertFileContains(workdir, rel, substr) {
  const p = path.join(workdir, rel);
  if (!fs.existsSync(p)) throw new Error(`Expected file to exist: ${rel}`);
  const text = fs.readFileSync(p, 'utf8');
  if (!text.includes(substr)) {
    throw new Error(`Expected ${rel} to contain ${JSON.stringify(substr)}`);
  }
}

// Assert angular.json target builder equals expected (e.g. test -> @angular-builders/jest:run).
function assertBuilderForTarget(workdir, project, target, expected) {
  const ng = readJson(workdir, 'angular.json');
  const proj = ng.projects[project];
  if (!proj) throw new Error(`No project "${project}" in angular.json`);
  const tgt = (proj.architect || proj.targets)[target];
  if (!tgt) throw new Error(`No target "${target}" in project "${project}"`);
  const actual = tgt.builder;
  if (actual !== expected) {
    throw new Error(`Target ${project}:${target} builder = ${actual}, expected ${expected}`);
  }
}

// Assert a captured ng-add log file contains an advisory substring (webpack guard).
function assertLogContains(logFile, substr) {
  const text = fs.readFileSync(logFile, 'utf8');
  if (!text.includes(substr)) {
    throw new Error(`Expected ng add log to contain ${JSON.stringify(substr)}`);
  }
}

// Assert a devDependency was saved into package.json (save-to-devDependencies path).
function assertDevDependency(workdir, name) {
  const pkg = readJson(workdir, 'package.json');
  if (!pkg.devDependencies || !pkg.devDependencies[name]) {
    throw new Error(`Expected devDependency "${name}" to be saved in package.json`);
  }
}

module.exports = {
  assertFileAbsent,
  assertFileContains,
  assertBuilderForTarget,
  assertLogContains,
  assertDevDependency,
};
```

- [ ] **Step 2: Write `scripts/e2e-ng-add.js` (the driver)**

```javascript
#!/usr/bin/env node
'use strict';
// Drives a LOCAL-ONLY `ng add` e2e for an unpublished workspace build.
//
// What it does (preferred "npm pack" approach — exercises real resolve -> install -> run-collection):
//   1. Copy the fixture app to a fresh temp workdir (so the fixture stays pristine and
//      parallel matrix jobs never collide).
//   2. `npm pack` the locally-built package -> a .tgz tarball.
//   3. Run `ng add ./<tarball> <ngAddArgs>` in the workdir, capturing combined output to a log file.
//   4. Run the declarative assertions from the spec file against the workdir + log.
//   5. Run the post-add verification commands (e.g. `ng build`, `ng test`) in the workdir.
//
// Usage:
//   node scripts/e2e-ng-add.js --spec <path-to-spec.json>
//
// Spec file shape (JSON):
//   {
//     "fixture": "examples/jest/karma-app",      // relative to repo root
//     "package": "@angular-builders/jest",        // workspace package to pack
//     "ngAddArgs": [],                             // extra args to `ng add`
//     "expectAddSucceeds": true,                   // ng add must exit 0 (default true)
//     "asserts": [                                  // run after ng add, before build/test
//       { "fn": "assertBuilderForTarget", "args": ["karma-app", "test", "@angular-builders/jest:run"] },
//       { "fn": "assertFileAbsent", "args": ["karma.conf.js"] }
//     ],
//     "post": ["npx ng build", "npx ng test"]      // commands run in workdir; each must exit 0
//   }
//
// Fallback (when npm pack + tarball resolve is not viable on the RC): set
//   "useCollectionFallback": true
// which instead runs `ng add <package> --collection <package> ...` against the already
// workspace-linked package. The lighter fallback skips real npm-registry resolve but still
// runs the real CLI + collection. The full-fidelity verdaccio path is intentionally not used.

const { execFileSync, spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('./e2e-assert');

const REPO_ROOT = path.join(__dirname, '..');

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--spec' && argv[i + 1]) out.spec = argv[++i];
  }
  if (!out.spec) {
    console.error('Usage: node scripts/e2e-ng-add.js --spec <spec.json>');
    process.exit(2);
  }
  return out;
}

// Recursively copy a directory, skipping node_modules / .angular / dist caches.
function copyDir(src, dest) {
  const SKIP = new Set(['node_modules', '.angular', 'dist', '.git']);
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function run(cmd, args, opts) {
  console.log(`[e2e-ng-add] $ ${cmd} ${args.join(' ')}  (cwd=${opts.cwd})`);
  const res = spawnSync(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'], ...opts });
  const stdout = (res.stdout || '').toString();
  const stderr = (res.stderr || '').toString();
  process.stdout.write(stdout);
  process.stderr.write(stderr);
  return { status: res.status, stdout, stderr };
}

function main() {
  const { spec: specPath } = parseArgs(process.argv.slice(2));
  const spec = JSON.parse(fs.readFileSync(path.resolve(REPO_ROOT, specPath), 'utf8'));

  const fixtureAbs = path.resolve(REPO_ROOT, spec.fixture);
  if (!fs.existsSync(fixtureAbs)) throw new Error(`Fixture not found: ${spec.fixture}`);

  const workdir = fs.mkdtempSync(path.join(os.tmpdir(), 'ng-add-e2e-'));
  console.log(`[e2e-ng-add] workdir = ${workdir}`);
  copyDir(fixtureAbs, workdir);

  // node_modules: symlink the repo root's hoisted modules so the real Angular CLI resolves.
  // Yarn 3 workspaces hoist everything to the repo root node_modules.
  const wdNodeModules = path.join(workdir, 'node_modules');
  if (!fs.existsSync(wdNodeModules)) {
    fs.symlinkSync(path.join(REPO_ROOT, 'node_modules'), wdNodeModules, 'dir');
  }

  const logFile = path.join(workdir, 'ng-add.log');

  if (spec.useCollectionFallback) {
    // Lighter fallback: real CLI, collection against workspace-linked package.
    const args = ['ng', 'add', spec.package, '--collection', spec.package, '--skip-confirmation',
      ...(spec.ngAddArgs || [])];
    const r = run('npx', args, { cwd: workdir });
    fs.writeFileSync(logFile, r.stdout + r.stderr);
    if ((spec.expectAddSucceeds !== false) && r.status !== 0) {
      throw new Error(`ng add (fallback) failed with status ${r.status}`);
    }
  } else {
    // Preferred: npm pack the locally-built package, then `ng add ./<tarball>`.
    const pkgDir = path.join(REPO_ROOT, 'packages', spec.package.replace('@angular-builders/', ''));
    const packOut = execFileSync('npm', ['pack', '--silent', '--pack-destination', workdir], {
      cwd: pkgDir,
      encoding: 'utf8',
    }).trim();
    const tarball = packOut.split('\n').pop().trim();
    const tarballAbs = path.join(workdir, tarball);
    console.log(`[e2e-ng-add] packed ${spec.package} -> ${tarball}`);
    const args = ['ng', 'add', tarballAbs, '--skip-confirmation', ...(spec.ngAddArgs || [])];
    const r = run('npx', args, { cwd: workdir });
    fs.writeFileSync(logFile, r.stdout + r.stderr);
    if ((spec.expectAddSucceeds !== false) && r.status !== 0) {
      throw new Error(`ng add failed with status ${r.status}`);
    }
  }

  // Declarative assertions (workdir-relative).
  for (const a of spec.asserts || []) {
    const fn = assert[a.fn];
    if (!fn) throw new Error(`Unknown assert fn: ${a.fn}`);
    // assertLogContains takes an absolute log path as first arg; others take workdir.
    if (a.fn === 'assertLogContains') fn(logFile, ...a.args);
    else fn(workdir, ...a.args);
    console.log(`[e2e-ng-add] OK assert ${a.fn}(${JSON.stringify(a.args)})`);
  }

  // Post-add verification commands (real build/test under v22).
  for (const cmd of spec.post || []) {
    const r = run('sh', ['-c', cmd], { cwd: workdir });
    if (r.status !== 0) throw new Error(`post command failed (${r.status}): ${cmd}`);
  }

  console.log('[e2e-ng-add] PASS');
}

try {
  main();
} catch (err) {
  console.error(`[e2e-ng-add] FAIL: ${err.message}`);
  process.exit(1);
}
```

- [ ] **Step 3: Create a self-test fixture for the assertion helpers**

Create `scripts/__fixtures__/e2e-smoke/angular.json`:

```json
{
  "version": 1,
  "projects": {
    "smoke": {
      "projectType": "application",
      "root": "",
      "architect": {
        "test": { "builder": "@angular-devkit/build-angular:karma", "options": {} }
      }
    }
  }
}
```

Create `scripts/__fixtures__/e2e-smoke/karma.conf.js`:

```javascript
module.exports = function () {};
```

Create `scripts/__fixtures__/e2e-smoke/package.json`:

```json
{ "name": "smoke", "private": true }
```

- [ ] **Step 4: Smoke-test the assertion helpers directly (no CLI needed)**

Run:

```bash
cd /Users/jeb/personal-projects/angular-builders && node -e '
const a = require("./scripts/e2e-assert");
const wd = "scripts/__fixtures__/e2e-smoke";
a.assertBuilderForTarget(wd, "smoke", "test", "@angular-devkit/build-angular:karma");
let threw = false;
try { a.assertFileAbsent(wd, "karma.conf.js"); } catch (e) { threw = true; }
if (!threw) { console.error("FAIL: assertFileAbsent did not throw for present file"); process.exit(1); }
a.assertFileAbsent(wd, "does-not-exist.js");
console.log("e2e-assert OK");
'
```

Expected: prints `e2e-assert OK` and exits 0. (Confirms `assertBuilderForTarget` reads the builder, `assertFileAbsent` throws on a present file and passes on an absent one.)

- [ ] **Step 5: Verify the driver is syntactically valid and arg-parses**

Run:

```bash
cd /Users/jeb/personal-projects/angular-builders && node -c scripts/e2e-ng-add.js && echo "syntax-ok" && node scripts/e2e-ng-add.js 2>&1; echo "exit=$?"
```

Expected: prints `syntax-ok`, then the usage error `Usage: node scripts/e2e-ng-add.js --spec <spec.json>` and `exit=2` (no `--spec` provided). Confirms the file parses and the arg guard works without needing the CLI yet.

- [ ] **Step 6: Commit**

```bash
cd /Users/jeb/personal-projects/angular-builders
git add scripts/e2e-ng-add.js scripts/e2e-assert.js scripts/__fixtures__/e2e-smoke
git commit --no-verify -m "test(schematics): add local-only ng add e2e harness helpers"
```

---

## Task 1: jest Karma→Jest `ng add` e2e [ESSENTIAL]

**Spec:** §4.1 (Karma→Jest path), §8 (integration), §12.4 (generate Karma fixture via `ng new --test-runner karma`). Checklist: "jest Karma→Jest AND Vitest→Jest".

**Files:**
- Create: `examples/jest/karma-app/` (Angular workspace generated with Karma)
- Create: `packages/jest/tests/e2e/karma-to-jest.ng-add.json`
- Modify: `packages/jest/tests/integration.js`

- [ ] **Step 1: Generate the Karma fixture**

Karma is NOT removed in v22 (spec §12) — `ng new --test-runner karma` works. Generate into a temp dir then move the app into `examples/jest/karma-app` (do not nest a git repo or lockfile):

```bash
cd /Users/jeb/personal-projects/angular-builders
TMP=$(mktemp -d)
npx -y @angular/cli@22.0.0-rc.2 new karma-app \
  --directory "$TMP/karma-app" \
  --test-runner karma \
  --routing=false --style=scss --skip-git --skip-install --package-manager=yarn
rm -rf "$TMP/karma-app/.git" "$TMP/karma-app/.vscode" "$TMP/karma-app/yarn.lock" "$TMP/karma-app/.editorconfig"
mkdir -p examples/jest
cp -R "$TMP/karma-app" examples/jest/karma-app
rm -rf "$TMP"
```

Expected: `examples/jest/karma-app/angular.json` exists with `test` builder `@angular/build:karma` (or `@angular-devkit/build-angular:karma`), and `examples/jest/karma-app/karma.conf.js` exists.

- [ ] **Step 2: Pin the fixture to workspace-managed Angular and register as workspace**

Set the app's `package.json` `name` and align Angular versions to the workspace (mirror `examples/jest/simple-app/package.json` versions so hoisting resolves). Edit `examples/jest/karma-app/package.json`: set `"name": "karma-app"`, `"private": true`, remove any `"packageManager"` field, and pin `@angular/*`, `@angular/cli`, `@angular/build`/`@angular-devkit/build-angular`, `typescript`, `zone.js` to the same versions used in `examples/jest/simple-app/package.json`. The Yarn glob `examples/jest/*` (root `package.json` workspaces) auto-discovers it.

Run to confirm discovery:

```bash
cd /Users/jeb/personal-projects/angular-builders && yarn workspaces list --json | grep karma-app && echo "discovered"
```

Expected: prints a line for `examples/jest/karma-app` and `discovered`.

- [ ] **Step 3: Write the e2e spec file**

Create `packages/jest/tests/e2e/karma-to-jest.ng-add.json`:

```json
{
  "fixture": "examples/jest/karma-app",
  "package": "@angular-builders/jest",
  "ngAddArgs": [],
  "asserts": [
    { "fn": "assertBuilderForTarget", "args": ["karma-app", "test", "@angular-builders/jest:run"] },
    { "fn": "assertFileAbsent", "args": ["karma.conf.js"] },
    { "fn": "assertDevDependency", "args": ["jest"] }
  ],
  "post": ["npx ng test"]
}
```

> `post` runs `ng test` which now resolves to `@angular-builders/jest:run` — proving the Karma config was removed AND the Jest run is green. `ng build` is exercised by the Vitest case (Task 2) to avoid redundant build cost; Karma's case focuses on the test-runner swap.

- [ ] **Step 4: Add the integration entry**

Add to the array in `packages/jest/tests/integration.js` (append before the closing `];`):

```javascript
  // --- ng add e2e (Plan 04) ---
  {
    id: 'ng-add-karma-to-jest',
    name: 'jest: ng add Karma->Jest',
    purpose: 'ng add removes Karma and ng test runs green via Jest',
    app: '.',
    command:
      'node scripts/e2e-ng-add.js --spec packages/jest/tests/e2e/karma-to-jest.ng-add.json',
  },
```

> `app: '.'` runs the command from the repo root (the helper resolves fixture + package paths relative to repo root and copies the fixture to a temp workdir, so it must run from root, not from inside the fixture). The harness `cwd` is `path.join(repoRoot, test.app)` → repo root.

- [ ] **Step 5: Build the jest package and run the case**

```bash
cd /Users/jeb/personal-projects/angular-builders
yarn workspace @angular-builders/jest build
node scripts/run-local-tests.js --id ng-add-karma-to-jest --verbose
```

Expected: `PASS [..s] ng-add-karma-to-jest`. The log shows `npm pack` producing a `.tgz`, `ng add` removing `karma.conf.js`, then `ng test` exiting 0.

- [ ] **Step 6: Commit**

```bash
cd /Users/jeb/personal-projects/angular-builders
git add examples/jest/karma-app packages/jest/tests/e2e/karma-to-jest.ng-add.json packages/jest/tests/integration.js
git commit --no-verify -m "test(jest): add Karma->Jest ng add e2e"
```

---

## Task 2: jest Vitest→Jest `ng add` e2e [ESSENTIAL]

**Spec:** §12.2 (Vitest→Jest, the forward-default), §8, §4.1.

**Files:**
- Create: `examples/jest/vitest-app/`
- Create: `packages/jest/tests/e2e/vitest-to-jest.ng-add.json`
- Modify: `packages/jest/tests/integration.js`

- [ ] **Step 1: Generate the default (Vitest) v22 fixture**

Fresh v22 apps default to Vitest (`@angular/build:unit-test`). Omit `--test-runner` so it picks the default:

```bash
cd /Users/jeb/personal-projects/angular-builders
TMP=$(mktemp -d)
npx -y @angular/cli@22.0.0-rc.2 new vitest-app \
  --directory "$TMP/vitest-app" \
  --routing=false --style=scss --skip-git --skip-install --package-manager=yarn
rm -rf "$TMP/vitest-app/.git" "$TMP/vitest-app/.vscode" "$TMP/vitest-app/yarn.lock" "$TMP/vitest-app/.editorconfig"
cp -R "$TMP/vitest-app" examples/jest/vitest-app
rm -rf "$TMP"
```

Expected: `examples/jest/vitest-app/angular.json` has `test` builder `@angular/build:unit-test`; no `karma.conf.js`.

- [ ] **Step 2: Register + pin (same as Task 1 Step 2)**

Edit `examples/jest/vitest-app/package.json`: `"name": "vitest-app"`, `"private": true`, drop `packageManager`, pin `@angular/*`/CLI/build/typescript/zone.js to the workspace versions from `examples/jest/simple-app/package.json`.

Run:

```bash
cd /Users/jeb/personal-projects/angular-builders && yarn workspaces list --json | grep vitest-app && echo "discovered"
```

Expected: prints the `examples/jest/vitest-app` entry and `discovered`.

- [ ] **Step 3: Write the e2e spec file**

Create `packages/jest/tests/e2e/vitest-to-jest.ng-add.json`:

```json
{
  "fixture": "examples/jest/vitest-app",
  "package": "@angular-builders/jest",
  "ngAddArgs": [],
  "asserts": [
    { "fn": "assertBuilderForTarget", "args": ["vitest-app", "test", "@angular-builders/jest:run"] },
    { "fn": "assertDevDependency", "args": ["jest"] }
  ],
  "post": ["npx ng build", "npx ng test"]
}
```

> The Vitest `unit-test` target is overwritten to `@angular-builders/jest:run` (spec §12.2 — no `karma.conf` equivalent to delete). `post` runs BOTH `ng build` (proves the app still builds after the runner swap) and `ng test` (proves Jest is green). The generated default spec uses framework-agnostic `expect`/`it`, so no `vi.*` porting is needed for the smoke to pass.

- [ ] **Step 4: Add the integration entry**

Append to `packages/jest/tests/integration.js`:

```javascript
  {
    id: 'ng-add-vitest-to-jest',
    name: 'jest: ng add Vitest->Jest',
    purpose: 'ng add rewrites Vitest unit-test to Jest; ng build + ng test green',
    app: '.',
    command:
      'node scripts/e2e-ng-add.js --spec packages/jest/tests/e2e/vitest-to-jest.ng-add.json',
  },
```

- [ ] **Step 5: Run the case**

```bash
cd /Users/jeb/personal-projects/angular-builders
yarn workspace @angular-builders/jest build
node scripts/run-local-tests.js --id ng-add-vitest-to-jest --verbose
```

Expected: `PASS [..s] ng-add-vitest-to-jest`. Log shows the `test` builder rewritten, `ng build` exit 0, `ng test` exit 0.

- [ ] **Step 6: Commit**

```bash
cd /Users/jeb/personal-projects/angular-builders
git add examples/jest/vitest-app packages/jest/tests/e2e/vitest-to-jest.ng-add.json packages/jest/tests/integration.js
git commit --no-verify -m "test(jest): add Vitest->Jest ng add e2e"
```

---

## Task 3: custom-esbuild build/serve rewrite `ng add` e2e [ESSENTIAL]

**Spec:** §4.2, §8, §12.3 (the safe esbuild-build branch). Checklist: "custom-esbuild build/serve rewrite on an esbuild app → ng build/ng test green".

**Files:**
- Create: `examples/custom-esbuild/esbuild-add-app/`
- Create: `packages/custom-esbuild/tests/e2e/esbuild-add.ng-add.json`
- Modify: `packages/custom-esbuild/tests/integration.js`

- [ ] **Step 1: Generate an esbuild (application builder) fixture**

A fresh v22 `ng new` app uses `@angular/build:application` (esbuild) for `build` and `@angular/build:dev-server` for `serve`. Use `--test-runner karma` so the `test` target is a different toolchain (esbuild plugins do not apply there) — this exercises the "leave test, advise" branch AND keeps `ng test` runnable without Vitest experimental flags:

```bash
cd /Users/jeb/personal-projects/angular-builders
TMP=$(mktemp -d)
npx -y @angular/cli@22.0.0-rc.2 new esbuild-add-app \
  --directory "$TMP/esbuild-add-app" \
  --test-runner karma \
  --routing=false --style=scss --skip-git --skip-install --package-manager=yarn
rm -rf "$TMP/esbuild-add-app/.git" "$TMP/esbuild-add-app/.vscode" "$TMP/esbuild-add-app/yarn.lock" "$TMP/esbuild-add-app/.editorconfig"
mkdir -p examples/custom-esbuild
cp -R "$TMP/esbuild-add-app" examples/custom-esbuild/esbuild-add-app
rm -rf "$TMP"
```

Expected: `angular.json` `build` builder is `@angular/build:application`, `serve` is `@angular/build:dev-server`.

- [ ] **Step 2: Register + pin**

Edit `examples/custom-esbuild/esbuild-add-app/package.json`: `"name": "esbuild-add-app"`, `"private": true`, drop `packageManager`, pin Angular/CLI/build/typescript/zone.js to the versions in `examples/custom-esbuild/sanity-esbuild-app/package.json`.

```bash
cd /Users/jeb/personal-projects/angular-builders && yarn workspaces list --json | grep esbuild-add-app && echo "discovered"
```

Expected: prints the entry and `discovered`.

- [ ] **Step 3: Write the e2e spec file**

Create `packages/custom-esbuild/tests/e2e/esbuild-add.ng-add.json`:

```json
{
  "fixture": "examples/custom-esbuild/esbuild-add-app",
  "package": "@angular-builders/custom-esbuild",
  "ngAddArgs": [],
  "asserts": [
    { "fn": "assertBuilderForTarget", "args": ["esbuild-add-app", "build", "@angular-builders/custom-esbuild:application"] },
    { "fn": "assertBuilderForTarget", "args": ["esbuild-add-app", "serve", "@angular-builders/custom-esbuild:dev-server"] },
    { "fn": "assertDevDependency", "args": ["@angular-builders/custom-esbuild"] }
  ],
  "post": ["npx ng build"]
}
```

> Asserts the safe esbuild-build rewrite (spec §12.3). `post` runs `ng build` (green proves the rewritten builder runs). `ng test` is intentionally omitted: the Karma test target is left untouched (advisory branch), so testing it would re-cover existing Karma behavior, not the schematic. The webpack-guard branch is Task 4.

- [ ] **Step 4: Add the integration entry**

Append to `packages/custom-esbuild/tests/integration.js`:

```javascript
  // --- ng add e2e (Plan 04) ---
  {
    id: 'ng-add-esbuild-rewrite',
    name: 'custom-esbuild: ng add build/serve rewrite',
    purpose: 'ng add rewrites esbuild build/serve to custom-esbuild; ng build green',
    app: '.',
    command:
      'node scripts/e2e-ng-add.js --spec packages/custom-esbuild/tests/e2e/esbuild-add.ng-add.json',
  },
```

- [ ] **Step 5: Run the case**

```bash
cd /Users/jeb/personal-projects/angular-builders
yarn workspace @angular-builders/custom-esbuild build
node scripts/run-local-tests.js --id ng-add-esbuild-rewrite --verbose
```

Expected: `PASS [..s] ng-add-esbuild-rewrite`. Log shows `build`/`serve` rewritten and `ng build` exit 0.

- [ ] **Step 6: Commit**

```bash
cd /Users/jeb/personal-projects/angular-builders
git add examples/custom-esbuild/esbuild-add-app packages/custom-esbuild/tests/e2e/esbuild-add.ng-add.json packages/custom-esbuild/tests/integration.js
git commit --no-verify -m "test(custom-esbuild): add build/serve rewrite ng add e2e"
```

---

## Task 4: custom-esbuild webpack-build guard `ng add` e2e [ESSENTIAL]

**Spec:** §12.3 (do NOT silently swap a webpack build; emit advisory), §8. Checklist: "the webpack-build guard case — assert ng add does NOT silently swap it and emits the advisory".

**Files:**
- Create: `examples/custom-esbuild/webpack-guard-app/`
- Create: `packages/custom-esbuild/tests/e2e/webpack-guard.ng-add.json`
- Modify: `packages/custom-esbuild/tests/integration.js`

- [ ] **Step 1: Build a webpack-build fixture**

The guard fires when `build` is `@angular-devkit/build-angular:browser` (webpack). Reuse the esbuild fixture's structure but rewrite its `build`/`serve` builders to the webpack builders. Copy the Task 3 fixture and edit `angular.json`:

```bash
cd /Users/jeb/personal-projects/angular-builders
cp -R examples/custom-esbuild/esbuild-add-app examples/custom-esbuild/webpack-guard-app
```

Then edit `examples/custom-esbuild/webpack-guard-app/package.json` → `"name": "webpack-guard-app"`. Edit `examples/custom-esbuild/webpack-guard-app/angular.json` so the `build` target builder is `@angular-devkit/build-angular:browser` and `serve` is `@angular-devkit/build-angular:dev-server` (and ensure `@angular-devkit/build-angular` is in the fixture devDependencies — it is hoisted from the workspace). Replace the generated `application` options with `browser`-builder options (`main`, `index`, `tsConfig`, `polyfills: ["zone.js"]`, `outputPath`, `assets`, `styles`) — mirror `examples/custom-webpack/sanity-app/angular.json`'s `build` options.

```bash
cd /Users/jeb/personal-projects/angular-builders && yarn workspaces list --json | grep webpack-guard-app && echo "discovered"
```

Expected: prints the entry and `discovered`.

- [ ] **Step 2: Write the e2e spec file**

Create `packages/custom-esbuild/tests/e2e/webpack-guard.ng-add.json`:

```json
{
  "fixture": "examples/custom-esbuild/webpack-guard-app",
  "package": "@angular-builders/custom-esbuild",
  "ngAddArgs": [],
  "expectAddSucceeds": true,
  "asserts": [
    { "fn": "assertBuilderForTarget", "args": ["webpack-guard-app", "build", "@angular-devkit/build-angular:browser"] },
    { "fn": "assertBuilderForTarget", "args": ["webpack-guard-app", "serve", "@angular-devkit/build-angular:dev-server"] },
    { "fn": "assertLogContains", "args": ["use-application-builder"] }
  ],
  "post": []
}
```

> The two `assertBuilderForTarget` asserts prove the webpack `build`/`serve` were **left untouched** (no silent swap). `assertLogContains` proves the advisory was emitted (the §12.3 message points at Angular's `use-application-builder` migration). `expectAddSucceeds: true` — the guard is advisory, `ng add` still exits 0. No `post` build: the point is the guard, not a webpack build (already covered by custom-webpack examples).

- [ ] **Step 3: Add the integration entry**

Append to `packages/custom-esbuild/tests/integration.js`:

```javascript
  {
    id: 'ng-add-esbuild-webpack-guard',
    name: 'custom-esbuild: ng add webpack guard',
    purpose: 'ng add leaves a webpack build untouched and emits the use-application-builder advisory',
    app: '.',
    command:
      'node scripts/e2e-ng-add.js --spec packages/custom-esbuild/tests/e2e/webpack-guard.ng-add.json',
  },
```

- [ ] **Step 4: Run the case**

```bash
cd /Users/jeb/personal-projects/angular-builders
yarn workspace @angular-builders/custom-esbuild build
node scripts/run-local-tests.js --id ng-add-esbuild-webpack-guard --verbose
```

Expected: `PASS [..s] ng-add-esbuild-webpack-guard`. Log shows `ng add` exit 0, builders unchanged, advisory text present.

> CALIBRATION: if the advisory string in the implemented schematic differs from `use-application-builder`, update the `assertLogContains` arg to match the exact advisory text emitted by `packages/custom-esbuild/src/schematics/ng-add/index.ts` (Plan 02 Task 3b). Read that file to confirm the exact wording before finalizing.

- [ ] **Step 5: Commit**

```bash
cd /Users/jeb/personal-projects/angular-builders
git add examples/custom-esbuild/webpack-guard-app packages/custom-esbuild/tests/e2e/webpack-guard.ng-add.json packages/custom-esbuild/tests/integration.js
git commit --no-verify -m "test(custom-esbuild): add webpack-build guard ng add e2e"
```

---

## Task 5: custom-webpack build/serve rewrite + scaffold `ng add` e2e [ESSENTIAL]

**Spec:** §4.3, §12.1 (ng-add only), §8. Checklist: "custom-webpack build/serve rewrite + webpack.config.js scaffold → ng build green".

**Files:**
- Create: `examples/custom-webpack/add-app/`
- Create: `packages/custom-webpack/tests/e2e/webpack-add.ng-add.json`
- Modify: `packages/custom-webpack/tests/integration.js`

- [ ] **Step 1: Generate a clean fixture (no webpack config)**

Generate a default app, then rewrite `build`/`serve` to the webpack builders custom-webpack wraps (`@angular-devkit/build-angular:browser` / `:dev-server`). Generate with Karma so `ng test` stays simple (custom-webpack does not touch `test`):

```bash
cd /Users/jeb/personal-projects/angular-builders
TMP=$(mktemp -d)
npx -y @angular/cli@22.0.0-rc.2 new add-app \
  --directory "$TMP/add-app" \
  --test-runner karma \
  --routing=false --style=scss --skip-git --skip-install --package-manager=yarn
rm -rf "$TMP/add-app/.git" "$TMP/add-app/.vscode" "$TMP/add-app/yarn.lock" "$TMP/add-app/.editorconfig"
mkdir -p examples/custom-webpack
cp -R "$TMP/add-app" examples/custom-webpack/add-app
rm -rf "$TMP"
```

- [ ] **Step 2: Rewrite to webpack builders + register/pin**

Edit `examples/custom-webpack/add-app/package.json` → `"name": "add-app"`, `"private": true`, drop `packageManager`, pin Angular/CLI/`@angular-devkit/build-angular`/typescript/zone.js to the versions in `examples/custom-webpack/sanity-app/package.json`. Edit `examples/custom-webpack/add-app/angular.json` so `build` builder is `@angular-devkit/build-angular:browser` and `serve` is `@angular-devkit/build-angular:dev-server`, with `build` options mirroring `examples/custom-webpack/sanity-app/angular.json` (`main`, `index`, `polyfills: ["zone.js"]`, `tsConfig`, `outputPath`, `assets`, `styles`). Ensure there is NO `webpack.config.js` in the fixture (the scaffold must be created by `ng add`).

```bash
cd /Users/jeb/personal-projects/angular-builders && yarn workspaces list --json | grep custom-webpack/add-app && echo "discovered" && ls examples/custom-webpack/add-app/webpack.config.js 2>&1 | grep -q "No such" && echo "no-config-present"
```

Expected: prints `discovered` and `no-config-present`.

- [ ] **Step 3: Write the e2e spec file**

Create `packages/custom-webpack/tests/e2e/webpack-add.ng-add.json`:

```json
{
  "fixture": "examples/custom-webpack/add-app",
  "package": "@angular-builders/custom-webpack",
  "ngAddArgs": [],
  "asserts": [
    { "fn": "assertBuilderForTarget", "args": ["add-app", "build", "@angular-builders/custom-webpack:browser"] },
    { "fn": "assertBuilderForTarget", "args": ["add-app", "serve", "@angular-builders/custom-webpack:dev-server"] },
    { "fn": "assertFileContains", "args": ["webpack.config.js", "module.exports"] },
    { "fn": "assertDevDependency", "args": ["@angular-builders/custom-webpack"] }
  ],
  "post": ["npx ng build"]
}
```

> Asserts the build/serve rewrite, the scaffolded `webpack.config.js` (contains `module.exports` per Plan 03 Task 3's template), and self saved to devDeps. `post` `ng build` green proves the custom-webpack builder runs with the scaffolded (inert) config. custom-webpack ships ng-add only (no migration), so no `ng update` smoke here.

- [ ] **Step 4: Add the integration entry**

Append to `packages/custom-webpack/tests/integration.js`:

```javascript
  // --- ng add e2e (Plan 04) ---
  {
    id: 'ng-add-webpack-rewrite-scaffold',
    name: 'custom-webpack: ng add rewrite + scaffold',
    purpose: 'ng add rewrites build/serve, scaffolds webpack.config.js; ng build green',
    app: '.',
    command:
      'node scripts/e2e-ng-add.js --spec packages/custom-webpack/tests/e2e/webpack-add.ng-add.json',
  },
```

- [ ] **Step 5: Run the case**

```bash
cd /Users/jeb/personal-projects/angular-builders
yarn workspace @angular-builders/custom-webpack build
node scripts/run-local-tests.js --id ng-add-webpack-rewrite-scaffold --verbose
```

Expected: `PASS [..s] ng-add-webpack-rewrite-scaffold`. Log shows builders rewritten, `webpack.config.js` created, `ng build` exit 0.

- [ ] **Step 6: Commit**

```bash
cd /Users/jeb/personal-projects/angular-builders
git add examples/custom-webpack/add-app packages/custom-webpack/tests/e2e/webpack-add.ng-add.json packages/custom-webpack/tests/integration.js
git commit --no-verify -m "test(custom-webpack): add build/serve rewrite + scaffold ng add e2e"
```

---

## Task 6: jest `@21` post-migration build smoke [ESSENTIAL]

**Spec:** §4.1 (`ng update @21` heavy migration), §8 (migrations: seed pre-migration shape, assert transforms — here extended to a real build/test). Checklist B: "seed a fixture in the old pre-21 jest config shape, run the jest @21 migration, then materialize the tree and ng build/ng test under v22 to prove the migrated config is valid/runnable".

A full cross-major `ng update` is out of scope (needs old toolchain + network). Instead we run the **migration schematic only** via `ng update --migrate-only --from`, against a v22-installed fixture seeded in the pre-21 config shape, then build/test under v22.

**Files:**
- Create: `examples/jest/old-config-app/` (v22 app, but with pre-21 jest config shape)
- Create: `scripts/e2e-jest-migration.js`
- Create: `packages/jest/tests/e2e/migration-v21.smoke.json` (intent documentation)
- Modify: `packages/jest/tests/integration.js`

- [ ] **Step 1: Create the old-config fixture by copying the jest simple-app and downgrading its config shape**

Start from a known-good jest fixture and rewrite its config into the pre-21 shape (the migration only rewrites config — no old toolchain needed):

```bash
cd /Users/jeb/personal-projects/angular-builders
cp -R examples/jest/simple-app examples/jest/old-config-app
```

Edit `examples/jest/old-config-app/package.json` → `"name": "old-config-app"`. Keep `@angular-builders/jest: "workspace:*"` and v22-aligned Angular versions (the BUILD/TEST runs under v22). Now seed the **pre-21 jest config shape** that `migration-v21` transforms (spec §4.1, Plan 01 Tasks 7–10):

1. Edit `examples/jest/old-config-app/tsconfig.spec.json` so `compilerOptions` does NOT have `module`/`moduleResolution: "Node16"` and does NOT have `isolatedModules: true` (use `"module": "ESNext"`, `"moduleResolution": "node"`, omit `isolatedModules`). This is what the migration patches.
2. Edit `examples/jest/old-config-app/angular.json` `test` target options into the old shape: use `"configPath": "jest.config.js"` (old name → migration renames to `config`) and add `"testPathPattern": "src/.*\\.spec\\.ts$"` (old name → migration renames to `testPathPatterns`). Keep the builder `@angular-builders/jest:run`.
3. Ensure `examples/jest/old-config-app/jest.config.js` exists (a minimal `module.exports = { preset: 'jest-preset-angular' };`) so `configPath` resolves post-rename.

```bash
cd /Users/jeb/personal-projects/angular-builders && yarn workspaces list --json | grep old-config-app && echo "discovered"
```

Expected: prints the entry and `discovered`.

- [ ] **Step 2: Write the migration-smoke driver**

The migration must run against a workdir copy (don't mutate the fixture). `ng update --migrate-only --from` runs a package's migrations within a window without touching node_modules. Create `scripts/e2e-jest-migration.js`:

```javascript
#!/usr/bin/env node
'use strict';
// jest @21 migration POST-MIGRATION BUILD SMOKE.
// 1. Copy the old-config fixture to a temp workdir.
// 2. Run the jest @21 migration schematic (real CLI) via:
//      ng update @angular-builders/jest --migrate-only --from=20.0.0 --to=22.0.0 --allow-dirty --force
//    (--from < 21 <= --to so the (from, to] window includes the 21.0.0 threshold and migration-v21 fires).
// 3. Assert the config was actually transformed (renames + tsconfig patch).
// 4. ng build + ng test under v22 to prove the migrated config is valid/runnable.

const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '..');
const FIXTURE = 'examples/jest/old-config-app';

function copyDir(src, dest) {
  const SKIP = new Set(['node_modules', '.angular', 'dist', '.git']);
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function run(cmd, args, cwd) {
  console.log(`[jest-migration] $ ${cmd} ${args.join(' ')}  (cwd=${cwd})`);
  const res = spawnSync(cmd, args, { cwd, stdio: 'inherit' });
  return res.status;
}

function main() {
  const workdir = fs.mkdtempSync(path.join(os.tmpdir(), 'jest-mig-'));
  copyDir(path.join(REPO_ROOT, FIXTURE), workdir);
  fs.symlinkSync(path.join(REPO_ROOT, 'node_modules'), path.join(workdir, 'node_modules'), 'dir');

  // Run ONLY the jest @21 migration over the (20, 22] window.
  const status = run('npx', [
    'ng', 'update', '@angular-builders/jest',
    '--migrate-only', '--from=20.0.0', '--to=22.0.0', '--allow-dirty', '--force',
  ], workdir);
  if (status !== 0) throw new Error(`ng update --migrate-only failed with status ${status}`);

  // Assert the transforms landed.
  const ng = JSON.parse(fs.readFileSync(path.join(workdir, 'angular.json'), 'utf8'));
  const proj = ng.projects['old-config-app'];
  const testOpts = (proj.architect || proj.targets).test.options || {};
  if (testOpts.configPath !== undefined) throw new Error('configPath not renamed (still present)');
  if (testOpts.config === undefined) throw new Error('config (renamed from configPath) missing');
  if (testOpts.testPathPattern !== undefined) throw new Error('testPathPattern not renamed');
  if (testOpts.testPathPatterns === undefined) throw new Error('testPathPatterns (renamed) missing');

  const spec = JSON.parse(fs.readFileSync(path.join(workdir, 'tsconfig.spec.json'), 'utf8'));
  if (spec.compilerOptions.module !== 'Node16') throw new Error('tsconfig module not Node16');
  if (spec.compilerOptions.isolatedModules !== true) throw new Error('isolatedModules not true');
  console.log('[jest-migration] transform assertions OK');

  // Prove the migrated config is valid/runnable under v22.
  if (run('sh', ['-c', 'npx ng build'], workdir) !== 0) throw new Error('ng build failed post-migration');
  if (run('sh', ['-c', 'npx ng test'], workdir) !== 0) throw new Error('ng test failed post-migration');

  console.log('[jest-migration] PASS');
}

try {
  main();
} catch (err) {
  console.error(`[jest-migration] FAIL: ${err.message}`);
  process.exit(1);
}
```

> CALIBRATION: the assertion property names (`config`/`configPath`, `testPathPatterns`/`testPathPattern`, `Node16`, `isolatedModules`) come directly from Plan 01 Tasks 7–8 (jest `@21` migration). If Plan 01's final implementation renames differently, reconcile these strings against `packages/jest/src/schematics/migrations/v21/index.ts` before finalizing.

- [ ] **Step 3: Write the intent-documentation spec file**

Create `packages/jest/tests/e2e/migration-v21.smoke.json` (documents intent; the integration entry calls the dedicated driver directly):

```json
{
  "describes": "jest @21 migration post-migration build smoke",
  "fixture": "examples/jest/old-config-app",
  "runs": "scripts/e2e-jest-migration.js",
  "window": "ng update --migrate-only --from=20.0.0 --to=22.0.0",
  "proves": "renames (configPath->config, testPathPattern->testPathPatterns) + tsconfig Node16/isolatedModules, then ng build + ng test green under v22"
}
```

- [ ] **Step 4: Add the integration entry**

Append to `packages/jest/tests/integration.js`:

```javascript
  {
    id: 'ng-update-jest-v21-smoke',
    name: 'jest: @21 migration post-build smoke',
    purpose: 'jest @21 migration produces valid config; ng build + ng test green under v22',
    app: '.',
    command: 'node scripts/e2e-jest-migration.js',
  },
```

- [ ] **Step 5: Run the case**

```bash
cd /Users/jeb/personal-projects/angular-builders
yarn workspace @angular-builders/jest build
node scripts/run-local-tests.js --id ng-update-jest-v21-smoke --verbose
```

Expected: `PASS [..s] ng-update-jest-v21-smoke`. Log shows `ng update --migrate-only` running `migration-v21`, transform assertions OK, `ng build` exit 0, `ng test` exit 0.

- [ ] **Step 6: Commit**

```bash
cd /Users/jeb/personal-projects/angular-builders
git add examples/jest/old-config-app scripts/e2e-jest-migration.js packages/jest/tests/e2e/migration-v21.smoke.json packages/jest/tests/integration.js
git commit --no-verify -m "test(jest): add @21 migration post-build smoke e2e"
```

---

## Task 7: RC-gated multi-major `ng update` window validation [ESSENTIAL — validation, no new CI job]

**Spec:** §10 (v22 RC gating), checklist "RC-gated validations": confirm the CLI permits a third-party package's old→22 jump and runs the spanned migrations; cross-references jest Plan 01 Task 6 note. This is a one-time manual validation during execution, recorded in the runbook — NOT a recurring matrix job (it depends on real network/registry behavior and is too flaky to gate CI).

**Files:**
- Modify: `docs/runbooks/angular-major-upgrade.md`

- [ ] **Step 1: Run the multi-major window probe against the RC**

On a temp copy of `examples/jest/old-config-app` (with `@angular-builders/jest` pinned to an old major in package.json if probing the real install path), confirm whether `ng update` permits the old→22 jump for the package and runs the spanned migrations:

```bash
cd /Users/jeb/personal-projects/angular-builders
TMP=$(mktemp -d) && cp -R examples/jest/old-config-app "$TMP/app" && ln -s "$PWD/node_modules" "$TMP/app/node_modules"
cd "$TMP/app" && npx ng update @angular-builders/jest@22.0.0-rc.2 --from=20.0.0 --migrate-only --allow-dirty --force; echo "exit=$?"
```

Expected: exit 0 with `migration-v21` (and the `migration-v22` advisory) appearing in output. If the CLI **refuses** the multi-major jump, note the refusal and the documented fallback: `ng update @angular-builders/jest@22 --from=<old> --migrate-only` (per Plan 01 Task 6 / checklist).

- [ ] **Step 2: Record the result in the upgrade runbook**

In `docs/runbooks/angular-major-upgrade.md`, under the migration-coverage section, add a subsection (fill in the actual observed behavior — permitted vs refused — before committing):

```markdown
### RC-validated: multi-major `ng update` window (v22)

Validated against `@angular/cli@22.0.0-rc.2` on `2026-06-02`:

- `ng update @angular-builders/jest` from an old major (e.g. 20) to 22 in ONE step runs the spanned
  migrations — the `(from, to]` window includes the `21.0.0` threshold, so the heavy `migration-v21`
  fires. Dragging the builder *stepwise* through 21 (which shipped no `migrations.json`) SKIPS it.
- Supported flow for v17–v20 users: upgrade the Angular framework stepwise to 22, leave
  `@angular-builders/jest` untouched, then run `ng update @angular-builders/jest` ONCE.
- If the CLI refuses the multi-major jump, use:
  `ng update @angular-builders/jest@22 --from=<old> --migrate-only`.
- E2E coverage of the migration output itself: `ng-update-jest-v21-smoke` (Plan 04 Task 6).
```

- [ ] **Step 3: Commit**

```bash
cd /Users/jeb/personal-projects/angular-builders
git add docs/runbooks/angular-major-upgrade.md
git commit --no-verify -m "docs(runbook): record RC-validated multi-major ng update window"
```

---

## Task 8: Matrix sanity + CI-cost annotation

**Why:** New `examples/*` apps must be tracked (so version-update automation + Yarn workspaces see them), and `discover-tests.js` must emit all new entries with unique ids. Then control CI cost.

**Files:**
- Verify: the six new fixtures' `package.json` files are git-tracked
- Modify (conditional): `packages/custom-esbuild/tests/integration.js` (optional annotation)

- [ ] **Step 1: Confirm `update-example.js` / Yarn discover the new fixtures**

```bash
cd /Users/jeb/personal-projects/angular-builders
node -e 'const cp=require("child_process"); const out=cp.execSync("git ls-files examples/*/*/package.json examples/*/package.json").toString(); ["karma-app","vitest-app","old-config-app","esbuild-add-app","webpack-guard-app","custom-webpack/add-app"].forEach(n=>{ if(!out.includes(n)) { console.error("MISSING fixture package.json: "+n); process.exit(1);} }); console.log("all fixtures tracked");'
```

Expected: prints `all fixtures tracked`. (Confirms each new fixture has a tracked `package.json` so version automation and Yarn workspaces see them.)

- [ ] **Step 2: Confirm all new ids are unique and discovered**

```bash
cd /Users/jeb/personal-projects/angular-builders
node scripts/discover-tests.js | node -e '
const data = JSON.parse(require("fs").readFileSync(0, "utf8"));
const ids = data.include.map(t => t.id);
const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
if (dupes.length) { console.error("DUPLICATE ids: " + dupes.join(", ")); process.exit(1); }
const want = ["ng-add-karma-to-jest","ng-add-vitest-to-jest","ng-add-esbuild-rewrite","ng-add-esbuild-webpack-guard","ng-add-webpack-rewrite-scaffold","ng-update-jest-v21-smoke"];
const missing = want.filter(w => !ids.includes(w));
if (missing.length) { console.error("MISSING ids: " + missing.join(", ")); process.exit(1); }
console.log("matrix ok: " + ids.length + " total tests, all 6 e2e ids present, no dupes");
'
```

Expected: `matrix ok: <N> total tests, all 6 e2e ids present, no dupes`.

- [ ] **Step 3: Run the full e2e subset locally (cost check)**

```bash
cd /Users/jeb/personal-projects/angular-builders
yarn build:packages:all
node scripts/run-local-tests.js \
  --id ng-add-karma-to-jest --id ng-add-vitest-to-jest \
  --id ng-add-esbuild-rewrite --id ng-add-esbuild-webpack-guard \
  --id ng-add-webpack-rewrite-scaffold --id ng-update-jest-v21-smoke \
  --concurrency 2 --verbose
```

Expected: `Results: 6 passed, 0 failed`. Note total duration — if any single `ng add` + build case dominates wall-clock, apply Step 4.

- [ ] **Step 4: Annotate the optional case for CI-cost control**

Essential set (keep always): `ng-add-karma-to-jest`, `ng-add-vitest-to-jest`, `ng-add-esbuild-webpack-guard`, `ng-add-webpack-rewrite-scaffold`, `ng-update-jest-v21-smoke`. The single demotable candidate is `ng-add-esbuild-rewrite` (the esbuild safe-rewrite is the least regression-prone and is partly covered by the webpack-guard case proving the classifier). Add above its entry in `packages/custom-esbuild/tests/integration.js`:

```javascript
  // [OPTIONAL] esbuild safe-rewrite — least regression-prone; enable under ci:full if matrix cost allows.
```

(Leave the entry active by default; the comment documents intent. Do not remove it.)

- [ ] **Step 5: Commit any annotation tweaks**

```bash
cd /Users/jeb/personal-projects/angular-builders
git add packages/custom-esbuild/tests/integration.js
git commit --no-verify -m "test(schematics): annotate optional esbuild e2e case for CI cost"
```

---

## Self-Review

Mapping spec §8/§12.4 + the 2c/2d checklist items to tasks. Run with fresh eyes.

**1. Spec / checklist coverage:**

| Requirement (source) | Task |
| --- | --- |
| §8 integration: one `examples/` e2e per real builder, wired into existing matrix | Tasks 1–5 (entries in `packages/*/tests/integration.js`) |
| §8 + checklist: `ng add` against UNPUBLISHED local build via `npm pack` → `ng add ./<tarball>`; lighter `--collection` fallback documented; verdaccio noted as overkill | Task 0 (`e2e-ng-add.js`: preferred pack path + `useCollectionFallback`; verdaccio noted as overkill in header comment + Prerequisites) |
| §12.2 + checklist: jest Karma→Jest (fixture via `ng new --test-runner karma`; Karma removed; `ng test` green) | Task 1 |
| §12.2 + checklist: jest Vitest→Jest (default v22 app; rewrite; `ng test` green) | Task 2 |
| §4.2/§12.3 + checklist: custom-esbuild build/serve rewrite on esbuild app → `ng build`/`ng test` green | Task 3 |
| §12.3 + checklist: webpack-build guard — NOT silently swapped + advisory emitted | Task 4 |
| §4.3/§12.1 + checklist: custom-webpack build/serve rewrite + `webpack.config.js` scaffold → `ng build` green | Task 5 |
| Checklist B: jest `@21` post-migration build smoke (seed old config shape, run migration, build/test under v22) | Task 6 |
| Checklist + Plan 01 Task 6: RC-gated multi-major `ng update` window validation on `22.0.0-rc.2` | Task 7 |
| §12.4: Karma fixture generated normally (not checked-in) | Task 1 Step 1 (uses `ng new --test-runner karma`) |
| Constraint: reuse existing matrix/harness, fixtures under `examples/`, entries in `packages/*/tests/integration.js` | All tasks (entries follow `{id,name,purpose,app,command}`; helper run via `sh -c` from `app`) |
| Constraint: no unit-coverage duplication | All cases drive the real CLI + real build/test; zero `SchematicTestRunner` usage |
| Constraint: CI cost — essential vs optional | Task 8 Step 4 (`[OPTIONAL]` annotation on `ng-add-esbuild-rewrite`); each task tagged [ESSENTIAL] |

**2. Placeholder scan:** No `TODO`/`TBD`/"add appropriate…" left. Three intentional CALIBRATION notes (Task 4 advisory string; Task 6 rename property names; Task 7 observed CLI behavior) point at exact source files from Plans 02/01 — these are calibrate-against-real-output instructions (the same pattern Plans 00–03 use for generator calibration), not placeholders; the asserted strings are concrete defaults taken from those plans.

**3. Type / name consistency:** Helper fn names are consistent across every spec JSON file and `e2e-assert.js`: `assertFileAbsent`, `assertFileContains`, `assertBuilderForTarget`, `assertLogContains`, `assertDevDependency`. The driver dispatches `assertLogContains` with the log path (first arg) and all others with `workdir` (first arg) — matches `e2e-assert.js` signatures. Integration ids are unique and verified in Task 8 Step 2. The `app: '.'` convention (run from repo root) is consistent across all six new entries and matches the harness `cwd = path.join(repoRoot, test.app)` contract.

**4. Known calibration dependencies (flagged for executor):** (a) Task 4's `assertLogContains` arg must match the exact advisory wording in `packages/custom-esbuild/src/schematics/ng-add/index.ts` (Plan 02 Task 3b). (b) Task 6's renamed-option names must match `packages/jest/src/schematics/migrations/v21/index.ts` (Plan 01 Tasks 7–8). (c) Task 7's behavior (multi-major permitted vs refused) is observed at execution time and written into the runbook. (d) Fixture Angular versions must be pinned to the workspace versions present at execution (RC → GA); follow the existing `examples/jest/simple-app` / `examples/custom-webpack/sanity-app` versions as the source of truth.
