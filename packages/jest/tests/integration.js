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
