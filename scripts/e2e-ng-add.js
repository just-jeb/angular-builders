#!/usr/bin/env node
'use strict';
// Drives a LOCAL-ONLY `ng add` e2e for an unpublished workspace build.
//
// The fixture app is GENERATED INLINE with the workspace's own Angular CLI (`ng new`)
// rather than committed to the repo — a fresh `ng new` app has no custom content worth
// version-controlling, and generating it keeps the test self-describing and immune to
// fixture drift across Angular majors. Only genuinely custom fixtures should be committed.
//
// What it does:
//   1. Generate a fresh app into a temp workdir via `ng new` (--skip-install), then symlink
//      the repo's hoisted node_modules so the real CLI resolves.
//   2. Optionally run `prepareWorkdir` shell commands (e.g. rewrite angular.json to a
//      webpack builder the default `ng new` wouldn't produce).
//   3. Run `ng add <package> --collection <package> --skip-install <ngAddArgs>`, capturing
//      combined output to a log file. The collection resolves from the workspace-linked
//      package (already installed); `--skip-install` means `ng add` never runs the package
//      manager, so it cannot mutate the symlinked node_modules. The schematic under test
//      still runs in full (rewrites angular.json, writes devDeps, removes files).
//   4. Run the declarative assertions from the spec file against the workdir + log.
//   5. Run the post-add verification commands (e.g. `ng build`, `ng test`) in the workdir,
//      resolving the real builder from the workspace-linked package.
//
// Why not `npm pack` + `ng add ./<tarball>`? That exercises a real registry install, but here
// the workdir's node_modules is a symlink to the repo's hoisted install — a real `ng add`
// install would write THROUGH the symlink and pollute the workspace. Everything the schematic
// needs is already workspace-linked, so the install adds risk without testing our code. The
// tarball path is kept behind "useTarball": true for a future isolated-install CI (own
// node_modules per job), where the full resolve->install fidelity is safe to exercise.
//
// Usage:
//   node scripts/e2e-ng-add.js --spec <path-to-spec.json>
//
// Spec file shape (JSON):
//   {
//     "generate": {                                // generate the fixture inline with `ng new`
//       "name": "karma-app",                       // project + directory name
//       "args": ["--test-runner", "karma"]         // extra `ng new` args (style/routing/etc.)
//     },
//     "prepareWorkdir": ["node ../prep.js"],       // optional shell steps run before `ng add`
//     "package": "@angular-builders/jest",          // workspace package to pack
//     "ngAddArgs": [],                              // extra args to `ng add`
//     "expectAddSucceeds": true,                    // ng add must exit 0 (default true)
//     "asserts": [                                  // run after ng add, before build/test
//       { "fn": "assertBuilderForTarget", "args": ["karma-app", "test", "@angular-builders/jest:run"] },
//       { "fn": "assertFileAbsent", "args": ["karma.conf.js"] }
//     ],
//     "post": ["npx ng build", "npx ng test"]       // commands run in workdir; each must exit 0
//   }
//
// A committed fixture may be used instead of "generate" via "fixture": "<path relative to repo root>"
// (copied into the workdir). Use this only for fixtures with custom content `ng new` can't produce.
//
// Fallback (when npm pack + tarball resolve is not viable): set "useCollectionFallback": true,
// which runs `ng add <package> --collection <package> ...` against the workspace-linked package.

const { execFileSync, spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('./e2e-assert');

const REPO_ROOT = path.join(__dirname, '..');
const NG_BIN = path.join(REPO_ROOT, 'node_modules', '.bin', 'ng');

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

// Symlink the repo root's hoisted node_modules so the real Angular CLI resolves.
// Yarn 3 workspaces hoist everything to the repo root node_modules.
function linkNodeModules(workdir) {
  const wdNodeModules = path.join(workdir, 'node_modules');
  if (!fs.existsSync(wdNodeModules)) {
    fs.symlinkSync(path.join(REPO_ROOT, 'node_modules'), wdNodeModules, 'dir');
  }
}

// Generate a fresh app inline with the workspace CLI; returns the app directory.
function generateFixture(spec, parentDir) {
  const { name, args = [] } = spec.generate;
  const r = run(
    NG_BIN,
    ['new', name, '--directory', name, '--skip-install', '--skip-git', ...args],
    { cwd: parentDir }
  );
  if (r.status !== 0) throw new Error(`ng new failed with status ${r.status}`);
  return path.join(parentDir, name);
}

function main() {
  const { spec: specPath } = parseArgs(process.argv.slice(2));
  const spec = JSON.parse(fs.readFileSync(path.resolve(REPO_ROOT, specPath), 'utf8'));

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ng-add-e2e-'));
  console.log(`[e2e-ng-add] tmp = ${tmp}`);

  let workdir;
  if (spec.generate) {
    workdir = generateFixture(spec, tmp);
  } else if (spec.fixture) {
    const fixtureAbs = path.resolve(REPO_ROOT, spec.fixture);
    if (!fs.existsSync(fixtureAbs)) throw new Error(`Fixture not found: ${spec.fixture}`);
    workdir = path.join(tmp, path.basename(fixtureAbs));
    copyDir(fixtureAbs, workdir);
  } else {
    throw new Error('Spec must define either "generate" or "fixture".');
  }
  console.log(`[e2e-ng-add] workdir = ${workdir}`);
  linkNodeModules(workdir);

  // Optional pre-`ng add` preparation (e.g. rewrite angular.json to a webpack builder).
  for (const cmd of spec.prepareWorkdir || []) {
    const r = run('sh', ['-c', cmd], { cwd: workdir });
    if (r.status !== 0) throw new Error(`prepareWorkdir command failed (${r.status}): ${cmd}`);
  }

  const logFile = path.join(workdir, 'ng-add.log');

  if (spec.useTarball) {
    // Opt-in (isolated-install envs only): npm pack the built package, then `ng add ./<tarball>`.
    // This runs a real install — only safe when the workdir has its OWN node_modules.
    const pkgDir = path.join(REPO_ROOT, 'packages', spec.package.replace('@angular-builders/', ''));
    const packOut = execFileSync('npm', ['pack', '--silent', '--pack-destination', workdir], {
      cwd: pkgDir,
      encoding: 'utf8',
    }).trim();
    const tarball = packOut.split('\n').pop().trim();
    const tarballAbs = path.join(workdir, tarball);
    console.log(`[e2e-ng-add] packed ${spec.package} -> ${tarball}`);
    const args = ['add', tarballAbs, '--skip-confirmation', ...(spec.ngAddArgs || [])];
    const r = run(NG_BIN, args, { cwd: workdir });
    fs.writeFileSync(logFile, r.stdout + r.stderr);
    if ((spec.expectAddSucceeds !== false) && r.status !== 0) {
      throw new Error(`ng add failed with status ${r.status}`);
    }
  } else {
    // Default: real CLI, collection resolved from the workspace-linked package, no install.
    const args = ['add', spec.package, '--collection', spec.package, '--skip-confirmation',
      '--skip-install', ...(spec.ngAddArgs || [])];
    const r = run(NG_BIN, args, { cwd: workdir });
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

  // Post-add verification commands (real build/test under the workspace Angular major).
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
