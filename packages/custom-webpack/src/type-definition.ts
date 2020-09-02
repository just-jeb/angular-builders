import { Target } from '@angular-devkit/architect/src/input-schema';
import { json } from '@angular-devkit/core';

import { CustomWebpackBrowserSchema } from './browser';
import { CustomWebpackServerSchema } from './server';
import { CustomWebpackKarmaBuildSchema } from './karma';

export type TargetOptions = json.JsonObject & Target;

export type CustomBuilderOptions =
  | CustomWebpackBrowserSchema
  | CustomWebpackServerSchema
  | CustomWebpackKarmaBuildSchema;
