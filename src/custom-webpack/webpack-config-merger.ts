import {MergeStrategies} from "./custom-webpack-builder-config";
import * as webpackMerge from 'webpack-merge';
import {Configuration} from "webpack";
import {mergeWith, differenceWith} from 'lodash';
import {CustomizeArrayFunction} from "webpack-merge";

const joinArrays = require('webpack-merge/lib/join-arrays');

export class WebpackConfigMerger {
	static merge(webpackConfig1: Configuration, webpackConfig2: Configuration, mergeStrategies: MergeStrategies = {}, replacePlugins = false): Configuration {
		return webpackMerge({
			customizeArray: replacePlugins ? mergeReplacePlugins(customizeArray(mergeStrategies)) : customizeArray(mergeStrategies),
			customizeObject: customizeObject(mergeStrategies)
		})
		(webpackConfig1, webpackConfig2)
	}
}

function mergeReplacePlugins(defaultArrayMerger: CustomizeArrayFunction) {
	return (a: any[], b: any[], key: string) => {
		let plugins;
		if (key === 'plugins') {
			const aExceptb = differenceWith(a, b, (item1: Plugin, item2: Plugin) => item1.constructor.name === item2.constructor.name);
			plugins = [...aExceptb, ...b];
		} else {
			plugins = defaultArrayMerger(a, b, key);
		}
		return plugins;
	}
}

function customizeArray(strategies: MergeStrategies) {
	return (a: any[], b: any[], key: string) => {
		switch (strategies[key]) {
			case 'prepend':
				return [...b, ...a];
			case 'replace':
				return b;
			default: // append
				return undefined;
		}
	};
}

function customizeObject(strategies: MergeStrategies) {
	return (a: any, b: any, key: string) => {
		switch (strategies[key]) {
			case 'prepend':
				return mergeWith({}, b, a, joinArrays());
			case 'replace':
				return b;
			default: // append
				return undefined;
		}
	};
}
