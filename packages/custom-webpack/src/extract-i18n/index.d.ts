/**
 * Created by Pat Nolan on 10/05/2019.
 */
import { BuilderContext } from '@angular-devkit/architect';
import { ExtractI18nBuilder, NormalizedBrowserBuilderSchema } from '@angular-devkit/build-angular';
import { Path } from '@angular-devkit/core';
import { CustomWebpackSchema } from "../custom-webpack-schema";
import { Configuration } from "webpack";
export interface NormalizedCustomWebpackExtractI18nBuildSchema extends NormalizedBrowserBuilderSchema, CustomWebpackSchema {
}
export declare class CustomWebpackExtractI18nBuilder extends ExtractI18nBuilder {
    constructor(context: BuilderContext);
    buildWebpackConfig(root: Path, projectRoot: Path, options: NormalizedCustomWebpackExtractI18nBuildSchema): Configuration;
}
export default CustomWebpackExtractI18nBuilder;
