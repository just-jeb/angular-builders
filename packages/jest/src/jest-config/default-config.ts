export default {
  globals: {
    "__TRANSFORM_HTML__": true
  },
  preset: 'jest-preset-angular',
  testURL: 'https://github.com/@angular-cli-builders',
  setupFilesAfterEnv: [`${__dirname}/setup.js`],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png)$': `${__dirname}/mock-module.js`
  }
};
