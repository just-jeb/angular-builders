import { BuilderContext } from '@angular-devkit/architect';
import { BrowserBuilderOptions, executeBrowserBuilder } from '@angular-devkit/build-angular';
import { json } from '@angular-devkit/core';
import { CustomWebpackSchema } from '../custom-webpack-schema';
export type CustomWebpackBrowserSchema = BrowserBuilderOptions & CustomWebpackSchema;
export declare const buildCustomWebpackBrowser: (options: CustomWebpackBrowserSchema, context: BuilderContext) => ReturnType<typeof executeBrowserBuilder>;
declare const _default: import("@angular-devkit/architect").Builder<json.JsonObject & BrowserBuilderOptions & CustomWebpackSchema>;
export default _default;
