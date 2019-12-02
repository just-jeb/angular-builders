import { getSystemPath, Path } from '@angular-devkit/core';
import { Configuration } from 'webpack';

import { VerboseLogger } from './verbose-logger';
import { mergeConfigs } from './webpack-config-merger';
import { CustomWebpackBuilderConfig } from './custom-webpack-builder-config';

export const defaultWebpackConfigPath = 'webpack.config.js';

type CustomWebpackConfig =
  | Configuration
  | Promise<Configuration>
  | ((baseWebpackConfig: Configuration, buildOptions: any) => Configuration)
  | ((baseWebpackConfig: Configuration, buildOptions: any) => Promise<Configuration>);

export class CustomWebpackBuilder {
  static async buildWebpackConfig(
    root: Path,
    config: CustomWebpackBuilderConfig,
    baseWebpackConfig: Configuration,
    buildOptions: any,
    verboseLogger: VerboseLogger
  ): Promise<Configuration> {
    if (!config) {
      return baseWebpackConfig;
    }

    const webpackConfigPath = config.path || defaultWebpackConfigPath;
    const path = `${getSystemPath(root)}/${webpackConfigPath}`;
    const configOrFactoryOrPromise = resolveCustomWebpackConfig(path);

    if (typeof configOrFactoryOrPromise === 'function') {
      // That exported function can be synchronous either
      // asynchronous. Given the following example:
      // `module.exports = async (config) => { ... }`
      const finalConfig = configOrFactoryOrPromise(
        baseWebpackConfig,
        buildOptions
      ) as Configuration;
      verboseLogger.logFinalConfig(finalConfig);
      return finalConfig;
    }

    // The user can also export a `Promise` that resolves `Configuration`
    // object. Given the following example:
    // `module.exports = new Promise(resolve => resolve({ ... }))`
    // If the user has exported a plain object, like:
    // `module.exports = { ... }`
    // then it will promisified and awaited
    const resolvedConfig = await configOrFactoryOrPromise;
    const finalConfig = mergeConfigs(
      baseWebpackConfig,
      resolvedConfig,
      config.mergeStrategies,
      config.replaceDuplicatePlugins
    );

    verboseLogger.logFinalConfig(finalConfig);
    return finalConfig;
  }
}

function resolveCustomWebpackConfig(path: string): CustomWebpackConfig {
  if (path.endsWith('.ts')) {
    // Register TS compiler lazily
    require('ts-node').register({
      compilerOptions: {
        module: 'commonjs',
      },
    });
  }

  const customWebpackConfig = require(path);
  // If the user provides a configuration in TS file
  // then there are 2 cases for exporing an object. The first one is:
  // `module.exports = { ... }`. And the second one is:
  // `export default { ... }`. The ESM format is compiled into:
  // `{ default: { ... } }`
  return customWebpackConfig.default || customWebpackConfig;
}
