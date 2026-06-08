import { Configuration } from 'webpack';
// JSON import from a TypeScript webpack config, loaded via jiti (regression for #816).
import { name } from './package.json';

export default {
  name: `custom-${name}`,
  plugins: [],
} as Configuration;
