import { createBuilder } from '@angular-devkit/architect';
import {
  executeExtractI18nBuilder,
  ExtractI18nBuilderOptions,
} from '@angular-devkit/build-angular';
import { executeBrowserBasedBuilder } from '../generic-browser-builder';

export default createBuilder<ExtractI18nBuilderOptions>(
  executeBrowserBasedBuilder(executeExtractI18nBuilder)
);
