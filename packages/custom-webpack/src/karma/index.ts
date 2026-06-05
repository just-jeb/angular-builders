/**
 * Created by Evgeny Barabanov on 05/10/2018.
 */

import { BuilderContext, createBuilder } from '@angular-devkit/architect';
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

export default createBuilder<json.JsonObject & CustomWebpackKarmaBuildSchema>(
  buildCustomWebpackKarma
);
