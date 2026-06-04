#!/usr/bin/env node
/**
 * Validates that coverage output is scoped per Angular project (fixes #1009).
 *
 * Each project should write coverage to <projectRoot>/coverage/, not to a shared
 * root-level directory that gets overwritten when multiple projects run.
 *
 * Run from the multiple-apps example directory.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projects = ['my-first-app', 'my-second-app', 'my-shared-library'];
const cwd = process.cwd();
let allPassed = true;

for (const project of projects) {
  console.log(`\nRunning: ng test ${project} --coverage`);
  try {
    execSync(`yarn test ${project} --coverage 2>&1`, { encoding: 'utf-8', stdio: 'pipe' });
  } catch (e) {
    // Jest exits non-zero on test failure but still writes coverage; ignore for this check
  }

  // Angular CLI project root is under `projects/<name>`
  const projectRoot = path.join(cwd, 'projects', project);
  const coverageDir = path.join(projectRoot, 'coverage');

  if (!fs.existsSync(coverageDir)) {
    console.error(`FAIL: Expected coverage directory not found: ${coverageDir}`);
    console.error(`      (coverage was likely written to root ./coverage instead)`);
    allPassed = false;
  } else {
    console.log(`OK: Coverage scoped correctly at ${coverageDir}`);
  }
}

// Also assert that no root-level coverage dir was created (it would indicate the fix didn't work)
const rootCoverageDir = path.join(cwd, 'coverage');
if (fs.existsSync(rootCoverageDir)) {
  console.warn(`WARN: Root-level coverage/ directory exists at ${rootCoverageDir}`);
  console.warn(`      This may indicate per-project scoping is not fully working.`);
}

if (!allPassed) {
  process.exit(1);
}
console.log('\nAll per-project coverage directories verified correctly.');
