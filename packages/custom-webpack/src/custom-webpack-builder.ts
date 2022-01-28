import { getSystemPath, logging, Path } from '@angular-devkit/core';
import { Configuration } from 'webpack';
import { CustomWebpackBrowserSchema } from './browser';
import { CustomWebpackBuilderConfig } from './custom-webpack-builder-config';
import { TargetOptions } from './type-definition';
import { loadModule, tsNodeRegister } from './utils';
import { mergeConfigs } from './webpack-config-merger';

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
    targetOptions: TargetOptions,
    logger: logging.LoggerApi
  ): Promise<Configuration> {
    if (!config) {
      return baseWebpackConfig;
    }

    const webpackConfigPath = config.path || defaultWebpackConfigPath;
    const path = `${getSystemPath(root)}/${webpackConfigPath}`;
    const tsConfig = `${getSystemPath(root)}/${buildOptions.tsConfig}`;
    const configOrFactoryOrPromise = await resolveCustomWebpackConfig(path, tsConfig, logger);

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
      config.mergeRules,
      config.replaceDuplicatePlugins
    );
  }
}

async function resolveCustomWebpackConfig(
  path: string,
  tsConfig: string,
  logger: logging.LoggerApi
): Promise<CustomWebpackConfig> {
  tsNodeRegister(path, tsConfig, logger);

  return loadModule(path);
}
