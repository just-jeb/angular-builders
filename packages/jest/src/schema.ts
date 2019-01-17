export interface JestBuilderSchema {
  configPath: string;
  // Schema options are matching this: https://github.com/facebook/jest/blob/master/packages/jest-cli/src/cli/args.js
  [option: string]: string | boolean | string[];
}