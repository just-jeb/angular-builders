module.exports = {
  ...require('./jest-common.config'),
  testRegex: `${process.cwd()}/(?!(e2e|examples)/).+\\.spec\\.ts`,
};
