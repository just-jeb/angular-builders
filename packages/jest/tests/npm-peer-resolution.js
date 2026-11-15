#!/usr/bin/env node
// Regression guard for #2387: installing @angular-builders/jest with npm into a fresh
// Angular app must resolve without ERESOLVE and without nesting a second copy of Angular.
//
// npm treats an unresolvable peer as an install error, and it prefers non-deprecated
// versions inside a range. When Angular deprecated @angular/platform-browser-dynamic from
// 20.1.0 on, a `^20.0.0` peer resolved to 20.0.7, which pins @angular/common@20.0.7
// exactly and clashes with any newer app. This script reproduces that install for real:
// it packs the local jest and common packages, writes the dependency set `ng new` gives
// for the package's Angular major, and runs `npm install --package-lock-only` against it.
//
// Needs the registry and a built packages/*/dist. Run from anywhere.
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../../..');
const jestPkg = require(path.join(repoRoot, 'packages/jest/package.json'));

const major = /(\d+)/.exec(jestPkg.peerDependencies['@angular/core'])[1];
const [tsMajor, tsMinor] = jestPkg.devDependencies.typescript.match(/\d+/g);

const work = fs.mkdtempSync(path.join(os.tmpdir(), 'jest-npm-peers-'));
const run = (cmd, args, cwd) =>
  execFileSync(cmd, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

try {
  // yarn pack rewrites `workspace:*` to the real version; npm then dedupes jest's
  // @angular-builders/common dependency against the local common tarball below.
  for (const name of ['common', 'jest']) {
    run(
      'yarn',
      ['pack', '--out', path.join(work, `${name}.tgz`)],
      path.join(repoRoot, 'packages', name)
    );
  }

  const ng = `^${major}.0.0`;
  const app = {
    name: 'npm-peer-resolution-app',
    version: '0.0.0',
    private: true,
    dependencies: {
      '@angular/common': ng,
      '@angular/compiler': ng,
      '@angular/core': ng,
      '@angular/forms': ng,
      '@angular/platform-browser': ng,
      '@angular/router': ng,
      rxjs: '~7.8.0',
      tslib: '^2.3.0',
    },
    devDependencies: {
      '@angular/build': ng,
      '@angular/cli': ng,
      '@angular/compiler-cli': ng,
      '@angular-builders/common': 'file:./common.tgz',
      '@angular-builders/jest': 'file:./jest.tgz',
      jest: jestPkg.peerDependencies.jest,
      typescript: `~${tsMajor}.${tsMinor}.0`,
    },
  };
  fs.writeFileSync(path.join(work, 'package.json'), JSON.stringify(app, null, 2));

  try {
    run(
      'npm',
      ['install', '--package-lock-only', '--no-audit', '--no-fund', '--ignore-scripts'],
      work
    );
  } catch (e) {
    console.error(e.stderr || e.message);
    throw new Error(
      `npm could not install @angular-builders/jest into a fresh Angular ${major} app`
    );
  }

  const lock = JSON.parse(fs.readFileSync(path.join(work, 'package-lock.json'), 'utf8'));
  const nested = Object.keys(lock.packages).filter(p =>
    /node_modules\/@angular-builders\/jest\/node_modules\/@angular\//.test(p)
  );
  if (nested.length) {
    throw new Error(`npm nested a second copy of Angular under the builder: ${nested.join(', ')}`);
  }

  console.log(`npm resolves @angular-builders/jest into a fresh Angular ${major} app cleanly`);
} catch (e) {
  console.error(e.message);
  process.exitCode = 1;
} finally {
  fs.rmSync(work, { recursive: true, force: true });
}
