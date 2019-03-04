import {MergeStrategies} from "./custom-webpack-builder-config";
jest.mock('./webpack-config-merger');
import {CustomWebpackBuilder, defaultWebpackConfigPath} from "./custom-webpack-builder";
import * as fs from 'fs';
import {WebpackConfigMerger} from "./webpack-config-merger";
import {Path} from '@angular-devkit/core';

const baseWebpackConfig = {
	entry: 'blah'
};

const customWebpackConfig = {
	module: {
		rules: [
			{
				test: '.node',
				use: 'node-loader'
			}
		]
	},
};

const customWebpackFunction = (config, options) => ({
	...config,
	module: {
		rules: [
			{
				test: '.node',
				user: 'node-loader',
				options: {
					prod: options.env === 'prod'
				}
			}
		]
	}
});

const customWebpackFunctionObj = {
	entry: 'blah',
	module: {
		rules: [
			{
				test: '.node',
				user: 'node-loader',
				options: {
					prod: true
				}
			}
		]
	}
};

function createConfigFile(fileName: string, content: any) {
	jest.unmock(`${__dirname}/${fileName}`);
	jest.mock(`${__dirname}/${fileName}`, () => content, {virtual: true});
}

describe('CustomWebpackBuilder test', () => {
	it('Should load webpack.config.js if no path specified', () => {
		createConfigFile(defaultWebpackConfigPath, customWebpackConfig);
		CustomWebpackBuilder.buildWebpackConfig(__dirname as Path, {}, baseWebpackConfig, {});
		expect(WebpackConfigMerger.merge).toHaveBeenCalledWith(baseWebpackConfig, customWebpackConfig, undefined, undefined);
	});

	it('Should load the file specified in configuration', () => {
		const fileName = 'extra-webpack.config.js';
		createConfigFile(fileName, customWebpackConfig);
		CustomWebpackBuilder.buildWebpackConfig(__dirname as Path, {path: fileName}, baseWebpackConfig, {});
		expect(WebpackConfigMerger.merge).toHaveBeenCalledWith(baseWebpackConfig, customWebpackConfig, undefined, undefined);
	});

	it('Should pass on merge strategies', () => {
		createConfigFile(defaultWebpackConfigPath, customWebpackConfig);
		const mergeStrategies: MergeStrategies = {'blah': 'prepend'};
		CustomWebpackBuilder.buildWebpackConfig(__dirname as Path, {mergeStrategies}, baseWebpackConfig, {});
		expect(WebpackConfigMerger.merge).toHaveBeenCalledWith(baseWebpackConfig, customWebpackConfig, mergeStrategies, undefined);
	});

	it('Should pass on replaceDuplicatePlugins flag', () => {
		createConfigFile(defaultWebpackConfigPath, customWebpackConfig);
		CustomWebpackBuilder.buildWebpackConfig(__dirname as Path, {replaceDuplicatePlugins: true}, baseWebpackConfig, {});
		expect(WebpackConfigMerger.merge).toHaveBeenCalledWith(baseWebpackConfig, customWebpackConfig, undefined, true);
	});

	it('Should execute custom function on configuration', () => {
		const spy = jest.fn((config, options) => config);
		createConfigFile(defaultWebpackConfigPath, spy);
		CustomWebpackBuilder.buildWebpackConfig(__dirname as Path, {}, baseWebpackConfig, {env: 'prod'});
		expect(spy).toHaveBeenCalledWith(baseWebpackConfig, {env: 'prod'});
	});

	it('Should apply custom function on configuration', () => {
		createConfigFile(defaultWebpackConfigPath, customWebpackFunction);
		const mergedConfig = CustomWebpackBuilder.buildWebpackConfig(__dirname as Path, {}, baseWebpackConfig, {env: 'prod'});
		expect(mergedConfig).toEqual(customWebpackFunctionObj);
	});
});
