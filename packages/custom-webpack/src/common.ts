import { BuilderContext } from '@angular-devkit/architect';
import { ExecutionTransformer } from '@angular-devkit/build-angular';
import { IndexHtmlTransform } from '@angular-devkit/build-angular/src/angular-cli-files/utilities/index-file/write-index-html';
import { normalize, getSystemPath } from '@angular-devkit/core';

import { Configuration } from 'webpack';

import { CustomWebpackBuilder } from './custom-webpack-builder';
import { CustomWebpackSchema } from './custom-webpack-schema';
import { tsNodeRegister } from './utils';
import { CustomBuilderOptions } from './type-definition';

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
  options: CustomBuilderOptions,
  context: BuilderContext
) => IndexHtmlTransform = ({ indexTransform, tsConfig }, { workspaceRoot, target }) => {
  if (!indexTransform) return null;
  tsNodeRegister(indexTransform, workspaceRoot, tsConfig);
  const indexModule = require(`${getSystemPath(normalize(workspaceRoot))}/${indexTransform}`);
  const transform = indexModule.default || indexModule;
  return async (indexHtml: string) => transform(target, indexHtml);
};

export const getTransforms = (options: CustomBuilderOptions, context: BuilderContext) => ({
  webpackConfiguration: customWebpackConfigTransformFactory(options, context),
  indexHtml: indexHtmlTransformFactory(options, context),
});
