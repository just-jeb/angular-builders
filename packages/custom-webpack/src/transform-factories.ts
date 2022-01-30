import { BuilderContext, Target } from '@angular-devkit/architect';
import { ExecutionTransformer } from '@angular-devkit/build-angular';
import { IndexHtmlTransform } from '@angular-devkit/build-angular/src/utils/index-file/index-html-generator';
import { getSystemPath, normalize } from '@angular-devkit/core';
import { Configuration } from 'webpack';
import { CustomWebpackBuilder } from './custom-webpack-builder';
import { CustomWebpackSchema } from './custom-webpack-schema';
import { loadModule, tsNodeRegister } from './utils';

interface IndexHtmlTransformWithOptions {
  (options: Target, indexHtml: string): Promise<string>;
}

export const customWebpackConfigTransformFactory: (
  options: CustomWebpackSchema,
  context: BuilderContext
) => ExecutionTransformer<Configuration> =
  (options, { workspaceRoot, target, logger }) =>
  browserWebpackConfig => {
    return CustomWebpackBuilder.buildWebpackConfig(
      normalize(workspaceRoot),
      options.customWebpackConfig,
      browserWebpackConfig,
      options,
      target,
      logger
    );
  };

export const indexHtmlTransformFactory: (
  options: CustomWebpackSchema,
  context: BuilderContext
) => IndexHtmlTransform = ({ indexTransform, tsConfig }, { workspaceRoot, target, logger }) => {
  if (!indexTransform) return null;
  tsNodeRegister(indexTransform, `${getSystemPath(normalize(workspaceRoot))}/${tsConfig}`, logger);

  return async (indexHtml: string) => {
    const transform = await loadModule<IndexHtmlTransformWithOptions>(
      `${getSystemPath(normalize(workspaceRoot))}/${indexTransform}`
    );
    return transform(target, indexHtml);
  };
};

export const getTransforms = (options: CustomWebpackSchema, context: BuilderContext) => ({
  webpackConfiguration: customWebpackConfigTransformFactory(options, context),
  indexHtml: indexHtmlTransformFactory(options, context),
});
