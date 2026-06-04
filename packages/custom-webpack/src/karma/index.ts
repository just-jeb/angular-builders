/**
 * Created by Evgeny Barabanov on 05/10/2018.
 */

import { Builder, BuilderContext, createBuilder } from '@angular-devkit/architect';
import { executeKarmaBuilder, KarmaBuilderOptions } from '@angular-devkit/build-angular';
import { json } from '@angular-devkit/core';
import { customWebpackConfigTransformFactory } from '../transform-factories';
import { CustomWebpackSchema } from '../custom-webpack-schema';

export type CustomWebpackKarmaBuildSchema = KarmaBuilderOptions & CustomWebpackSchema;

export const buildCustomWebpackKarma = (
  options: CustomWebpackKarmaBuildSchema,
  context: BuilderContext
): ReturnType<typeof executeKarmaBuilder> =>
  executeKarmaBuilder(options, context, {
    webpackConfiguration: customWebpackConfigTransformFactory(options, context),
  });

// Explicit Builder<T> annotation (not inferred): some @angular-devkit dep trees nest a second
// copy of @angular-devkit/core under @angular-devkit/architect, making the inferred default
// export type non-portable (TS2742). Naming the type from @angular-devkit/architect avoids it.
const builder: Builder<json.JsonObject & CustomWebpackKarmaBuildSchema> = createBuilder<
  json.JsonObject & CustomWebpackKarmaBuildSchema
>(buildCustomWebpackKarma);
export default builder;
