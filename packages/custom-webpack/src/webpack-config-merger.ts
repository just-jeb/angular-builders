import { MergeRules } from './custom-webpack-builder-config';
import { CustomizeRule, mergeWithRules, merge as webpackMerge } from 'webpack-merge';
import { Configuration } from 'webpack';
import { differenceWith, keyBy, merge } from 'lodash';

const DEFAULT_MERGE_RULES: MergeRules = {
  module: {
    rules: {
      test: CustomizeRule.Match,
      use: {
        loader: CustomizeRule.Match,
        options: CustomizeRule.Append,
      },
    },
  },
};

export function mergeConfigs(
  webpackConfig1: Configuration,
  webpackConfig2: Configuration,
  mergeRules: MergeRules = DEFAULT_MERGE_RULES,
  replacePlugins = false
): Configuration {
  //default in smartStrategy is append
  const mergedConfig: Configuration = mergeRules
    ? mergeWithRules(mergeRules)(webpackConfig1, webpackConfig2)
    : webpackMerge(webpackConfig1, webpackConfig2);
  if (webpackConfig1.plugins && webpackConfig2.plugins) {
    const conf1ExceptConf2 = differenceWith(
      webpackConfig1.plugins,
      webpackConfig2.plugins,
      (item1, item2) => item1.constructor.name === item2.constructor.name
    );
    if (!replacePlugins) {
      const conf1ByName = keyBy(webpackConfig1.plugins, 'constructor.name');
      webpackConfig2.plugins = webpackConfig2.plugins.map(p =>
        conf1ByName[p.constructor.name] ? merge(conf1ByName[p.constructor.name], p) : p
      );
    }
    mergedConfig.plugins = [...conf1ExceptConf2, ...webpackConfig2.plugins];
  }
  return mergedConfig;
}
