# CI/CD Revamp Plan

## Overview

Modernize CI using GHA matrix strategy with package-owned test definitions. Each package defines its own integration tests, the CI discovers and runs them in parallel.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        GHA Workflow                              │
├─────────────────────────────────────────────────────────────────┤
│  1. Build Job         → Build all packages                      │
│  2. Discover Job      → Read packages/*/tests/integration.js    │
│  3. Test Matrix Job   → cd $app && $command (parallel)          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Package Structure                             │
├─────────────────────────────────────────────────────────────────┤
│  packages/custom-webpack/                                        │
│  ├── tests/                                                      │
│  │   └── integration.js    ← Package owns test definitions      │
│  └── ...                                                         │
│                                                                  │
│  packages/jest/                                                  │
│  ├── tests/                                                      │
│  │   ├── integration.js    ← Test definitions                   │
│  │   └── validate.js       ← Package-owned validation logic     │
│  └── ...                                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Step 1: Discovery Script + Custom-Webpack Tests

### 1.1 Create `scripts/discover-tests.js`

```javascript
#!/usr/bin/env node
const { globSync } = require('glob');
const path = require('path');

const files = globSync('packages/*/tests/integration.js');
const tests = [];

for (const file of files) {
  const pkg = path.basename(path.dirname(path.dirname(file)));
  const entries = require(path.resolve(file));

  for (const entry of entries) {
    tests.push({
      package: pkg,
      ...entry,
    });
  }
}

// Output for GitHub Actions
console.log(`matrix=${JSON.stringify({ include: tests })}`);
```

### 1.2 Create `packages/custom-webpack/tests/integration.js`

```javascript
module.exports = [
  // Karma builder tests
  {
    id: 'karma-builder-sanity-app',
    purpose: 'Karma builder executes unit tests with custom webpack config',
    app: 'examples/custom-webpack/sanity-app',
    command: 'yarn test --browsers=ChromeHeadlessCI',
  },
  {
    id: 'karma-builder-sanity-app-esm',
    purpose: 'Karma builder works in ESM package',
    app: 'examples/custom-webpack/sanity-app-esm',
    command: 'yarn test --browsers=ChromeHeadlessCI',
  },
  {
    id: 'karma-builder-full-cycle',
    purpose: 'Karma builder works with full webpack customization',
    app: 'examples/custom-webpack/full-cycle-app',
    command: 'yarn test --browsers=ChromeHeadlessCI',
  },

  // Browser/dev-server builder tests
  {
    id: 'browser-builder-basic',
    purpose: 'Browser + dev-server builders work with no custom config',
    app: 'examples/custom-webpack/sanity-app',
    command: 'yarn e2e',
  },
  {
    id: 'browser-builder-esm-config',
    purpose: 'Builder correctly loads ESM webpack config (.mjs)',
    app: 'examples/custom-webpack/sanity-app',
    command: 'yarn e2e -c esm',
  },
  {
    id: 'browser-builder-cjs-config',
    purpose: 'Builder correctly loads CJS webpack config (.js)',
    app: 'examples/custom-webpack/sanity-app',
    command: 'yarn e2e -c cjs',
  },
  {
    id: 'esm-package-default',
    purpose: 'Builder works in ESM package (type: module)',
    app: 'examples/custom-webpack/sanity-app-esm',
    command: 'yarn e2e',
  },
  {
    id: 'esm-package-esm-config',
    purpose: 'ESM package loads ESM config correctly',
    app: 'examples/custom-webpack/sanity-app-esm',
    command: 'yarn e2e -c esm',
  },
  {
    id: 'esm-package-cjs-config',
    purpose: 'ESM package loads CJS config correctly',
    app: 'examples/custom-webpack/sanity-app-esm',
    command: 'yarn e2e -c cjs',
  },

  // Index transform tests
  {
    id: 'index-transform-js',
    purpose: 'JavaScript indexTransform modifies index.html',
    app: 'examples/custom-webpack/full-cycle-app',
    command: 'yarn e2e',
  },
  {
    id: 'index-transform-production',
    purpose: 'indexTransform receives correct configuration name',
    app: 'examples/custom-webpack/full-cycle-app',
    command: 'yarn e2e -c production',
  },
  {
    id: 'index-transform-ts',
    purpose: 'TypeScript indexTransform works',
    app: 'examples/custom-webpack/full-cycle-app',
    command: 'yarn e2e -c itwcw',
  },

  // TypeScript config loading
  {
    id: 'ts-config-esm-imports',
    purpose: 'Builder loads TypeScript config with ESM imports',
    app: 'examples/custom-webpack/sanity-app-esm',
    command: 'yarn build-ts -c tsEsm',
  },
];
```

### 1.3 Validate

```bash
# Verify discovery script finds and parses the tests
node scripts/discover-tests.js

# Should output JSON with 13 custom-webpack tests
# Verify structure looks correct

# Manually run one test to verify command works
cd examples/custom-webpack/sanity-app && yarn e2e
```

### 1.4 Commit

```bash
git add scripts/discover-tests.js packages/custom-webpack/tests/
git commit -m "ci: add discovery script and custom-webpack integration tests"
```

---

## Step 2: Custom-ESBuild Tests

### 2.1 Create `packages/custom-esbuild/tests/integration.js`

```javascript
module.exports = [
  // Vitest builder tests
  {
    id: 'vitest-builder-esm-config',
    purpose: 'Unit test builder works with ESM plugins',
    app: 'examples/custom-esbuild/sanity-esbuild-app',
    command: 'yarn test -c esm --no-watch',
  },
  {
    id: 'vitest-builder-cjs-config',
    purpose: 'Unit test builder works with CJS plugins',
    app: 'examples/custom-esbuild/sanity-esbuild-app',
    command: 'yarn test -c cjs --no-watch',
  },
  {
    id: 'vitest-esm-package-esm',
    purpose: 'Unit test builder in ESM package with ESM plugins',
    app: 'examples/custom-esbuild/sanity-esbuild-app-esm',
    command: 'yarn test -c esm --no-watch',
  },
  {
    id: 'vitest-esm-package-cjs',
    purpose: 'Unit test builder in ESM package with CJS plugins',
    app: 'examples/custom-esbuild/sanity-esbuild-app-esm',
    command: 'yarn test -c cjs --no-watch',
  },
  {
    id: 'vitest-ts-config',
    purpose: 'Unit test builder loads TypeScript config',
    app: 'examples/custom-esbuild/sanity-esbuild-app-esm',
    command: 'yarn test-ts -c tsEsm --no-watch',
  },

  // Application builder + plugins tests
  {
    id: 'app-builder-plugins',
    purpose: 'Application builder applies ESBuild plugins',
    app: 'examples/custom-esbuild/sanity-esbuild-app',
    command: 'yarn e2e',
  },
  {
    id: 'app-builder-esm-plugins',
    purpose: 'Application builder loads ESM plugins',
    app: 'examples/custom-esbuild/sanity-esbuild-app',
    command: 'yarn e2e -c esm',
  },
  {
    id: 'app-builder-cjs-plugins',
    purpose: 'Application builder loads CJS plugins',
    app: 'examples/custom-esbuild/sanity-esbuild-app',
    command: 'yarn e2e -c cjs',
  },
  {
    id: 'esm-package-plugins',
    purpose: 'ESM package application builder works',
    app: 'examples/custom-esbuild/sanity-esbuild-app-esm',
    command: 'yarn e2e',
  },
  {
    id: 'esm-package-esm-plugins',
    purpose: 'ESM package loads ESM plugins',
    app: 'examples/custom-esbuild/sanity-esbuild-app-esm',
    command: 'yarn e2e -c esm',
  },
  {
    id: 'esm-package-cjs-plugins',
    purpose: 'ESM package loads CJS plugins',
    app: 'examples/custom-esbuild/sanity-esbuild-app-esm',
    command: 'yarn e2e -c cjs',
  },

  // TypeScript config
  {
    id: 'ts-plugins-esm-imports',
    purpose: 'Builder loads TypeScript plugins with ESM imports',
    app: 'examples/custom-esbuild/sanity-esbuild-app-esm',
    command: 'yarn build-ts -c tsEsm',
  },
];
```

### 2.2 Validate

```bash
# Verify discovery now finds both packages
node scripts/discover-tests.js

# Should show 13 custom-webpack + 12 custom-esbuild = 25 tests

# Manually run one test
cd examples/custom-esbuild/sanity-esbuild-app && yarn e2e
```

### 2.3 Commit

```bash
git add packages/custom-esbuild/tests/
git commit -m "ci: add custom-esbuild integration tests"
```

---

## Step 3: Jest Tests with Validator

### 3.1 Create `packages/jest/tests/validate.js`

```javascript
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

const output = execSync(`yarn test ${jestArgs.join(' ')}`, {
  encoding: 'utf-8',
  stdio: ['inherit', 'pipe', 'inherit'],
});

console.log(output);

// Validate suites
if (expectations.suites) {
  const match = output.match(/Test Suites:.*?(\d+) passed/);
  if (!match || match[1] !== expectations.suites) {
    console.error(`✗ Expected ${expectations.suites} suites passed, got ${match?.[1]}`);
    process.exit(1);
  }
  console.log(`✓ Suites: ${expectations.suites} passed`);
}

// Validate tests
if (expectations.tests) {
  const match = output.match(/Tests:.*?(\d+) passed/);
  if (!match || match[1] !== expectations.tests) {
    console.error(`✗ Expected ${expectations.tests} tests passed, got ${match?.[1]}`);
    process.exit(1);
  }
  console.log(`✓ Tests: ${expectations.tests} passed`);
}

// Validate skipped
if (expectations.skipped) {
  const match = output.match(/Tests:.*?(\d+) skipped/);
  if (!match || match[1] !== expectations.skipped) {
    console.error(`✗ Expected ${expectations.skipped} tests skipped, got ${match?.[1]}`);
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
```

### 3.2 Create `packages/jest/tests/integration.js`

```javascript
module.exports = [
  // Config file loading
  {
    id: 'config-typescript',
    purpose: 'Builder loads jest.config.ts',
    app: 'examples/jest/simple-app',
    command: 'yarn test:ts --no-cache',
  },
  {
    id: 'config-esm',
    purpose: 'Builder loads jest.config.mjs',
    app: 'examples/jest/simple-app',
    command: 'yarn test:esm --no-cache',
  },

  // CLI passthrough - validated tests
  {
    id: 'cli-no-cache',
    purpose: '--no-cache flag passes through to Jest',
    app: 'examples/jest/simple-app',
    command:
      'node ../../../packages/jest/tests/validate.js --no-cache --expect-suites=2 --expect-tests=4',
  },
  {
    id: 'cli-test-filter',
    purpose: '--test-name-pattern filters tests correctly',
    app: 'examples/jest/simple-app',
    command:
      'node ../../../packages/jest/tests/validate.js "--test-name-pattern=^AppComponent should create the app$" --expect-suites=1 --expect-tests=1 --expect-skipped=3',
  },
  {
    id: 'cli-reporters',
    purpose: '--reporters flag enables custom reporters',
    app: 'examples/jest/simple-app',
    command:
      'node ../../../packages/jest/tests/validate.js --reporters=default --reporters=jest-junit --expect-suites=2 --expect-file=junit.xml',
  },
  {
    id: 'cli-shard-first',
    purpose: '--shard=1/2 runs first half of tests',
    app: 'examples/jest/simple-app',
    command:
      'node ../../../packages/jest/tests/validate.js --shard=1/2 --expect-suites=1 --expect-tests=1',
  },
  {
    id: 'cli-shard-second',
    purpose: '--shard=2/2 runs second half of tests',
    app: 'examples/jest/simple-app',
    command:
      'node ../../../packages/jest/tests/validate.js --shard=2/2 --expect-suites=1 --expect-tests=3',
  },

  // Multi-project workspace
  {
    id: 'multi-project-first-app',
    purpose: 'Can run tests for specific project',
    app: 'examples/jest/multiple-apps',
    command:
      'node ../../../packages/jest/tests/validate.js my-first-app --expect-suites=1 --expect-tests=4',
  },
  {
    id: 'multi-project-second-app',
    purpose: 'Can run tests for another project',
    app: 'examples/jest/multiple-apps',
    command:
      'node ../../../packages/jest/tests/validate.js my-second-app --expect-suites=1 --expect-tests=3',
  },
  {
    id: 'multi-project-library',
    purpose: 'Can run tests for library',
    app: 'examples/jest/multiple-apps',
    command:
      'node ../../../packages/jest/tests/validate.js my-shared-library --expect-suites=2 --expect-tests=2',
  },
  {
    id: 'multi-project-filter',
    purpose: 'Filtering works with project selection',
    app: 'examples/jest/multiple-apps',
    command:
      'node ../../../packages/jest/tests/validate.js my-first-app "--test-name-pattern=^AppComponent should create the app$" --expect-suites=1 --expect-tests=1',
  },
  {
    id: 'multi-project-path-pattern',
    purpose: '--test-path-patterns filters by file path',
    app: 'examples/jest/multiple-apps',
    command:
      'node ../../../packages/jest/tests/validate.js my-shared-library --test-path-patterns=src/lib/my-shared-library.service.spec.ts$ --expect-suites=1 --expect-tests=1',
  },
  {
    id: 'multi-project-find-related',
    purpose: '--find-related-tests finds tests for changed files',
    app: 'examples/jest/multiple-apps',
    command:
      'node ../../../packages/jest/tests/validate.js my-shared-library --find-related-tests projects/my-shared-library/src/lib/my-shared-library.service.ts projects/my-shared-library/src/lib/my-shared-library.component.ts --expect-suites=2 --expect-tests=2',
  },

  // E2E sanity
  {
    id: 'e2e-simple-app',
    purpose: 'App built with Jest builder renders correctly',
    app: 'examples/jest/simple-app',
    command: 'yarn e2e',
  },
  {
    id: 'e2e-multiple-apps',
    purpose: 'Multi-project app renders correctly',
    app: 'examples/jest/multiple-apps',
    command: 'yarn e2e',
  },
];
```

### 3.3 Validate

```bash
# Verify discovery finds all three packages
node scripts/discover-tests.js

# Should show 13 + 12 + 14 = 39 tests

# Test the validator script works
cd examples/jest/simple-app
node ../../../packages/jest/tests/validate.js --no-cache --expect-suites=2 --expect-tests=4

# Should pass with "✓ All validations passed"
```

### 3.4 Commit

```bash
git add packages/jest/tests/
git commit -m "ci: add jest integration tests with validator"
```

---

## Step 4: Bazel Tests

### 4.1 Create `packages/bazel/tests/validate.js`

```javascript
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
```

### 4.2 Create `packages/bazel/tests/integration.js`

```javascript
module.exports = [
  {
    id: 'bazel-build',
    purpose: 'Bazel builder invokes bazel and produces correct output',
    app: 'examples/bazel',
    command: 'node ../../../packages/bazel/tests/validate.js',
  },
];
```

### 4.3 Validate

```bash
# Verify all tests discovered
node scripts/discover-tests.js

# Should show 40 total tests

# Test bazel validator (if bazel is available)
cd examples/bazel
node ../../../packages/bazel/tests/validate.js
```

### 4.4 Commit

```bash
git add packages/bazel/tests/
git commit -m "ci: add bazel integration tests"
```

---

## Step 5: Update GHA Workflow

### 5.1 Rewrite `.github/workflows/ci.yml`

```yaml
name: ci

on:
  push:
    branches: [master]
  pull_request:
  workflow_dispatch:
    inputs:
      release_type:
        description: 'Release type'
        required: true
        default: 'beta'
        type: choice
        options: [beta, graduate]

jobs:
  build:
    if: github.event_name == 'workflow_dispatch' || (!contains(github.event.head_commit.message, 'ci(release)'))
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20.19.0
      - uses: actions/cache@v4
        with:
          path: ~/.cache
          key: ${{ runner.os }}-yarn-${{ hashFiles('**/yarn.lock') }}
      - run: yarn --immutable
      - run: yarn build:packages
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: packages/*/dist

  discover:
    runs-on: ubuntu-latest
    outputs:
      matrix: ${{ steps.discover.outputs.matrix }}
    steps:
      - uses: actions/checkout@v4
      - id: discover
        run: node scripts/discover-tests.js >> $GITHUB_OUTPUT

  integration:
    needs: [build, discover]
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix: ${{ fromJson(needs.discover.outputs.matrix) }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20.19.0
      - uses: actions/cache@v4
        with:
          path: ~/.cache
          key: ${{ runner.os }}-yarn-${{ hashFiles('**/yarn.lock') }}
      - uses: actions/download-artifact@v4
        with:
          name: dist
          path: packages
      - run: yarn --immutable
      - name: ${{ matrix.purpose }}
        run: |
          cd ${{ matrix.app }}
          ${{ matrix.command }}

  publish:
    needs: [integration]
    if: github.ref == 'refs/heads/master' || github.event_name == 'workflow_dispatch'
    runs-on: ubuntu-latest
    permissions:
      contents: write
      id-token: write
    steps:
      - uses: actions/checkout@v4
        with:
          token: ${{ secrets.GH_PERSONAL_TOKEN }}
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: 20.19.0
          registry-url: 'https://registry.npmjs.org'
      - run: yarn --immutable
      - run: yarn build:packages
      - run: npm install -g npm@latest
      - name: Publish
        run: |
          git config --global user.name ${{ secrets.GIT_USER }}
          git config --global user.email ${{ secrets.GIT_EMAIL }}
          if [ "${{ github.event.inputs.release_type }}" == "graduate" ]; then
            npm run graduate -- --yes
          else
            bash scripts/default-registry.sh
          fi
```

### 5.2 Validate

```bash
# Dry run with act (if available)
act -n push

# Or push to a branch and check GHA runs
git push origin HEAD:ci-revamp-test

# Verify:
# - discover job outputs correct matrix
# - integration job spawns ~40 parallel jobs
# - each job name shows the "purpose" field
```

### 5.3 Commit

```bash
git add .github/workflows/ci.yml
git commit -m "ci: update workflow to use matrix from package test definitions"
```

---

## Step 6: Remove Custom Ports (Use Defaults)

Angular CLI default port is `4200`. Instead of hardcoding ports, just remove the custom port configs.

### 6.1 Update all angular.json files

Remove `"port"` from serve and e2e targets (let them use defaults):

Files to update:

- `examples/custom-webpack/sanity-app/angular.json` - remove `"port": 5001` and `"port": 4221`
- `examples/custom-webpack/sanity-app-esm/angular.json`
- `examples/custom-webpack/full-cycle-app/angular.json`
- `examples/custom-esbuild/sanity-esbuild-app/angular.json`
- `examples/custom-esbuild/sanity-esbuild-app-esm/angular.json`
- `examples/jest/simple-app/angular.json`
- `examples/jest/multiple-apps/angular.json`
- `examples/timestamp/angular.json`

### 6.2 Update all cypress.config.ts files

Remove hardcoded baseUrl port or set to default `http://localhost:4200`:

Files to update:

- `examples/custom-webpack/sanity-app/cypress.config.ts`
- `examples/custom-webpack/sanity-app-esm/cypress.config.ts`
- `examples/custom-webpack/full-cycle-app/cypress.config.ts`
- `examples/custom-esbuild/sanity-esbuild-app/cypress.config.ts`
- `examples/custom-esbuild/sanity-esbuild-app-esm/cypress.config.ts`
- `examples/jest/simple-app/cypress.config.ts`
- `examples/jest/multiple-apps/projects/*/cypress.config.ts`
- `examples/timestamp/cypress.config.ts`

### 6.3 Validate

```bash
# Run one e2e test to confirm default port works
cd examples/custom-webpack/sanity-app
yarn e2e

# Should work on default port 4200
```

### 6.4 Commit

```bash
git add examples/
git commit -m "ci: remove custom ports from example apps (use defaults)"
```

---

## Step 7: Cleanup Old Scripts

### 7.1 Delete unused files

```bash
rm scripts/verdaccio.yaml
rm scripts/local-registry.sh
rm scripts/run-ci.sh
rm packages/custom-webpack/scripts/ci.sh
rm packages/custom-esbuild/scripts/ci.sh
rm packages/jest/scripts/ci.sh
rmdir packages/custom-webpack/scripts  # if empty
rmdir packages/custom-esbuild/scripts  # if empty
# Keep packages/jest/scripts if validate.js is there, or move validate.js to tests/
```

### 7.2 Update package.json files

Remove `ci` script from:

- `packages/custom-webpack/package.json`
- `packages/custom-esbuild/package.json`
- `packages/jest/package.json`
- `packages/bazel/package.json`

Update root `package.json`:

- Remove or simplify `ci` script

### 7.3 Validate

```bash
# Ensure nothing references deleted files
grep -r "run-ci.sh" .
grep -r "local-registry.sh" .
grep -r "verdaccio" .

# Should return no results (or only this plan file)
```

### 7.4 Commit

```bash
git add -A
git commit -m "ci: remove old shell scripts and ci package scripts"
```

---

## Step 8: Documentation

### 8.1 Update `docs/CI_ARCHITECTURE.md`

Update to reflect new structure:

- Package-owned test definitions
- Discovery script
- Matrix-based parallel execution
- How to add new tests

### 8.2 Add local development section

```bash
# Run full CI locally (requires Docker + act)
act push

# Run specific test
act -j integration --matrix id:karma-builder-sanity-app

# Run single test without act
cd examples/custom-webpack/sanity-app && yarn e2e
```

### 8.3 Commit

```bash
git add docs/
git commit -m "docs: update CI architecture documentation"
```

---

## Step 9: Final Verification

### 9.1 Full local test

```bash
# Build packages
yarn build:packages

# Run discovery
node scripts/discover-tests.js

# Run a few tests manually
cd examples/custom-webpack/sanity-app && yarn e2e
cd examples/jest/simple-app && node ../../../packages/jest/tests/validate.js --no-cache --expect-suites=2
```

### 9.2 Push and verify GHA

```bash
git push origin HEAD

# Watch GitHub Actions:
# - Build job completes
# - Discover job outputs matrix
# - ~40 integration jobs run in parallel
# - All pass
```

### 9.3 Final commit (if any fixes needed)

```bash
git add -A
git commit -m "ci: final adjustments after testing"
```

---

## Expected Outcomes

| Metric               | Before                           | After                                 |
| -------------------- | -------------------------------- | ------------------------------------- |
| CI time              | 8-9 min                          | ~2-3 min                              |
| Test config location | 4 shell scripts + ci.yml         | Package-local integration.js          |
| Adding new test      | Edit shell script + manage ports | Add entry to package's integration.js |
| Local/CI parity      | Different tools                  | Same via `act`                        |
| Readability          | Shell + pipe-delimited strings   | JavaScript + structured objects       |
