export default {
  'preset': 'jest-preset-angular',
  'setupTestFrameworkScriptFile': `${__dirname}/setup.ts`,
  "moduleNameMapper": {
    "\\.(jpg|jpeg|png)$": `${__dirname}/mock-module.js`,
  }
};
