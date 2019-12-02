import { MergeStrategy } from 'webpack-merge';

export type MergeStrategies = { [field: string]: MergeStrategy };

export interface CustomWebpackBuilderConfig {
  path?: string;
  mergeStrategies?: MergeStrategies;
  replaceDuplicatePlugins?: boolean;
  verbose?: CustomWebpackBuilderVerboseConfig;
}

export interface CustomWebpackBuilderVerboseConfig {
  properties?: string | string[];
  serializationDepth: number;
}
