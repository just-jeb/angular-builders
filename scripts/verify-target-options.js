#!/usr/bin/env node
// Verifies the build output of the `target-options-test` configuration in
// examples/custom-esbuild/sanity-esbuild-app — i.e. that target.configuration
// is genuinely accessible inside both a factory plugin and an indexHtmlTransformer
// at build time, and that the transformer receives the resolved builder options. Used by the `app-target-options` integration test (#1690, #1710).
//
// Usage: node scripts/verify-target-options.js <distDir> <expectedConfigName>

const fs = require('fs');
const path = require('path');

const [, , distArg, expected = 'target-options-test'] = process.argv;
if (!distArg) {
  console.error('Usage: verify-target-options.js <distDir> [expectedConfigName]');
  process.exit(2);
}

const distDir = path.resolve(process.cwd(), distArg);

const indexHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
if (!indexHtml.includes(`content="${expected}"`)) {
  console.error(`FAIL: indexHtmlTransformer did not inject "${expected}" into index.html.`);
  process.exit(1);
}

// The target-options-test configuration sets outputHashing to "none"; the transformer
// echoes the resolved builder options it receives as its third argument (#2419).
if (!indexHtml.includes('name="build-output-hashing" content="none"')) {
  console.error('FAIL: indexHtmlTransformer did not receive the resolved builder options.');
  process.exit(1);
}

const jsFiles = fs.readdirSync(distDir).filter(f => f.endsWith('.js'));
const mainJs = jsFiles.map(f => fs.readFileSync(path.join(distDir, f), 'utf8')).join('');
if (!mainJs.includes(expected)) {
  console.error(`FAIL: plugin did not inject "${expected}" into JS bundle.`);
  process.exit(1);
}

console.log(
  'PASS: target.configuration is accessible in both plugin and indexHtmlTransformer, and the transformer receives builder options.'
);
