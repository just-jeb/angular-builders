/**
 * Register `ts-node` if webpack config file is a TypeScript file.
 *
 * @param file - webpack config file path
 * @param tsConfig - tsConfig file name
 */
export function tsNodeRegister(file: string = '', tsConfig?: string) {
  if (!file.endsWith('.ts')) {
    return;
  }

  try {
    require('ts-node').register({
      project: tsConfig,
      compilerOptions: {
        module: 'commonjs',
      },
    });
  } catch (error) {
    throw new Error(error);
  }

  // BUG: https://github.com/karma-runner/karma/pull/3274
}
