module.exports = {
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        diagnostics: false,
      },
    ],
    '^.+\\.mjs$': '<rootDir>/jest-esm-transformer.js',
  },
  // node_modules stay untransformed except ESM-only `.mjs` files (see jest-esm-transformer.js).
  transformIgnorePatterns: ['/node_modules/.+\\.(?!mjs$)[^.]+$'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'mjs', 'json'],
  testEnvironment: './jest-custom-environment',
};
