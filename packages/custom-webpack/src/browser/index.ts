import { BuilderContext as Context, createBuilder } from '@angular-devkit/architect';
import { executeBrowserBuilder } from '@angular-devkit/build-angular';
import { customWebpack, CustomWebpack } from '../custom-webpack';
import { BrowserBuilderOptions as Options } from '../custom-webpack-schema';

function initialize(options: Options, context: Context): CustomWebpack {
  return customWebpack(options, context);
}

export function execute(
  options: Options,
  context: Context
): ReturnType<typeof executeBrowserBuilder> {
  return initialize(options, context).executeBrowserBuilder();
}

export default createBuilder<Options>(execute);
