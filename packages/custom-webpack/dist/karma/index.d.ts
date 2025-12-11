/**
 * Created by Evgeny Barabanov on 05/10/2018.
 */
import { BuilderContext } from '@angular-devkit/architect';
import { executeKarmaBuilder, KarmaBuilderOptions } from '@angular-devkit/build-angular';
import { json } from '@angular-devkit/core';
import { CustomWebpackSchema } from '../custom-webpack-schema';
export type CustomWebpackKarmaBuildSchema = KarmaBuilderOptions & CustomWebpackSchema;
export declare const buildCustomWebpackKarma: (options: CustomWebpackKarmaBuildSchema, context: BuilderContext) => ReturnType<typeof executeKarmaBuilder>;
declare const _default: import("@angular-devkit/architect").Builder<json.JsonObject & KarmaBuilderOptions & CustomWebpackSchema>;
export default _default;
