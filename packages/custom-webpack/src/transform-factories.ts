import * as path from 'node:path';
import { BuilderContext, Target } from '@angular-devkit/architect';
import { ExecutionTransformer } from '@angular-devkit/build-angular';
import type { IndexHtmlTransform } from '@angular/build/src/utils/index-file/index-html-generator';
import { getSystemPath, normalize } from '@angular-devkit/core';
import { Configuration } from 'webpack';
import { loadModule } from '@angular-builders/common';

import { CustomWebpackBuilder } from './custom-webpack-builder';
import { CustomWebpackSchema } from './custom-webpack-schema';

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
) => IndexHtmlTransform = (options, { workspaceRoot, target }) => {
  if (!options.indexTransform) return null;

  const transformPath = path.join(getSystemPath(normalize(workspaceRoot)), options.indexTransform);
  const tsConfig = path.join(getSystemPath(normalize(workspaceRoot)), options.tsConfig);

  return async (indexHtml: string) => {
    const transform = await loadModule<IndexHtmlTransformWithOptions>(transformPath, tsConfig);
    return transform(target, indexHtml);
  };
};

export const getTransforms = (options: CustomWebpackSchema, context: BuilderContext) => ({
  webpackConfiguration: customWebpackConfigTransformFactory(options, context),
  indexHtml: indexHtmlTransformFactory(options, context),
});
