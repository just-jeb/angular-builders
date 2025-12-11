import { CustomWebpackBuilderConfig } from './custom-webpack-builder-config';
export interface CustomWebpackSchema {
    customWebpackConfig: CustomWebpackBuilderConfig;
    indexTransform: string;
    tsConfig?: string;
}
