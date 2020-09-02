import { resolve } from 'path';

/**
 * Register `ts-node` if webpack config file is a TypeScript file.
 *
 * @param file - webpack config file path
 * @param root - path to project root
 */
export function tsNodeRegister(file = '', root = process.cwd()) {
  if (!file.endsWith('.ts')) {
    return;
  }

  const tsConfigPath = resolve(root, 'tsconfig.app.json');

  const { register } = require('ts-node');

  register({
    project: tsConfigPath,
    compilerOptions: {
      module: 'commonjs',
    },
  });
}
