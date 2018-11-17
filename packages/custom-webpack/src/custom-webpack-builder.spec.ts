import {MergeStrategies} from "./custom-webpack-builder-config";
import {CustomWebpackBuilder, defaultWebpackConfigPath} from "./custom-webpack-builder";
import {WebpackConfigMerger} from "./webpack-config-merger";
import {Path} from '@angular-devkit/core';
import {LoggerApi} from "@angular-devkit/core/src/logger";
import Mock = jest.Mock;
import {stringify} from "./json-stringifier";

jest.mock('./json-stringifier');
jest.mock('./webpack-config-merger');

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

const myLogger: LoggerApi = {
  createChild: jest.fn(),
	log: jest.fn(),
	debug: jest.fn(),
	info: jest.fn(),
	warn: jest.fn(),
	error: jest.fn(),
	fatal: jest.fn()
};

describe('CustomWebpackBuilder test', () => {
	let fileName: string;
	let customWebpackBuilder: CustomWebpackBuilder;
	beforeEach(() => {
    customWebpackBuilder = new CustomWebpackBuilder(myLogger);
    jest.clearAllMocks();
	});

	it('Should load webpack.config.js if no path specified', () => {
		fileName = defaultWebpackConfigPath;
		createConfigFile(fileName);
    customWebpackBuilder.buildWebpackConfig(__dirname as Path, {}, baseWebpackConfig);
		expect(WebpackConfigMerger.merge).toHaveBeenCalledWith(baseWebpackConfig, customWebpackConfig, undefined, undefined);
	});

	it('Should load the file specified in configuration', () => {
		fileName = 'extra-webpack.config.js';
		createConfigFile(fileName);
    customWebpackBuilder.buildWebpackConfig(__dirname as Path, {path: 'extra-webpack.config.js'}, baseWebpackConfig);
		expect(WebpackConfigMerger.merge).toHaveBeenCalledWith(baseWebpackConfig, customWebpackConfig, undefined, undefined);
	});

	it('Should pass on merge strategies', () => {
		fileName = defaultWebpackConfigPath;
		createConfigFile(fileName);
		const mergeStrategies: MergeStrategies = {'blah': 'prepend'};
    customWebpackBuilder.buildWebpackConfig(__dirname as Path, {mergeStrategies}, baseWebpackConfig);
		expect(WebpackConfigMerger.merge).toHaveBeenCalledWith(baseWebpackConfig, customWebpackConfig, mergeStrategies, undefined);
	});

	it('Should pass on replaceDuplicatePlugins flag', () => {
		fileName = defaultWebpackConfigPath;
		createConfigFile(fileName);
    customWebpackBuilder.buildWebpackConfig(__dirname as Path, {replaceDuplicatePlugins: true}, baseWebpackConfig);
		expect(WebpackConfigMerger.merge).toHaveBeenCalledWith(baseWebpackConfig, customWebpackConfig, undefined, true);
	});

  it('Should log final configuration on debug log level', () => {
  	const mockConfig = {blah: "blah final"};
  	const mockStringifiedConfig = 'mystringifiedconfig';
		(WebpackConfigMerger.merge as Mock).mockReturnValueOnce(mockConfig);
		(stringify as Mock).mockReturnValue(mockStringifiedConfig);
    fileName = defaultWebpackConfigPath;
    createConfigFile(fileName);
    customWebpackBuilder.buildWebpackConfig(__dirname as Path, {replaceDuplicatePlugins: true}, baseWebpackConfig);
    expect(myLogger.debug).toHaveBeenCalledTimes(1);
    expect(stringify).toHaveBeenCalledWith(mockConfig);
    expect(myLogger.debug).toHaveBeenCalledWith(`Final webpack configuration is: \n ${mockStringifiedConfig}`);
  });
});