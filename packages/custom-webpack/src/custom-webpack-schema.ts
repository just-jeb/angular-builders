import {
  BrowserBuilderOptions as _BrowserBuilderOptions,
  DevServerBuilderOptions as _DevServerBuilderOptions,
  ExtractI18nBuilderOptions as _ExtractI18nBuilderOptions,
  KarmaBuilderOptions as _KarmaBuilderOptions,
  ServerBuilderOptions as _ServerBuilderOptions,
} from '@angular-devkit/build-angular';
import { CustomWebpackBuilderConfig } from './custom-webpack-builder-config';

export interface CustomWebpackSchema {
  customWebpackConfig: CustomWebpackBuilderConfig;
  indexTransform: string;
  tsConfig?: string;
}

export type BrowserBuilderOptions = _BrowserBuilderOptions & CustomWebpackSchema;
export type DevServerBuilderOptions = _DevServerBuilderOptions & CustomWebpackSchema;
export type ExtractI18nBuilderOptions = _ExtractI18nBuilderOptions & CustomWebpackSchema;
export type KarmaBuilderOptions = _KarmaBuilderOptions & CustomWebpackSchema;
export type ServerBuilderOptions = _ServerBuilderOptions & CustomWebpackSchema;
