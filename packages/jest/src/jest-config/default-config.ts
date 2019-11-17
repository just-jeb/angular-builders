export default {
  globals: {
    'ts-jest': {
      stringifyContentPathRegex: '\\.html$',
      astTransformers: ['jest-preset-angular/InlineHtmlStripStylesTransformer.js'],
    },
  },
  preset: 'jest-preset-angular',
  testURL: 'https://github.com/@angular-cli-builders',
  setupFilesAfterEnv: [`${__dirname}/setup.js`],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png)$': `${__dirname}/mock-module.js`,
  },
};
