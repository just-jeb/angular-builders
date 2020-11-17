import { BuilderContext } from '@angular-devkit/architect';
import { ExecutionTransformer } from '@angular-devkit/build-angular';
import { IndexHtmlTransform } from '@angular-devkit/build-angular/src/utils/index-file/write-index-html';
import { getSystemPath, normalize } from '@angular-devkit/core';
import { Configuration } from 'webpack';
import { CustomWebpackBuilder } from './custom-webpack-builder';
import { CustomWebpackSchema } from './custom-webpack-schema';
import { tsNodeRegister } from './utils';

export const customWebpackConfigTransformFactory: (
  options: CustomWebpackSchema,
  context: BuilderContext
) => ExecutionTransformer<Configuration> = (
  options,
  { workspaceRoot, target }
) => browserWebpackConfig => {
  return CustomWebpackBuilder.buildWebpackConfig(
    normalize(workspaceRoot),
    options.customWebpackConfig,
    browserWebpackConfig,
    options,
    target
  );
};

export const indexHtmlTransformFactory: (
  options: CustomWebpackSchema,
  context: BuilderContext
) => IndexHtmlTransform = ({ indexTransform }, { workspaceRoot, target }) => {
  if (!indexTransform) return null;
  tsNodeRegister(indexTransform);
  const indexModule = require(`${getSystemPath(normalize(workspaceRoot))}/${indexTransform}`);
  const transform = indexModule.default || indexModule;
  return async (indexHtml: string) => transform(target, indexHtml);
};

export const getTransforms = (options: CustomWebpackSchema, context: BuilderContext) => ({
  webpackConfiguration: customWebpackConfigTransformFactory(options, context),
  indexHtml: indexHtmlTransformFactory(options, context),
});
