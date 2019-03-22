import { createBuilder } from '@angular-devkit/architect/src/index2';
import {BrowserConfigTransformFn, buildWebpackBrowser, buildWebpackConfig} from '@angular-devkit/build-angular/src/browser/index2';
import { Schema as BrowserBuilderSchema } from '@angular-devkit/build-angular/src/browser/schema';
import { BuilderContext, BuilderOutput } from '@angular-devkit/architect/src/index2';
import { NormalizedBrowserBuilderSchema } from '@angular-devkit/build-angular/src/utils';
import { json, logging, Path } from '@angular-devkit/core';
import {of, Observable} from 'rxjs';
import { CustomWebpackBuilder } from '../custom-webpack-builder';
import { CustomWebpackSchema } from '../custom-webpack-schema';

interface NormalizedCustomWebpackBrowserBuildSchema extends NormalizedBrowserBuilderSchema, CustomWebpackSchema {
}

export type CustomWebpackBrowserSchema = BrowserBuilderSchema & CustomWebpackSchema;

//TODO: externalize this function to eliminate dependency from dev-server
export const customWebpackConfigTransformFactory: (options: CustomWebpackBrowserSchema) => BrowserConfigTransformFn = (options) => ({root}, browserWebpackConfig ) => {
    return of(CustomWebpackBuilder.buildWebpackConfig(root, options.customWebpackConfig, browserWebpackConfig, options));
}

export function buildCustomWebpackBrowser(options: CustomWebpackBrowserSchema, context: BuilderContext): Observable<BuilderOutput> {
    return buildWebpackBrowser(options, context, {config: customWebpackConfigTransformFactory(options)});
}


export default createBuilder<json.JsonObject & CustomWebpackBrowserSchema>(buildCustomWebpackBrowser);
