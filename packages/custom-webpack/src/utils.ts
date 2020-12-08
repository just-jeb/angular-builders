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

  if (!root || !tsConfig) {
    throw new Error('No root or tsConfig present.');
  }

  const tsConfigPath = resolve(root, tsConfig);

  try {
    require('ts-node').register({
      project: tsConfigPath,
      compilerOptions: {
        module: 'commonjs',
      },
    });
  } catch (error) {
    throw new Error(error);
  }

  // BUG: https://github.com/karma-runner/karma/pull/3274
}
