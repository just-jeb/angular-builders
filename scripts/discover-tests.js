#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Find all packages/*/tests/integration.js files
const packagesDir = path.join(__dirname, '..', 'packages');
const packages = fs
  .readdirSync(packagesDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

const tests = [];

for (const pkg of packages) {
  const testFile = path.join(packagesDir, pkg, 'tests', 'integration.js');
  if (fs.existsSync(testFile)) {
    const entries = require(testFile);
    for (const entry of entries) {
      tests.push({
        package: pkg,
        ...entry,
      });
    }
  }
}

// Output for GitHub Actions
console.log(`matrix=${JSON.stringify({ include: tests })}`);
