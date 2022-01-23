module.exports = {
  ...require('./jest-common.config.cjs'),
  testRegex: `${process.cwd()}/e2e/.+\\.spec\\.ts`,
};
