import { createBuilder } from '@angular-devkit/architect';
import {
  executeExtractI18nBuilder,
  ExtractI18nBuilderOptions,
} from '@angular-devkit/build-angular';
import { json } from '@angular-devkit/core';
import { executeBrowserBasedBuilder } from '../generic-browser-builder';

type CustomWebpackI18nSchema = ExtractI18nBuilderOptions &
  json.JsonObject & { buildTarget: string };

export default createBuilder<CustomWebpackI18nSchema>(
  executeBrowserBasedBuilder(executeExtractI18nBuilder)
);
