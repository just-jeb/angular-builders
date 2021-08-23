import { BuilderContext as Context, createBuilder } from '@angular-devkit/architect';
import { executeBrowserBuilder } from '@angular-devkit/build-angular';
import { customWebpack, CustomWebpack } from '../custom-webpack';
import { BrowserBuilderOptions as Options } from '../custom-webpack-schema';
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
): ReturnType<typeof executeBrowserBuilder> {
  return initialize(options, context).executeBrowserBuilder();
}

export default createBuilder<Options>(execute);
