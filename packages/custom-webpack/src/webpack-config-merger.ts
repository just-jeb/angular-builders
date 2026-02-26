import { MergeRules } from './custom-webpack-builder-config';
import { CustomizeRule, mergeWithRules } from 'webpack-merge';
import { Configuration } from 'webpack';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    value !== null && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype
  );
}

/**
 * Recursively deep-merges source into target, mutating target.
 * Arrays are replaced entirely (unlike lodash.merge which merges by index).
 * This is intentional for webpack plugin options where full replacement is the expected behavior.
 */
function deepMerge<T extends Record<string, any>>(target: T, source: Record<string, any>): T {
  for (const key of Object.keys(source)) {
    const targetVal = (target as any)[key];
    const sourceVal = source[key];
    if (isPlainObject(targetVal) && isPlainObject(sourceVal)) {
      deepMerge(targetVal, sourceVal);
    } else {
      (target as any)[key] = sourceVal;
    }
  }
  return target;
}

const DEFAULT_MERGE_RULES: MergeRules = {
  module: {
    rules: {
      test: CustomizeRule.Match,
      use: {
        loader: CustomizeRule.Match,
        options: CustomizeRule.Merge,
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
  const mergedConfig: Configuration = mergeWithRules(mergeRules)(webpackConfig1, webpackConfig2);

  if (webpackConfig1.plugins && webpackConfig2.plugins) {
    const conf1ExceptConf2 = webpackConfig1.plugins.filter(
      item1 =>
        !webpackConfig2.plugins!.some(item2 => item1.constructor.name === item2.constructor.name)
    );
    if (!replacePlugins) {
      const conf1ByName: Record<string, (typeof webpackConfig1.plugins)[number]> = {};
      for (const p of webpackConfig1.plugins) {
        conf1ByName[p.constructor.name] = p;
      }
      webpackConfig2.plugins = webpackConfig2.plugins.map(p => {
        const match = conf1ByName[p.constructor.name];
        return match ? deepMerge(match as any, p as any) : p;
      }) as typeof webpackConfig2.plugins;
    }
    mergedConfig.plugins = [...conf1ExceptConf2, ...webpackConfig2.plugins];
  }
  return mergedConfig;
}
