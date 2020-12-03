import { resolve } from 'path';

/**
 * Register `ts-node` if webpack config file is a TypeScript file.
 *
 * @param file - webpack config file path
 * @param root - path to project root
 * @param tsConfig - tsConfig file name
 */
export function tsNodeRegister(file: string = '', root: string, tsConfig: string) {
  if (!file.endsWith('.ts')) {
    return;
  }

  const tsConfigPath = resolve(root, tsConfig);

  require('ts-node').register({
    project: tsConfigPath,
    compilerOptions: {
      module: 'commonjs',
    },
  });

  require('ts-node').register = function () {
    /* prevent Karma to register its own version of `ts-node` */
  };
}
