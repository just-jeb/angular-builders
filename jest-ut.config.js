module.exports = {
  ...require('./jest-common.config'),
  testRegex: `${process.cwd()}/(?!(e2e|examples)/).+\\.spec\\.ts`,
  // Stub ESM-only `ora` (pulled in by @angular-devkit/schematics' package-manager
  // task executor). Tests never exercise that executor, so a no-op shim is enough.
  moduleNameMapper: {
    '^ora$': '<rootDir>/__mocks__/ora.js',
  },
};
