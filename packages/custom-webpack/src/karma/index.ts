/**
 * Created by Evgeny Barabanov on 05/10/2018.
 */

import { BuilderContext, BuilderOutput } from '@angular-devkit/architect';
import { createBuilder } from '@angular-devkit/architect/src/index';
import { execute, KarmaBuilderOptions } from '@angular-devkit/build-angular/src/karma';
import { json, normalize, Path } from '@angular-devkit/core';
import { Observable } from 'rxjs';
import { CustomWebpackBuilder } from '../custom-webpack-builder';
import { CustomWebpackSchema } from '../custom-webpack-schema';
import {Configuration} from 'webpack';


export interface CustomWebpackKarmaBuildSchema extends KarmaBuilderOptions, CustomWebpackSchema {
}

const webpackConfigTransformerFnFactory = (options: CustomWebpackSchema, root: Path) => (originalConfig: Configuration) => {
  return CustomWebpackBuilder.buildWebpackConfig(root, options.customWebpackConfig, originalConfig, options);
}

export function buildCustomWebpackKarma(options: CustomWebpackKarmaBuildSchema, context: BuilderContext): Observable<BuilderOutput> {
  return execute(options, context, {webpackConfiguration: webpackConfigTransformerFnFactory(options, normalize(context.workspaceRoot))/*TODO: use customWebpackConfigTransformFactory(options) once Observable returned by transformer */});
}

export default createBuilder<json.JsonObject & CustomWebpackKarmaBuildSchema>(buildCustomWebpackKarma);
