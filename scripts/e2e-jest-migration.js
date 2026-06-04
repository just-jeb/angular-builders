#!/usr/bin/env node
'use strict';
// jest @21 migration POST-MIGRATION BUILD SMOKE.
//
// 1. Generate a fresh v22 app inline (ng new), symlink the workspace node_modules.
// 2. SEED the pre-21 jest config shape the @21 migration transforms:
//      - test target -> @angular-builders/jest:run with OLD option names
//        (configPath, testPathPattern), which the migration renames to (config, testPathPatterns)
//      - a jest.config.js so configPath resolves post-rename
//      - tsconfig.spec.json WITHOUT module/moduleResolution Node16 and WITHOUT isolatedModules
//        (the migration patches these in)
// 3. Run ONLY the jest @21 migration via the real CLI:
//      ng update @angular-builders/jest --migrate-only --from=20.0.0 --to=22.0.0 --allow-dirty --force
//    (--from < 21 <= --to so the (from, to] window includes the 21.0.0 threshold and migration-v21 fires.)
// 4. Assert the config was actually transformed (renames + tsconfig patch).
// 5. ng build + ng test under v22 to prove the migrated config is valid/runnable.
//
// Like e2e-ng-add.js, the package manager is neutralised during CLI steps via a PATH shim so
// migration/ng-update install tasks can't write through the symlinked node_modules.

const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '..');
const NG_BIN = path.join(REPO_ROOT, 'node_modules', '.bin', 'ng');
const APP = 'mig-app';

function run(cmd, args, opts) {
  console.log(`[jest-migration] $ ${cmd} ${args.join(' ')}  (cwd=${opts.cwd})`);
  const res = spawnSync(cmd, args, { stdio: 'inherit', ...opts });
  return res.status;
}

function makePackageManagerShim() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pm-noop-'));
  for (const pm of ['npm', 'yarn', 'pnpm', 'cnpm']) {
    fs.writeFileSync(path.join(dir, pm), '#!/bin/sh\nexit 0\n', { mode: 0o755 });
  }
  return dir;
}

function seedPre21Shape(workdir) {
  // angular.json: jest:run test target with the OLD option names.
  const ngPath = path.join(workdir, 'angular.json');
  const ng = JSON.parse(fs.readFileSync(ngPath, 'utf8'));
  const arch = ng.projects[APP].architect || ng.projects[APP].targets;
  arch.test = {
    builder: '@angular-builders/jest:run',
    options: { configPath: 'jest.config.js', testPathPattern: 'src/.*\\.spec\\.ts$' },
  };
  fs.writeFileSync(ngPath, JSON.stringify(ng, null, 2));

  // jest.config.js so `configPath` resolves once renamed to `config`.
  fs.writeFileSync(
    path.join(workdir, 'jest.config.js'),
    "module.exports = { preset: 'jest-preset-angular' };\n"
  );

  // tsconfig.spec.json in the pre-21 shape (no Node16, no isolatedModules).
  const specPath = path.join(workdir, 'tsconfig.spec.json');
  const spec = {
    extends: './tsconfig.json',
    compilerOptions: { outDir: './out-tsc/spec', module: 'ESNext', moduleResolution: 'node', types: ['jest'] },
    include: ['src/**/*.spec.ts', 'src/**/*.d.ts'],
  };
  fs.writeFileSync(specPath, JSON.stringify(spec, null, 2));
}

function main() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'jest-mig-'));
  if (run(NG_BIN, ['new', APP, '--directory', APP, '--skip-install', '--skip-git', '--routing=false', '--style=scss'], { cwd: tmp }) !== 0) {
    throw new Error('ng new failed');
  }
  const workdir = path.join(tmp, APP);
  fs.symlinkSync(path.join(REPO_ROOT, 'node_modules'), path.join(workdir, 'node_modules'), 'dir');

  seedPre21Shape(workdir);

  const shimDir = makePackageManagerShim();
  const env = { ...process.env, PATH: `${shimDir}${path.delimiter}${process.env.PATH}` };

  const status = run(
    NG_BIN,
    ['update', '@angular-builders/jest', '--migrate-only', '--from=20.0.0', '--to=22.0.0', '--allow-dirty', '--force'],
    { cwd: workdir, env }
  );
  if (status !== 0) throw new Error(`ng update --migrate-only failed with status ${status}`);

  // Assert the transforms landed.
  const ng = JSON.parse(fs.readFileSync(path.join(workdir, 'angular.json'), 'utf8'));
  const proj = ng.projects[APP];
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
  if (run('sh', ['-c', 'npx ng build'], { cwd: workdir, env }) !== 0) throw new Error('ng build failed post-migration');
  if (run('sh', ['-c', 'npx ng test'], { cwd: workdir, env }) !== 0) throw new Error('ng test failed post-migration');

  console.log('[jest-migration] PASS');
}

try {
  main();
} catch (err) {
  console.error(`[jest-migration] FAIL: ${err.message}`);
  process.exit(1);
}
