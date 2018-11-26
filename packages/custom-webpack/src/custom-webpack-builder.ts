import { CustomWebpackBuilderConfig } from "./custom-webpack-builder-config";
import { Configuration } from "webpack";
import { getSystemPath, Path } from '@angular-devkit/core';
import { WebpackConfigMerger } from "./webpack-config-merger";

export const defaultWebpackConfigPath = 'webpack.config.js';

export class CustomWebpackBuilder {
    static buildWebpackConfig(root: Path, config: CustomWebpackBuilderConfig, baseWebpackConfig: Configuration, buildOptions: any): Configuration {
        const webpackConfigPath = config.path || defaultWebpackConfigPath;
        const customWebpackConfig = require(`${getSystemPath(root)}/${webpackConfigPath}`);
        let customWebpackConfigObj = {};
        if (typeof customWebpackConfig == "object")
            customWebpackConfigObj = customWebpackConfig;
        else if (typeof customWebpackConfig == "function")
            customWebpackConfigObj = customWebpackConfig(buildOptions);

        return WebpackConfigMerger.merge(baseWebpackConfig, customWebpackConfigObj, config.mergeStrategies, config.replaceDuplicatePlugins);
    }
}