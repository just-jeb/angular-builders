module.exports = {
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        diagnostics: false,
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  testEnvironment: './jest-custom-environment',
  // `@angular-devkit/schematics/testing` transitively imports `ora` (ESM-only).
  // Map it to a CJS no-op stub so schematic unit tests can run under ts-jest without
  // enabling full ESM mode for the entire test suite.
  moduleNameMapper: {
    '^ora$': '<rootDir>/jest-ora-mock.cjs',
  },
};
