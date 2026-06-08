#!/usr/bin/env node
'use strict';
// jiti loader migration POST-MIGRATION BUILD SMOKE (custom-webpack).
//
// Validates the v22 ts-node -> jiti `ng update` migration end-to-end via the REAL CLI
// (so the migrations.json wiring + ng-update field are exercised, not just the rule):
//   1. Generate a fresh v22 app inline (ng new), symlink the workspace node_modules.
//   2. Point the build target at @angular-builders/custom-webpack:browser with a
//      TypeScript custom webpack config, and SEED the pre-jiti shape the migration fixes:
//        - a `build-ts` npm script using NODE_OPTIONS='--loader ts-node/esm' (now broken)
//        - ts-node / tsconfig-paths in devDependencies
//        - a `ts-node` section in tsconfig.json with a `paths` override
//   3. Run ONLY the migration via the real CLI:
//        ng update @angular-builders/custom-webpack --migrate-only --from=21.0.0 --to=22.0.0 ...
//   4. Assert the migration transformed the workspace (script stripped, deps removed,
//      ts-node section's paths lifted into compilerOptions + section dropped).
//   5. ng build to prove the migrated workspace still builds and the `.ts` webpack config
//      loads via jiti.
//
// Package manager is neutralised during the CLI step via a PATH shim so ng update's install
// task can't write through the symlinked node_modules (same approach as e2e-jest-migration.js).

const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '..');
const NG_BIN = path.join(REPO_ROOT, 'node_modules', '.bin', 'ng');
const APP = 'loader-mig-app';

function run(cmd, args, opts) {
  console.log(`[loader-migration] $ ${cmd} ${args.join(' ')}  (cwd=${opts.cwd})`);
  return spawnSync(cmd, args, { stdio: 'inherit', ...opts }).status;
}

function makePackageManagerShim() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pm-noop-'));
  for (const pm of ['npm', 'yarn', 'pnpm', 'cnpm']) {
    fs.writeFileSync(path.join(dir, pm), '#!/bin/sh\nexit 0\n', { mode: 0o755 });
  }
  return dir;
}

function seedPreJitiShape(workdir) {
  // Build target -> custom-webpack:browser with a TypeScript custom webpack config.
  const ngPath = path.join(workdir, 'angular.json');
  const ng = JSON.parse(fs.readFileSync(ngPath, 'utf8'));
  const arch = ng.projects[APP].architect || ng.projects[APP].targets;
  arch.build = {
    builder: '@angular-builders/custom-webpack:browser',
    options: {
      customWebpackConfig: { path: 'webpack.config.ts' },
      outputPath: 'dist/' + APP,
      index: 'src/index.html',
      main: 'src/main.ts',
      tsConfig: 'tsconfig.app.json',
      polyfills: [],
      assets: [],
      styles: ['src/styles.scss'],
    },
  };
  fs.writeFileSync(ngPath, JSON.stringify(ng, null, 2));

  // A no-op TypeScript custom webpack config (must be loaded by jiti post-migration).
  fs.writeFileSync(
    path.join(workdir, 'webpack.config.ts'),
    "import { Configuration } from 'webpack';\nexport default (config: Configuration): Configuration => config;\n"
  );

  // package.json: a broken ts-node/esm script + ts-node/tsconfig-paths devDeps.
  const pkgPath = path.join(workdir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  pkg.scripts = pkg.scripts || {};
  pkg.scripts['build-ts'] = "NODE_OPTIONS='--loader ts-node/esm' ng build";
  pkg.devDependencies = pkg.devDependencies || {};
  pkg.devDependencies['ts-node'] = '10.9.2';
  pkg.devDependencies['tsconfig-paths'] = '4.2.0';
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

  // tsconfig.json: a `ts-node` section with a path override the migration must lift.
  const tsPath = path.join(workdir, 'tsconfig.json');
  const ts = JSON.parse(stripJsonComments(fs.readFileSync(tsPath, 'utf8')));
  ts['ts-node'] = { compilerOptions: { paths: { '@cfg/*': ['./src/cfg/*'] } } };
  fs.writeFileSync(tsPath, JSON.stringify(ts, null, 2));
}

// ng new's tsconfig.json contains // comments; strip them so JSON.parse works.
function stripJsonComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
}

function main() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'loader-mig-'));
  if (
    run(
      NG_BIN,
      [
        'new',
        APP,
        '--directory',
        APP,
        '--skip-install',
        '--skip-git',
        '--routing=false',
        '--style=scss',
      ],
      { cwd: tmp }
    ) !== 0
  ) {
    throw new Error('ng new failed');
  }
  const workdir = path.join(tmp, APP);
  fs.symlinkSync(path.join(REPO_ROOT, 'node_modules'), path.join(workdir, 'node_modules'), 'dir');

  seedPreJitiShape(workdir);

  const shimDir = makePackageManagerShim();
  const env = { ...process.env, PATH: `${shimDir}${path.delimiter}${process.env.PATH}` };

  const status = run(
    NG_BIN,
    [
      'update',
      '@angular-builders/custom-webpack',
      '--migrate-only',
      '--from=21.0.0',
      '--to=22.0.0',
      '--allow-dirty',
      '--force',
    ],
    { cwd: workdir, env }
  );
  if (status !== 0) throw new Error(`ng update --migrate-only failed with status ${status}`);

  // Assert the transforms landed.
  const pkg = JSON.parse(fs.readFileSync(path.join(workdir, 'package.json'), 'utf8'));
  if (/ts-node\/esm|NODE_OPTIONS/.test(pkg.scripts['build-ts'])) {
    throw new Error(
      `build-ts script still has the ts-node/esm workaround: ${pkg.scripts['build-ts']}`
    );
  }
  if (pkg.devDependencies['ts-node'] !== undefined)
    throw new Error('ts-node devDependency not removed');
  if (pkg.devDependencies['tsconfig-paths'] !== undefined) {
    throw new Error('tsconfig-paths devDependency not removed');
  }

  const ts = JSON.parse(fs.readFileSync(path.join(workdir, 'tsconfig.json'), 'utf8'));
  if (ts['ts-node'] !== undefined) throw new Error('obsolete ts-node tsconfig section not removed');
  const paths = (ts.compilerOptions && ts.compilerOptions.paths) || {};
  if (JSON.stringify(paths['@cfg/*']) !== JSON.stringify(['./src/cfg/*'])) {
    throw new Error('ts-node section paths were not lifted into compilerOptions');
  }
  console.log('[loader-migration] transform assertions OK');

  // Prove the migrated workspace builds and the .ts webpack config loads via jiti.
  if (run('sh', ['-c', 'npx ng build'], { cwd: workdir, env }) !== 0) {
    throw new Error('ng build failed post-migration');
  }

  console.log('[loader-migration] PASS');
}

try {
  main();
} catch (err) {
  console.error(`[loader-migration] FAIL: ${err.message}`);
  process.exit(1);
}
