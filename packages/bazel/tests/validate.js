#!/usr/bin/env node
const { execSync } = require('child_process');
const { readFileSync } = require('fs');

console.log('Running: yarn build');
execSync('yarn build', { stdio: 'inherit' });

const expected = 'hello world\n';
const actual = readFileSync('./bazel-bin/out', 'utf-8');

if (actual !== expected) {
  console.error(`✗ Expected "${expected}", got "${actual}"`);
  process.exit(1);
}

console.log('✓ Bazel output matches expected');
