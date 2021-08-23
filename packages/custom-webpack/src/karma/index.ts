import { BuilderContext as Context, createBuilder } from '@angular-devkit/architect';
import { executeKarmaBuilder } from '@angular-devkit/build-angular';
import { KarmaBuilderOptions as Options } from '../custom-webpack-schema';
import { customWebpack, CustomWebpack } from '../custom-webpack';
import { BUILD_CONTEXT_TOKEN, CUSTOM_WEBPACK_SCHEMA_TOKEN } from '../transform-factories.di';

function initialize(options: Options, context: Context): CustomWebpack {
  return customWebpack().withProviders([
    { provide: CUSTOM_WEBPACK_SCHEMA_TOKEN, useValue: options },
    { provide: BUILD_CONTEXT_TOKEN, useValue: context },
  ]);
}

export function execute(
  options: Options,
  context: Context
): ReturnType<typeof executeKarmaBuilder> {
  return initialize(options, context).executeKarmaBuilder();
}

export default createBuilder<Options>(execute);
