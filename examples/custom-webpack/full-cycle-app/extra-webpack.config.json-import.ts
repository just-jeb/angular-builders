import { Configuration } from 'webpack';
// Importing a JSON file from a TypeScript webpack config.
// Requires resolveJsonModule: true to be set — either in the user's tsconfig or
// injected by the builder's ts-node registration.
// When moduleResolution is 'node' and resolveJsonModule is absent, ts-node throws TS2732.
// Regression test for: https://github.com/just-jeb/angular-builders/issues/816
import * as pkg from './package.json';

const _name: string = (pkg as any).name;

export default {
  plugins: [],
} as Configuration;
