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

console.log(`Running: yarn test ${jestArgs.join(' ')}`);
console.log(`Expectations:`, expectations);

// Capture both stdout and stderr
const output = execSync(`yarn test ${jestArgs.join(' ')} 2>&1`, {
  encoding: 'utf-8',
});

console.log(output);

// Validate suites
if (expectations.suites) {
  const match = output.match(/Test Suites:\s+(\d+)\s+passed/);
  if (!match || match[1] !== expectations.suites) {
    console.error(`✗ Expected ${expectations.suites} suites passed, got ${match?.[1] || 'none'}`);
    process.exit(1);
  }
  console.log(`✓ Suites: ${expectations.suites} passed`);
}

// Validate tests
if (expectations.tests) {
  const match = output.match(/Tests:\s+(\d+)\s+passed/);
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
