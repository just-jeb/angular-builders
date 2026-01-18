#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function getAffectedPackages() {
  const turboRunsDir = path.join(__dirname, '..', '.turbo', 'runs');
  if (!fs.existsSync(turboRunsDir)) {
    return null; // No turbo summary, include all tests
  }

  const files = fs.readdirSync(turboRunsDir).filter(f => f.endsWith('.json'));
  if (files.length === 0) {
    return null;
  }

  // Find the most recent summary file by modification time
  const summaryPath = files
    .map(f => path.join(turboRunsDir, f))
    .sort((a, b) => fs.statSync(b).mtime - fs.statSync(a).mtime)[0];

  try {
    const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
    // Extract package names from turbo summary
    // The summary structure: { tasks: [{ package: "...", task: "..." }] }
    if (!summary.tasks || !Array.isArray(summary.tasks)) {
      return null;
    }
    return summary.tasks
      .map(task => task.package)
      .filter(pkg => pkg && pkg.startsWith('@angular-builders/'))
      .map(pkg => pkg.replace('@angular-builders/', ''));
  } catch (err) {
    // Only log error in verbose mode to avoid cluttering CI output
    if (process.env.VERBOSE) {
      console.error('Warning: Could not parse turbo summary:', err.message);
    }
    return null;
  }
}

function discoverTests() {
  const packagesDir = path.join(__dirname, '..', 'packages');
  const packages = fs
    .readdirSync(packagesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  const tests = [];

  for (const pkg of packages) {
    const testFile = path.join(packagesDir, pkg, 'tests', 'integration.js');
    if (fs.existsSync(testFile)) {
      delete require.cache[require.resolve(testFile)]; // Clear cache for local development
      const entries = require(testFile);
      for (const entry of entries) {
        tests.push({
          package: pkg,
          ...entry,
        });
      }
    }
  }

  // Filter by affected packages if turbo summary exists
  const affected = getAffectedPackages();
  const filteredTests = affected ? tests.filter(t => affected.includes(t.package)) : tests;

  return { include: filteredTests };
}

// CLI mode: output JSON for GitHub Actions
if (require.main === module) {
  const result = discoverTests();
  console.log(JSON.stringify(result));
}

module.exports = { discoverTests, getAffectedPackages };
