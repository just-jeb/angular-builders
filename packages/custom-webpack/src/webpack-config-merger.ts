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

/**
 * Returns true if a plugin has a meaningful, unique class name that can be used
 * as a deduplication key. Plain object plugins (constructor.name === 'Object')
 * cannot be reliably identified as duplicates of another plugin, so they must
 * never be merged or deduplicated against other plugins.
 *
 * Concretely, Angular CLI injects anonymous plain-object plugins (e.g. the i18n
 * hash-update plugin added in angular/angular-cli#16817) into the base webpack
 * config. If those were matched against a user's plain-object plugin, the Angular
 * plugin would be silently dropped or corrupted, breaking features like localized
 * build hash regeneration.
 */
function isNamedPlugin(plugin: any): boolean {
  return (
    plugin != null &&
    typeof plugin.constructor === 'function' &&
    typeof plugin.constructor.name === 'string' &&
    plugin.constructor.name !== '' &&
    plugin.constructor.name !== 'Object'
  );
}

export function mergeConfigs(
  webpackConfig1: Configuration,
  webpackConfig2: Configuration,
  mergeRules: MergeRules = DEFAULT_MERGE_RULES,
  replacePlugins = false
): Configuration {
  const mergedConfig: Configuration = mergeWithRules(mergeRules)(webpackConfig1, webpackConfig2);

  if (webpackConfig1.plugins && webpackConfig2.plugins) {
    // Only named (class-based) plugins from conf1 participate in deduplication.
    // Anonymous plain-object plugins (constructor.name === 'Object') are always
    // treated as unique and prepended as-is — they cannot be identified as
    // duplicates of user plugins.
    const namedConf1Plugins = webpackConfig1.plugins.filter(isNamedPlugin);
    const anonymousConf1Plugins = webpackConfig1.plugins.filter(p => !isNamedPlugin(p));

    const namedConf1ExceptConf2 = namedConf1Plugins.filter(
      item1 =>
        !webpackConfig2.plugins!.some(item2 => item1.constructor.name === item2.constructor.name)
    );
    if (!replacePlugins) {
      const conf1ByName: Record<string, (typeof namedConf1Plugins)[number]> = {};
      for (const p of namedConf1Plugins) {
        conf1ByName[p.constructor.name] = p;
      }
      webpackConfig2.plugins = webpackConfig2.plugins.map(p => {
        const match = isNamedPlugin(p) && conf1ByName[p.constructor.name];
        return match ? deepMerge(match as any, p as any) : p;
      }) as typeof webpackConfig2.plugins;
    }
    mergedConfig.plugins = [
      ...anonymousConf1Plugins,
      ...namedConf1ExceptConf2,
      ...webpackConfig2.plugins,
    ];
  }
  return mergedConfig;
}
