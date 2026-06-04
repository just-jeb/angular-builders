import { Builder, createBuilder } from '@angular-devkit/architect';
import {
  executeExtractI18nBuilder,
  ExtractI18nBuilderOptions,
} from '@angular-devkit/build-angular';
import { json } from '@angular-devkit/core';
import { executeBrowserBasedBuilder } from '../generic-browser-builder';

type CustomWebpackI18nSchema = ExtractI18nBuilderOptions &
  json.JsonObject & { buildTarget: string };

// Explicit Builder<T> annotation (not inferred): some @angular-devkit dep trees nest a second
// copy of @angular-devkit/core under @angular-devkit/architect, making the inferred default
// export type non-portable (TS2742). Naming the type from @angular-devkit/architect avoids it.
const builder: Builder<CustomWebpackI18nSchema> = createBuilder<CustomWebpackI18nSchema>(
  executeBrowserBasedBuilder(executeExtractI18nBuilder)
);
export default builder;
