import {
  BuilderContext as Context,
  createBuilder,
  targetFromTargetString,
} from '@angular-devkit/architect';
import { DevServerBuilderOutput } from '@angular-devkit/build-angular';
import { from, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { DevServerBuilderOptions as Options } from '../custom-webpack-schema';
import { customWebpack, CustomWebpack } from '../custom-webpack';

function initialize(options: Options, context: Context): CustomWebpack {
  return customWebpack(options, context);
}

export function execute(options: Options, context: Context): Observable<DevServerBuilderOutput> {
  const target = targetFromTargetString(options.browserTarget);
  return from(context.getTargetOptions(target)).pipe(
    switchMap(options => initialize(options as Options, context).executeDevServerBuilder())
  );
}

export default createBuilder<Options>(execute);
