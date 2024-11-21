import {
  BuilderContext,
  targetFromTargetString,
  BuilderHandlerFn,
} from '@angular-devkit/architect';
import { ExecutionTransformer } from '@angular-devkit/build-angular';
import type { IndexHtmlTransform } from '@angular/build/src/utils/index-file/index-html-generator';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Configuration } from 'webpack';
import { CustomWebpackSchema } from './custom-webpack-schema';
import { getTransforms } from './transform-factories';
import { json } from '@angular-devkit/core';

export interface BuildTargetOptions {
  buildTarget: string;
}

export type BuilderExecutor<O extends BuildTargetOptions & json.JsonObject> = (
  options: O,
  context: BuilderContext,
  transforms?: {
    webpackConfiguration?: ExecutionTransformer<Configuration>;
    indexHtml?: IndexHtmlTransform;
  }
) => any;

export const executeBrowserBasedBuilder =
  <O extends BuildTargetOptions & json.JsonObject>(
    executebBuilder: BuilderExecutor<O>
  ): BuilderHandlerFn<O> =>
  (options: O, context: BuilderContext): ReturnType<typeof executebBuilder> => {
    async function setup() {
      const browserTarget = targetFromTargetString(options.buildTarget);
      return context.getTargetOptions(browserTarget) as unknown as CustomWebpackSchema;
    }

    return from(setup()).pipe(
      switchMap(customWebpackOptions =>
        executebBuilder(options, context, getTransforms(customWebpackOptions, context))
      )
    );
  };
