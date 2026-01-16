#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');

// Parse args: separate jest args from --expect-* args
const jestArgs = [];
const expectations = {};

for (let i = 2; i < process.argv.length; i++) {
  const arg = process.argv[i];
  if (arg.startsWith('--expect-')) {
    const [key, value] = arg.slice(9).split('=');
    expectations[key] = value;
  } else {
    jestArgs.push(arg);
  }
}

// Quote args that contain spaces
const quotedArgs = jestArgs.map(arg => (arg.includes(' ') ? `"${arg}"` : arg));

console.log(`Running: yarn test ${quotedArgs.join(' ')}`);
console.log(`Expectations:`, expectations);

// Capture both stdout and stderr
const output = execSync(`yarn test ${quotedArgs.join(' ')} 2>&1`, {
  encoding: 'utf-8',
});

console.log(output);

// Validate suites
if (expectations.suites) {
  // Match "X passed" anywhere in the line (handles "1 skipped, 1 passed, 1 of 2 total")
  const match = output.match(/Test Suites:.*?(\d+)\s+passed/);
  if (!match || match[1] !== expectations.suites) {
    console.error(`✗ Expected ${expectations.suites} suites passed, got ${match?.[1] || 'none'}`);
    process.exit(1);
  }
  console.log(`✓ Suites: ${expectations.suites} passed`);
}

// Validate tests
if (expectations.tests) {
  // Match "X passed" anywhere in the line (handles "3 skipped, 1 passed, 4 total")
  const match = output.match(/Tests:.*?(\d+)\s+passed/);
  if (!match || match[1] !== expectations.tests) {
    console.error(`✗ Expected ${expectations.tests} tests passed, got ${match?.[1] || 'none'}`);
    process.exit(1);
  }
  console.log(`✓ Tests: ${expectations.tests} passed`);
}

// Validate skipped
if (expectations.skipped) {
  const match = output.match(/Tests:.*?(\d+)\s+skipped/);
  if (!match || match[1] !== expectations.skipped) {
    console.error(`✗ Expected ${expectations.skipped} tests skipped, got ${match?.[1] || 'none'}`);
    process.exit(1);
  }
  console.log(`✓ Skipped: ${expectations.skipped}`);
}

// Validate file exists
if (expectations.file) {
  if (!fs.existsSync(expectations.file)) {
    console.error(`✗ Expected file ${expectations.file} not created`);
    process.exit(1);
  }
  fs.unlinkSync(expectations.file);
  console.log(`✓ File ${expectations.file} created`);
}

console.log('\n✓ All validations passed');
