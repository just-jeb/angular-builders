import { inspect } from 'util';
import { getSystemPath, logging, Path } from '@angular-devkit/core';
import { get } from 'lodash';
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
    config: CustomWebpackBuilderConfig | null,
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
      // The exported function can return a new configuration synchronously
      // or return a promise that resolves to a new configuration.
      const finalWebpackConfig = await configOrFactoryOrPromise(
        baseWebpackConfig,
        buildOptions,
        targetOptions
      );
      logConfigProperties(config, finalWebpackConfig, logger);
      return finalWebpackConfig;
    }

    // The user can also export a promise that resolves to a `Configuration` object.
    // Suppose the following example:
    // `module.exports = new Promise(resolve => resolve({ ... }))`
    // This is valid both for promise and non-promise cases. If users export
    // a plain object, for instance, `module.exports = { ... }`, then it will
    // be wrapped into a promise and also `awaited`.
    const resolvedConfig = await configOrFactoryOrPromise;

    const finalWebpackConfig = mergeConfigs(
      baseWebpackConfig,
      resolvedConfig,
      config.mergeRules,
      config.replaceDuplicatePlugins
    );
    logConfigProperties(config, finalWebpackConfig, logger);
    return finalWebpackConfig;
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

function logConfigProperties(
  config: CustomWebpackBuilderConfig,
  webpackConfig: Configuration,
  logger: logging.LoggerApi
): void {
  // There's no reason to log the entire configuration object
  // since Angular's Webpack configuration is huge by default
  // and doesn't bring any meaningful context by being printed
  // entirely. Users can provide a list of properties they want to be logged.
  if (config.verbose?.properties) {
    for (const property of config.verbose.properties) {
      const value = get(webpackConfig, property);
      if (value) {
        const message = inspect(value, /* showHidden */ false, config.verbose.serializationDepth);
        logger.info(message);
      }
    }
  }
}
