const globalJestConfig = require('../../jest.config.js');

module.exports = {
  ...globalJestConfig,
  globals: {
    'ts-jest': {
      tsConfigFile: `${__dirname}/tsconfig.spec.json`
    },
    __TRANSFORM_HTML__: true
  },
  testMatch: [
    `${__dirname}/**/+(*.)+(spec|test).+(ts|js)?(x)`
  ]
};
