import { BuilderContext, createBuilder, targetFromTargetString } from '@angular-devkit/architect';
import {
  DevServerBuilderOptions,
  DevServerBuilderOutput,
  executeDevServerBuilder,
} from '@angular-devkit/build-angular';
import { from, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { getTransforms } from '../common';
import { CustomWebpackSchema } from '../custom-webpack-schema';

export const serveCustomWebpackBrowser = (
  options: DevServerBuilderOptions,
  context: BuilderContext
): Observable<DevServerBuilderOutput> => {
  async function setup() {
    const browserTarget = targetFromTargetString(options.browserTarget);
    return (context.getTargetOptions(browserTarget) as unknown) as CustomWebpackSchema;
  }

  return from(setup()).pipe(
    switchMap(customWebpackOptions =>
      executeDevServerBuilder(options, context, getTransforms(customWebpackOptions, context))
    )
  );
};

export default createBuilder<DevServerBuilderOptions, DevServerBuilderOutput>(
  serveCustomWebpackBrowser
);
