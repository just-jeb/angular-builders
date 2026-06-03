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
