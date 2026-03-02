import * as path from 'node:path';
import { inspect } from 'util';
import { getSystemPath, logging, Path } from '@angular-devkit/core';
import { Configuration } from 'webpack';
import { loadModule } from '@angular-builders/common';

import { CustomWebpackBrowserSchema } from './browser';
import { CustomWebpackBuilderConfig } from './custom-webpack-builder-config';
import { TargetOptions } from './type-definition';
import { mergeConfigs } from './webpack-config-merger';

export const defaultWebpackConfigPath = 'webpack.config.js';

/**
 * Accesses a nested property by dot/bracket path (e.g. 'output.enabledChunkLoadingTypes[0]').
 */
function getByPath(obj: any, path: string): any {
  const keys = path.replace(/\[(\d+)]/g, '.$1').split('.');
  let result = obj;
  for (const key of keys) {
    result = result?.[key];
  }
  return result;
}

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

    const normalizedRootPath = getSystemPath(root);
    const tsConfig = path.join(normalizedRootPath, buildOptions.tsConfig);
    const webpackConfigPath = path.join(
      normalizedRootPath,
      config.path || defaultWebpackConfigPath
    );
    const configOrFactoryOrPromise = await loadModule<CustomWebpackConfig>(
      webpackConfigPath,
      tsConfig,
      logger
    );

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
      const value = getByPath(webpackConfig, property);
      if (value) {
        const message = inspect(value, /* showHidden */ false, config.verbose.serializationDepth);
        logger.info(message);
      }
    }
  }
}
