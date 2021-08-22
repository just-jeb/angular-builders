import { BuilderContext } from '@angular-devkit/architect';
import { ExecutionTransformer } from '@angular-devkit/build-angular';
import { IndexHtmlTransform } from '@angular-devkit/build-angular/src/utils/index-file/index-html-generator';
import { getSystemPath, normalize } from '@angular-devkit/core';
import { Configuration } from 'webpack';
import { CustomWebpackBuilder } from './custom-webpack-builder';
import { CustomWebpackSchema } from './custom-webpack-schema';
import { tsNodeRegister } from './utils';

export type WebpackConfigurationTransform = ExecutionTransformer<Configuration>;

export type WebpackConfigurationTransformFactory = (
  options: CustomWebpackSchema,
  context: BuilderContext
) => WebpackConfigurationTransform;

export type IndexHtmlTransformFactory = (
  options: CustomWebpackSchema,
  context: BuilderContext
) => IndexHtmlTransform;

export type Transforms = {
  webpackConfiguration?: ExecutionTransformer<Configuration>;
  indexHtml?: IndexHtmlTransform;
};

export type TransformsFactory = (
  options: CustomWebpackSchema,
  context: BuilderContext,
  webpackConfigurationTransformFactory: WebpackConfigurationTransformFactory,
  indexHtmlTransformFactory: IndexHtmlTransformFactory
) => Transforms;

export const customWebpackConfigurationTransformFactory: WebpackConfigurationTransformFactory =
  (
    options: CustomWebpackSchema,
    { workspaceRoot, target }: BuilderContext
  ): WebpackConfigurationTransform =>
  (browserWebpackConfig: Configuration) => {
    return CustomWebpackBuilder.buildWebpackConfig(
      normalize(workspaceRoot),
      options.customWebpackConfig,
      browserWebpackConfig,
      options,
      target
    );
  };

export const indexHtmlTransformFactory: IndexHtmlTransformFactory = (
  { indexTransform, tsConfig }: CustomWebpackSchema,
  { workspaceRoot, target }: BuilderContext
): IndexHtmlTransform => {
  if (!indexTransform) return null;
  tsNodeRegister(indexTransform, `${getSystemPath(normalize(workspaceRoot))}/${tsConfig}`);
  const indexModule = require(`${getSystemPath(normalize(workspaceRoot))}/${indexTransform}`);
  const transform = indexModule.default || indexModule;
  return async (indexHtml: string) => transform(target, indexHtml);
};

export const transformsFactory: TransformsFactory = (
  options: CustomWebpackSchema,
  context: BuilderContext,
  webpackConfigurationTransformFactory: WebpackConfigurationTransformFactory,
  indexHtmlTransformFactory: IndexHtmlTransformFactory
): Transforms => ({
  webpackConfiguration: webpackConfigurationTransformFactory(options, context),
  indexHtml: indexHtmlTransformFactory(options, context),
});
