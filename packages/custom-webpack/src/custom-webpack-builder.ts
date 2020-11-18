import { getSystemPath, Path } from '@angular-devkit/core';
import { Configuration } from 'webpack';

import { mergeConfigs } from './webpack-config-merger';
import { CustomWebpackBuilderConfig } from './custom-webpack-builder-config';
import { tsNodeRegister } from './utils';
import { TargetOptions } from './type-definition';
import { CustomWebpackBrowserSchema } from './browser';

export const defaultWebpackConfigPath = 'webpack.config.js';

type CustomWebpackConfig =
  | Configuration
  | Promise<Configuration>
  | ((
      baseWebpackConfig: Configuration,
      buildOptions: CustomWebpackBrowserSchema,
      targetOptions: TargetOptions
    ) => Configuration)
  | ((
      baseWebpackConfig: Configuration,
      buildOptions: CustomWebpackBrowserSchema,
      targetOptions: TargetOptions
    ) => Promise<Configuration>);

export class CustomWebpackBuilder {
  static async buildWebpackConfig(
    root: Path,
    config: CustomWebpackBuilderConfig,
    baseWebpackConfig: Configuration,
    buildOptions: any,
    targetOptions: TargetOptions
  ): Promise<Configuration> {
    if (!config) {
      return baseWebpackConfig;
    }

    const webpackConfigPath = config.path || defaultWebpackConfigPath;
    const path = `${getSystemPath(root)}/${webpackConfigPath}`;
    const tsConfig = `${getSystemPath(root)}/${buildOptions.tsConfig}`;
    const configOrFactoryOrPromise = resolveCustomWebpackConfig(path, tsConfig);

    if (typeof configOrFactoryOrPromise === 'function') {
      // That exported function can be synchronous either
      // asynchronous. Given the following example:
      // `module.exports = async (config) => { ... }`
      return configOrFactoryOrPromise(baseWebpackConfig, buildOptions, targetOptions);
    }

    // The user can also export a `Promise` that resolves `Configuration`
    // object. Given the following example:
    // `module.exports = new Promise(resolve => resolve({ ... }))`
    // If the user has exported a plain object, like:
    // `module.exports = { ... }`
    // then it will promisified and awaited
    const resolvedConfig = await configOrFactoryOrPromise;

    return mergeConfigs(
      baseWebpackConfig,
      resolvedConfig,
      config.mergeStrategies,
      config.replaceDuplicatePlugins
    );
  }
}

function resolveCustomWebpackConfig(path: string, tsConfig: string): CustomWebpackConfig {
  tsNodeRegister(path, tsConfig);

  const customWebpackConfig = require(path);
  // If the user provides a configuration in TS file
  // then there are 2 cases for exporing an object. The first one is:
  // `module.exports = { ... }`. And the second one is:
  // `export default { ... }`. The ESM format is compiled into:
  // `{ default: { ... } }`
  return customWebpackConfig.default || customWebpackConfig;
}
