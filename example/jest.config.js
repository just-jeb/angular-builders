module.exports = {
  preset: 'jest-preset-angular',
  globals: {
    'ts-jest': {
      tsConfigFile: `${__dirname}/tsconfig.json`
    },
    __TRANSFORM_HTML__: true
  },
  testMatch: [
    `${__dirname}/**/+(*.)+(spec|test).+(ts|js)?(x)`
  ],
  setupTestFrameworkScriptFile: '<rootDir>/node_modules/@angular-builders/jest/jest-config/setup.js',
  moduleNameMapper: {
    '\\.(jpg|jpeg|png)$': '<rootDir>/node_modules/@angular-builders/jest/jest-config/mock-module.js'
  }
};
