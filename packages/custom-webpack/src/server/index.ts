import { BuilderContext as Context, createBuilder } from '@angular-devkit/architect';
import { executeServerBuilder } from '@angular-devkit/build-angular';
import { customWebpack, CustomWebpack } from '../custom-webpack';
import { ServerBuilderOptions as Options } from '../custom-webpack-schema';

function initialize(options: Options, context: Context): CustomWebpack {
  return customWebpack(options, context);
}

export function execute(
  options: Options,
  context: Context
): ReturnType<typeof executeServerBuilder> {
  return initialize(options, context).executeServerBuilder();
}

export default createBuilder<Options>(execute);
