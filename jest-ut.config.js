module.exports = {
  ...require('./jest-common.config'),
  testRegex: `${process.cwd()}/(?!(e2e|examples)/).+\\.spec\\.ts`,
  // Stub ESM-only `ora` (pulled in by @angular-devkit/schematics' package-manager
  // task executor). Tests never exercise that executor, so a no-op shim is enough.
  moduleNameMapper: {
    '^ora$': '<rootDir>/__mocks__/ora.js',
    // Redirect @angular-builders/common subpath exports to the worktree build so
    // schematics specs can import from the in-tree dist without a yarn re-install.
    '^@angular-builders/common/schematics/testing$':
      '<rootDir>/packages/common/dist/schematics/testing.js',
    '^@angular-builders/common/schematics$':
      '<rootDir>/packages/common/dist/schematics/index.js',
  },
};
