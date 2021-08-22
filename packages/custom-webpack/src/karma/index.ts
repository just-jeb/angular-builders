import { BuilderContext as Context, createBuilder } from '@angular-devkit/architect';
import { executeKarmaBuilder } from '@angular-devkit/build-angular';
import { KarmaBuilderOptions as Options } from '../custom-webpack-schema';
import { customWebpack, CustomWebpack } from '../custom-webpack';

function initialize(options: Options, context: Context): CustomWebpack {
  return customWebpack(options, context);
}

export function execute(
  options: Options,
  context: Context
): ReturnType<typeof executeKarmaBuilder> {
  return initialize(options, context).executeKarmaBuilder();
}

export default createBuilder<Options>(execute);
