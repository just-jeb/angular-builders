import {CustomWebpackBuilderConfig} from "./custom-webpack-builder-config";
import {Configuration} from "webpack";
import {getSystemPath, Path} from '@angular-devkit/core';
import {WebpackConfigMerger} from "./webpack-config-merger";
import {LoggerApi} from "@angular-devkit/core/src/logger";
import {stringify} from "./json-stringifier";
import {createConsoleLogger} from '@angular-devkit/core/node';

export const defaultWebpackConfigPath = 'webpack.config.js';

export class CustomWebpackBuilderFactory {
	static create(options: {verbose: boolean}){
		return new CustomWebpackBuilder(createConsoleLogger(options.verbose))
	}
}

export class CustomWebpackBuilder {
	constructor(private logger: LoggerApi){
	}
	buildWebpackConfig(root: Path, config: CustomWebpackBuilderConfig, baseWebpackConfig: Configuration): Configuration{
		const webpackConfigPath = config.path || defaultWebpackConfigPath;
		const customWebpackConfig = require(`${getSystemPath(root)}/${webpackConfigPath}`);
		const finalWebpackConfig = WebpackConfigMerger.merge(baseWebpackConfig, customWebpackConfig, config.mergeStrategies, config.replaceDuplicatePlugins);
		this.logger.debug(`Final webpack configuration is: \n ${stringify(finalWebpackConfig)}`);
		return finalWebpackConfig;
	}
}