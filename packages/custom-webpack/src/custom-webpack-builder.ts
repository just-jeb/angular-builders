import { getSystemPath, Path } from '@angular-devkit/core';
import { Configuration } from 'webpack';

import { mergeConfigs } from './webpack-config-merger';
import { CustomWebpackBuilderConfig } from './custom-webpack-builder-config';

export const defaultWebpackConfigPath = 'webpack.config.js';

type CustomWebpackConfig =
    | Configuration
    | Promise<Configuration>
    | ((baseWebpackConfig: Configuration, buildOptions: any) => Configuration)
    | ((baseWebpackConfig: Configuration, buildOptions: any) => Promise<Configuration>);

export class CustomWebpackBuilder {
    static buildWebpackConfig(
        root: Path,
        config: CustomWebpackBuilderConfig,
        baseWebpackConfig: Configuration,
        buildOptions: any
    ): Configuration | Promise<Configuration> {
        if (!config) {
            return baseWebpackConfig;
        }

        const webpackConfigPath = config.path || defaultWebpackConfigPath;
        const configOrFactoryOrPromise: CustomWebpackConfig = require(`${getSystemPath(
            root
        )}/${webpackConfigPath}`);

        if (configOrFactoryOrPromise instanceof Promise) {
            // The user can also export a `Promise` that resolves `Configuration`
            // object. Given the following example:
            // `module.exports = new Promise(resolve => resolve({ ... }))`
            return configOrFactoryOrPromise.then(customWebpackConfig =>
                mergeConfigs(
                    baseWebpackConfig,
                    customWebpackConfig,
                    config.mergeStrategies,
                    config.replaceDuplicatePlugins
                )
            );
        }

        if (typeof configOrFactoryOrPromise === 'function') {
            // That exported function can be synchronous either
            // asynchronous. Given the following example:
            // `module.exports = async (config) => { ... }`
            return configOrFactoryOrPromise(baseWebpackConfig, buildOptions);
        }

        // In this case the user has exported a plain object, like:
        // `module.exports = { ... }`
        return mergeConfigs(
            baseWebpackConfig,
            configOrFactoryOrPromise,
            config.mergeStrategies,
            config.replaceDuplicatePlugins
        );
    }
}
