import {CustomWebpackBuilderConfig} from "./custom-webpack-builder-config";
import {NormalizedBrowserBuilderSchema} from "@angular-devkit/build-angular";


export interface CustomWebpackSchema {
	customWebpackConfig: CustomWebpackBuilderConfig;
}

export interface NormalizedCustomWebpackBrowserBuildSchema extends NormalizedBrowserBuilderSchema, CustomWebpackSchema {}
