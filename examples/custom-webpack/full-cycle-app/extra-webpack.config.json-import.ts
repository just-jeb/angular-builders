import { Configuration } from 'webpack';
// Importing a JSON file from a TypeScript webpack config. The builder loads this
// file with jiti, which must resolve JSON imports.
// Regression test for: https://github.com/just-jeb/angular-builders/issues/816
import * as pkg from './package.json';

const _name: string = (pkg as any).name;

export default {
  plugins: [],
} as Configuration;
