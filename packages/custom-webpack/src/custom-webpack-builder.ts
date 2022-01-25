import { getSystemPath, Path, logging } from '@angular-devkit/core';
import { Configuration } from 'webpack';

import { mergeConfigs } from './webpack-config-merger';
import { CustomWebpackBuilderConfig } from './custom-webpack-builder-config';
import { tsNodeRegister } from './utils';
import { TargetOptions } from './type-definition';
import { CustomWebpackBrowserSchema } from './browser';
import { pathToFileURL } from 'url';
import { extname } from 'path';
import { existsSync } from 'fs';

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

  const customWebpackConfig = await getWebpackConfig(path);
  // If the user provides a configuration in TS file
  // then there are 2 cases for exporing an object. The first one is:
  // `module.exports = { ... }`. And the second one is:
  // `export default { ... }`. The ESM format is compiled into:
  // `{ default: { ... } }`
  return (customWebpackConfig as any).default || customWebpackConfig;
}

/**
 * This uses a dynamic import to load a module which may be ESM.
 * CommonJS code can load ESM code via a dynamic import. Unfortunately, TypeScript
 * will currently, unconditionally downlevel dynamic import into a require call.
 * require calls cannot load ESM code and will result in a runtime error. To workaround
 * this, a Function constructor is used to prevent TypeScript from changing the dynamic import.
 * Once TypeScript provides support for keeping the dynamic import this workaround can
 * be dropped.
 *
 * @param modulePath The path of the module to load.
 * @returns A Promise that resolves to the dynamically imported module.
 */
function loadEsmModule<T>(modulePath: string | URL): Promise<T> {
  return new Function('modulePath', `return import(modulePath);`)(modulePath) as Promise<T>;
}

export async function getWebpackConfig(configPath: string): Promise<CustomWebpackConfig> {
  switch (extname(configPath)) {
    case '.mjs':
      // Load the ESM configuration file using the TypeScript dynamic import workaround.
      // Once TypeScript provides support for keeping the dynamic import this workaround can be
      // changed to a direct dynamic import.
      return (await loadEsmModule<{ default: CustomWebpackConfig }>(pathToFileURL(configPath)))
        .default;
    case '.cjs':
      return require(configPath);
    default:
      // The file could be either CommonJS or ESM.
      // CommonJS is tried first then ESM if loading fails.
      try {
        return require(configPath);
      } catch (e: any) {
        if (e.code === 'ERR_REQUIRE_ESM') {
          // Load the ESM configuration file using the TypeScript dynamic import workaround.
          // Once TypeScript provides support for keeping the dynamic import this workaround can be
          // changed to a direct dynamic import.
          return (await loadEsmModule<{ default: CustomWebpackConfig }>(pathToFileURL(configPath)))
            .default;
        }

        throw e;
      }
  }
}
