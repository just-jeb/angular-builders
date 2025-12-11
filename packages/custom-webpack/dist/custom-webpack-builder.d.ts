import { logging, Path } from '@angular-devkit/core';
import { Configuration } from 'webpack';
import { CustomWebpackBuilderConfig } from './custom-webpack-builder-config';
import { TargetOptions } from './type-definition';
export declare const defaultWebpackConfigPath = "webpack.config.js";
export declare class CustomWebpackBuilder {
    static buildWebpackConfig(root: Path, config: CustomWebpackBuilderConfig | null, baseWebpackConfig: Configuration, buildOptions: any, targetOptions: TargetOptions, logger: logging.LoggerApi): Promise<Configuration>;
}
