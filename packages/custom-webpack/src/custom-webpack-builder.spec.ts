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

function createConfigFile(fileName: string){
	jest.mock(`${__dirname}/${fileName}`, ()=>customWebpackConfig, {virtual: true});
}

describe('CustomWebpackBuilder test', () => {
	let fileName: string;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('Should load webpack.config.js if no path specified', () => {
		fileName = defaultWebpackConfigPath;
		createConfigFile(fileName);
		CustomWebpackBuilder.buildWebpackConfig(__dirname as Path, {}, baseWebpackConfig);
		expect(WebpackConfigMerger.merge).toHaveBeenCalledWith(baseWebpackConfig, customWebpackConfig, undefined, undefined);
	});

	it('Should load the file specified in configuration', () => {
		fileName = 'extra-webpack.config.js';
		createConfigFile(fileName);
		CustomWebpackBuilder.buildWebpackConfig(__dirname as Path, {path: 'extra-webpack.config.js'}, baseWebpackConfig);
		expect(WebpackConfigMerger.merge).toHaveBeenCalledWith(baseWebpackConfig, customWebpackConfig, undefined, undefined);
	});

	it('Should pass on merge strategies', () => {
		fileName = defaultWebpackConfigPath;
		createConfigFile(fileName);
		const mergeStrategies: MergeStrategies = {'blah': 'prepend'};
		CustomWebpackBuilder.buildWebpackConfig(__dirname as Path, {mergeStrategies}, baseWebpackConfig);
		expect(WebpackConfigMerger.merge).toHaveBeenCalledWith(baseWebpackConfig, customWebpackConfig, mergeStrategies, undefined);
	});

	it('Should pass on replaceDuplicatePlugins flag', () => {
		fileName = defaultWebpackConfigPath;
		createConfigFile(fileName);
		CustomWebpackBuilder.buildWebpackConfig(__dirname as Path, {replaceDuplicatePlugins: true}, baseWebpackConfig);
		expect(WebpackConfigMerger.merge).toHaveBeenCalledWith(baseWebpackConfig, customWebpackConfig, undefined, true);
	});

	it('Should ignore if no customWebpackConfig set', () => {
		const config = CustomWebpackBuilder.buildWebpackConfig(__dirname as Path, null, baseWebpackConfig);
		expect(WebpackConfigMerger.merge).not.toHaveBeenCalled();
		expect(config).toEqual(baseWebpackConfig);
	});
});
