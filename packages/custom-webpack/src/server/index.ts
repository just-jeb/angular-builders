/**
 * Created by Evgeny Barabanov on 28/06/2018.
 */

import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { executeServerBuilder, ServerBuilderOptions } from '@angular-devkit/build-angular';
import { json } from '@angular-devkit/core';
import { Observable } from 'rxjs';
import { customWebpackConfigTransformFactory } from '../transform-factories';
import { CustomWebpackSchema } from '../custom-webpack-schema';

export type CustomWebpackServerSchema = ServerBuilderOptions & CustomWebpackSchema;

export const buildCustomWebpackServer = (
  options: CustomWebpackServerSchema,
  context: BuilderContext
): ReturnType<typeof executeServerBuilder> =>
  executeServerBuilder(options, context, {
    webpackConfiguration: customWebpackConfigTransformFactory(options, context),
  });

export default createBuilder<json.JsonObject & CustomWebpackServerSchema>(buildCustomWebpackServer);
