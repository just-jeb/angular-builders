import { Builder, BuilderContext, createBuilder } from '@angular-devkit/architect';
import { BrowserBuilderOptions, executeBrowserBuilder } from '@angular-devkit/build-angular';
import { json } from '@angular-devkit/core';
import { getTransforms } from '../transform-factories';
import { CustomWebpackSchema } from '../custom-webpack-schema';

export type CustomWebpackBrowserSchema = BrowserBuilderOptions & CustomWebpackSchema;

export const buildCustomWebpackBrowser = (
  options: CustomWebpackBrowserSchema,
  context: BuilderContext
): ReturnType<typeof executeBrowserBuilder> =>
  executeBrowserBuilder(options, context, getTransforms(options, context));

// Explicit Builder<T> annotation (not inferred): some @angular-devkit dep trees nest a second
// copy of @angular-devkit/core under @angular-devkit/architect, making the inferred default
// export type non-portable (TS2742). Naming the type from @angular-devkit/architect avoids it.
const builder: Builder<json.JsonObject & CustomWebpackBrowserSchema> = createBuilder<
  json.JsonObject & CustomWebpackBrowserSchema
>(buildCustomWebpackBrowser);
export default builder;
