export default {
  'preset': 'jest-preset-angular',
  'testURL': 'https://github.com/@angular-cli-builders',
  'setupTestFrameworkScriptFile': `${__dirname}/setup.js`,
  "moduleNameMapper": {
    "\\.(jpg|jpeg|png)$": `${__dirname}/mock-module.js`,
  }
};
