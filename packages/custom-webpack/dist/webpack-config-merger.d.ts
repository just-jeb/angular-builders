import { MergeRules } from './custom-webpack-builder-config';
import { Configuration } from 'webpack';
export declare function mergeConfigs(webpackConfig1: Configuration, webpackConfig2: Configuration, mergeRules?: MergeRules, replacePlugins?: boolean): Configuration;
