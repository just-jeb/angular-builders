/**
 * Created by Evgeny Barabanov on 28/06/2018.
 */

import { Builder, BuilderContext, createBuilder } from '@angular-devkit/architect';
import { executeServerBuilder, ServerBuilderOptions } from '@angular-devkit/build-angular';
import { json } from '@angular-devkit/core';
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

// Explicit Builder<T> annotation (not inferred): some @angular-devkit dep trees nest a second
// copy of @angular-devkit/core under @angular-devkit/architect, making the inferred default
// export type non-portable (TS2742). Naming the type from @angular-devkit/architect avoids it.
const builder: Builder<json.JsonObject & CustomWebpackServerSchema> = createBuilder<
  json.JsonObject & CustomWebpackServerSchema
>(buildCustomWebpackServer);
export default builder;
