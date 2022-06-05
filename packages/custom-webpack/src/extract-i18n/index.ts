import { createBuilder } from '@angular-devkit/architect';
import {
  executeExtractI18nBuilder,
  ExtractI18nBuilderOptions,
} from '@angular-devkit/build-angular';
import { json } from '@angular-devkit/core';
import { executeBrowserBasedBuilder } from '../generic-browser-builder';

export default createBuilder<ExtractI18nBuilderOptions & json.JsonObject>(
  executeBrowserBasedBuilder(executeExtractI18nBuilder)
);
