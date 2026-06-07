#!/usr/bin/env node
// Verifies the build output of the `target-options-test` configuration in
// examples/custom-esbuild/sanity-esbuild-app — i.e. that target.configuration
// is genuinely accessible inside both a factory plugin and an indexHtmlTransformer
// at build time. Used by the `app-target-options` integration test (#1690, #1710).
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

const jsFiles = fs.readdirSync(distDir).filter(f => f.endsWith('.js'));
const mainJs = jsFiles.map(f => fs.readFileSync(path.join(distDir, f), 'utf8')).join('');
if (!mainJs.includes(expected)) {
  console.error(`FAIL: plugin did not inject "${expected}" into JS bundle.`);
  process.exit(1);
}

console.log('PASS: target.configuration is accessible in both plugin and indexHtmlTransformer.');
