/**
 * Created by Evgeny Barabanov on 05/10/2018.
 */

import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { executeKarmaBuilder, KarmaBuilderOptions } from '@angular-devkit/build-angular';
import { json } from '@angular-devkit/core';
import { Observable } from 'rxjs';
import { customWebpackConfigTransformFactory } from '../common';
import { CustomWebpackSchema } from '../custom-webpack-schema';

export type CustomWebpackKarmaBuildSchema = KarmaBuilderOptions & CustomWebpackSchema;

export function buildCustomWebpackKarma(options: CustomWebpackKarmaBuildSchema, context: BuilderContext): Observable<BuilderOutput> {
  return executeKarmaBuilder(options, context, {
    webpackConfiguration: customWebpackConfigTransformFactory(options, context)
  });
}

export default createBuilder<json.JsonObject & CustomWebpackKarmaBuildSchema>(buildCustomWebpackKarma);
