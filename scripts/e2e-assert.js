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
