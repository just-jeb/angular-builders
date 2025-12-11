/**
 * Created by Evgeny Barabanov on 28/06/2018.
 */
import { BuilderContext } from '@angular-devkit/architect';
import { executeServerBuilder, ServerBuilderOptions } from '@angular-devkit/build-angular';
import { json } from '@angular-devkit/core';
import { CustomWebpackSchema } from '../custom-webpack-schema';
export type CustomWebpackServerSchema = ServerBuilderOptions & CustomWebpackSchema;
export declare const buildCustomWebpackServer: (options: CustomWebpackServerSchema, context: BuilderContext) => ReturnType<typeof executeServerBuilder>;
declare const _default: import("@angular-devkit/architect").Builder<json.JsonObject & ServerBuilderOptions & CustomWebpackSchema>;
export default _default;
