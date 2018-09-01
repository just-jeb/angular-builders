import {MergeStrategies} from "./custom-webpack-builder-config";
import * as webpackMerge from 'webpack-merge';
import {Configuration} from "webpack";
import {differenceWith} from 'lodash';

export class WebpackConfigMerger {
	static merge(webpackConfig1: Configuration, webpackConfig2: Configuration, mergeStrategies: MergeStrategies = {}, replacePlugins = false): Configuration {
		const mergedConfig = webpackMerge.smartStrategy(mergeStrategies)(webpackConfig1, webpackConfig2);
		if(webpackConfig1.plugins && webpackConfig2.plugins && replacePlugins) {
      const aExceptb = differenceWith(webpackConfig1.plugins, webpackConfig2.plugins, (item1, item2) => item1.constructor.name === item2.constructor.name);
      mergedConfig.plugins = [...aExceptb, ...webpackConfig2.plugins];
    }
		return mergedConfig;
	}
}