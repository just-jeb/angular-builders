import {globals} from 'jest-preset-angular/jest-preset.js';

export default {
  globals,
  preset: 'jest-preset-angular',
  testURL: 'https://github.com/@angular-cli-builders',
  setupFilesAfterEnv: [`${__dirname}/setup.js`],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png)$': `${__dirname}/mock-module.js`,
  },
};
