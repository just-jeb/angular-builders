import { BuilderContext } from '@angular-devkit/architect';
import { normalize, getSystemPath } from '@angular-devkit/core';
import { Configuration } from 'webpack';
import { IndexHtmlTransform } from '@angular-devkit/build-angular/src/angular-cli-files/utilities/index-file/write-index-html';

import { createVerboseLogger } from './verbose-logger';
import { CustomWebpackBuilder } from './custom-webpack-builder';
import { CustomWebpackSchema } from './custom-webpack-schema';

export function customWebpackConfigTransformFactory(
  options: CustomWebpackSchema,
  context: BuilderContext
) {
  const verboseLogger = createVerboseLogger(options.customWebpackConfig.verbose, context.logger);

  return (browserWebpackConfig: Configuration) =>
    CustomWebpackBuilder.buildWebpackConfig(
      normalize(context.workspaceRoot),
      options.customWebpackConfig,
      browserWebpackConfig,
      options, //TODO: pass Target options as well (configuration option in particular),
      verboseLogger
    );
}

export const indexHtmlTransformFactory: (
  options: CustomWebpackSchema,
  context: BuilderContext
) => IndexHtmlTransform = ({ indexTransform }, { workspaceRoot, target }) => {
  if (!indexTransform) return null;
  const transform = require(`${getSystemPath(normalize(workspaceRoot))}/${indexTransform}`);
  return async (indexHtml: string) => transform(target, indexHtml);
};

export const getTransforms = (options: CustomWebpackSchema, context: BuilderContext) => ({
  webpackConfiguration: customWebpackConfigTransformFactory(options, context),
  indexHtml: indexHtmlTransformFactory(options, context),
});
