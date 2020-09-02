import { resolve } from 'path';

/**
 * Register `ts-node` if webpack config file is a TypeScript file.
 *
 * @param file - webpack config file path
 * @param root - path to project root
 * @param tsConfig - tsConfig file name
 */
export function tsNodeRegister(file = '', root: string, tsConfig: string) {
  if (!file.endsWith('.ts')) {
    return;
  }

  const tsConfigPath = resolve(root, tsConfig);

  const { register } = require('ts-node');

  register({
    project: tsConfigPath,
    compilerOptions: {
      module: 'commonjs',
    },
  });
}
