import { BuilderContext } from '@angular-devkit/architect';
import { ExecutionTransformer } from '@angular-devkit/build-angular';
import { normalize, getSystemPath } from '@angular-devkit/core';
import { Configuration } from 'webpack';
import { CustomWebpackBuilder } from './custom-webpack-builder';
import { CustomWebpackSchema } from './custom-webpack-schema';
import { IndexHtmlTransform } from '@angular-devkit/build-angular/src/angular-cli-files/utilities/index-file/write-index-html';

export const customWebpackConfigTransformFactory: (
  options: CustomWebpackSchema,
  context: BuilderContext
) => ExecutionTransformer<Configuration> = (options, { workspaceRoot }) => browserWebpackConfig => {
  return CustomWebpackBuilder.buildWebpackConfig(
    normalize(workspaceRoot),
    options.customWebpackConfig,
    browserWebpackConfig,
    options //TODO: pass Target options as well (configuration option in particular)
  );
};

export const indexHtmlTransformFactory: (
  options: CustomWebpackSchema,
  context: BuilderContext
) => IndexHtmlTransform = ({ indexTransform }, { workspaceRoot, target }) => {
  if (!indexTransform) return null;
  if (indexTransform.endsWith('.ts')) {
    // Register TS compiler lazily
    require('ts-node').register({
      compilerOptions: {
        module: 'commonjs',
      },
    });
  }
  const transform = require(`${getSystemPath(normalize(workspaceRoot))}/${indexTransform}`);
  return async (indexHtml: string) => transform(target, indexHtml);
};

export const getTransforms = (options: CustomWebpackSchema, context: BuilderContext) => ({
  webpackConfiguration: customWebpackConfigTransformFactory(options, context),
  indexHtml: indexHtmlTransformFactory(options, context),
});
