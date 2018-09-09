import {MergeStrategies} from "./custom-webpack-builder-config";
import * as webpackMerge from 'webpack-merge';
import {Configuration} from "webpack";
import {differenceWith, keyBy, merge} from 'lodash';

export class WebpackConfigMerger {
	static merge(webpackConfig1: Configuration, webpackConfig2: Configuration, mergeStrategies: MergeStrategies = {}, replacePlugins = false): Configuration {
		const mergedConfig = webpackMerge.smartStrategy(mergeStrategies)(webpackConfig1, webpackConfig2);
		if(webpackConfig1.plugins && webpackConfig2.plugins) {
      const conf1ExceptConf2 = differenceWith(webpackConfig1.plugins, webpackConfig2.plugins, (item1, item2) => item1.constructor.name === item2.constructor.name);
      if(!replacePlugins){
        const conf1ByName = keyBy(webpackConfig1.plugins, 'constructor.name');
        webpackConfig2.plugins = webpackConfig2.plugins.map(p => merge(conf1ByName[p.constructor.name], p));
			}
      mergedConfig.plugins = [...conf1ExceptConf2, ...webpackConfig2.plugins];
    }
		return mergedConfig;
	}
}