/**
 * Created by Evgeny Barabanov on 28/06/2018.
 */

import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { executeServerBuilder, ServerBuilderOptions } from '@angular-devkit/build-angular';
import { json } from '@angular-devkit/core';
import { Observable } from 'rxjs';
import { customWebpackConfigTransformFactory } from '../common';
import { CustomWebpackSchema } from '../custom-webpack-schema';

export type CustomWebpackServerSchema = ServerBuilderOptions & CustomWebpackSchema;

export function buildCustomWebpackServer(
  options: CustomWebpackServerSchema,
  context: BuilderContext
): Observable<BuilderOutput> {
  return executeServerBuilder(options, context, {
    webpackConfiguration: customWebpackConfigTransformFactory(options, context),
  });
}

export default createBuilder<json.JsonObject & CustomWebpackServerSchema>(buildCustomWebpackServer);
