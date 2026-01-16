#!/usr/bin/env node

// Local test runner that executes integration tests in parallel.
// Uses the same test definitions as CI from packages/*/tests/integration.js
//
// Usage:
//   node scripts/run-local-tests.js              # Run all tests
//   node scripts/run-local-tests.js --package jest  # Run tests for specific package
//   node scripts/run-local-tests.js --id cli-no-cache  # Run specific test by ID
//   node scripts/run-local-tests.js --concurrency 4    # Limit parallel tests

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  package: null,
  ids: [],
  concurrency: null,
  verbose: args.includes('--verbose') || args.includes('-v'),
};

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--package' && args[i + 1]) {
    options.package = args[++i];
  } else if (args[i] === '--id' && args[i + 1]) {
    options.ids.push(args[++i]);
  } else if (args[i] === '--concurrency' && args[i + 1]) {
    options.concurrency = parseInt(args[++i], 10);
  }
}

// Discover all tests
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
      delete require.cache[require.resolve(testFile)];
      const entries = require(testFile);
      for (const entry of entries) {
        tests.push({
          package: pkg,
          ...entry,
        });
      }
    }
  }

  return tests;
}

// Run a single test
function runTest(test) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const cwd = path.join(__dirname, '..', test.app);

    if (options.verbose) {
      console.log('\n[START] ' + test.id + ': ' + test.purpose);
      console.log('  Dir: ' + test.app);
      console.log('  Cmd: ' + test.command);
    }

    const child = spawn('sh', ['-c', test.command], {
      cwd,
      stdio: options.verbose ? 'inherit' : 'pipe',
      env: { ...process.env, FORCE_COLOR: '1' },
    });

    let stdout = '';
    let stderr = '';

    if (!options.verbose) {
      if (child.stdout) child.stdout.on('data', data => (stdout += data));
      if (child.stderr) child.stderr.on('data', data => (stderr += data));
    }

    child.on('close', code => {
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      resolve({
        test,
        code,
        duration,
        stdout,
        stderr,
      });
    });

    child.on('error', err => {
      reject(err);
    });
  });
}

// Run tests with concurrency limit
async function runWithConcurrency(tests, limit) {
  const results = [];
  const running = new Map();

  for (const test of tests) {
    if (limit && running.size >= limit) {
      const finished = await Promise.race(running.values());
      running.delete(finished.test.id);
      results.push(finished);
      printResult(finished);
    }

    const promise = runTest(test);
    running.set(test.id, promise);
  }

  const remaining = await Promise.all(running.values());
  for (const result of remaining) {
    results.push(result);
    printResult(result);
  }

  return results;
}

// Print result of a single test
function printResult(result) {
  const test = result.test;
  const code = result.code;
  const duration = result.duration;
  const status = code === 0 ? 'PASS' : 'FAIL';
  const color = code === 0 ? '\x1b[32m' : '\x1b[31m';
  const reset = '\x1b[0m';

  console.log(color + status + reset + ' [' + duration + 's] ' + test.id + ': ' + test.purpose);

  if (code !== 0 && !options.verbose) {
    console.log('  Failed in: ' + test.app);
    console.log('  Command: ' + test.command);
    if (result.stderr) {
      console.log('  Stderr: ' + result.stderr.slice(-500));
    }
  }
}

// Main
async function main() {
  console.log('Discovering tests...\n');

  let tests = discoverTests();

  if (options.package) {
    tests = tests.filter(t => t.package === options.package);
  }

  if (options.ids.length > 0) {
    tests = tests.filter(t => options.ids.includes(t.id));
  }

  if (tests.length === 0) {
    console.log('No tests found matching criteria.');
    process.exit(1);
  }

  console.log('Found ' + tests.length + ' test(s) to run\n');

  if (options.concurrency) {
    console.log('Concurrency limit: ' + options.concurrency + '\n');
  } else {
    console.log('Running all tests in parallel\n');
  }

  console.log('------------------------------------------------------------');
  console.log('');

  const startTime = Date.now();
  const results = await runWithConcurrency(tests, options.concurrency);
  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(1);

  const passed = results.filter(r => r.code === 0).length;
  const failed = results.filter(r => r.code !== 0).length;

  console.log('');
  console.log('------------------------------------------------------------');
  console.log('');
  console.log(
    'Results: ' + passed + ' passed, ' + failed + ' failed (' + totalDuration + 's total)'
  );

  if (failed > 0) {
    console.log('\nFailed tests:');
    for (const result of results.filter(r => r.code !== 0)) {
      console.log('   - ' + result.test.id + ' (' + result.test.package + ')');
    }
    process.exit(1);
  }

  console.log('\nAll tests passed!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
