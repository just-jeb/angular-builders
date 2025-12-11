import { BuilderContext } from '@angular-devkit/architect';
import { ExecutionTransformer } from '@angular-devkit/build-angular';
import type { IndexHtmlTransform } from '@angular/build/private';
import { Configuration } from 'webpack';
import { CustomWebpackSchema } from './custom-webpack-schema';
export declare const customWebpackConfigTransformFactory: (options: CustomWebpackSchema, context: BuilderContext) => ExecutionTransformer<Configuration>;
export declare const indexHtmlTransformFactory: (options: CustomWebpackSchema, context: BuilderContext) => IndexHtmlTransform;
export declare const getTransforms: (options: CustomWebpackSchema, context: BuilderContext) => {
    webpackConfiguration: ExecutionTransformer<Configuration>;
    indexHtml: IndexHtmlTransform;
};
