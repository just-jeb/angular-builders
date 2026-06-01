import { Configuration } from 'webpack';
// JSON import: verifies that ts-node is registered with resolveJsonModule:true (regression for #816).
// Without the fix, this fails with TS2307 when the project tsconfig lacks resolveJsonModule.
import { name } from './package.json';

export default {
  name: `custom-${name}`,
  plugins: [],
} as Configuration;
