import type { mergeWithRules } from 'webpack-merge';
export type MergeRules = Parameters<typeof mergeWithRules>[0];
export interface CustomWebpackBuilderConfig {
    path?: string;
    mergeRules?: MergeRules;
    replaceDuplicatePlugins?: boolean;
    verbose?: {
        properties?: string[];
        serializationDepth?: number;
    };
}
