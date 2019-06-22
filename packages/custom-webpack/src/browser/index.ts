import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { executeBrowserBuilder, BrowserBuilderOptions } from '@angular-devkit/build-angular';
import { json } from '@angular-devkit/core';
import { Observable } from 'rxjs';
import { customWebpackConfigTransformFactory, indexHtmlTransformFactory, getTransforms } from '../common';
import { CustomWebpackSchema } from '../custom-webpack-schema';

export type CustomWebpackBrowserSchema = BrowserBuilderOptions & CustomWebpackSchema;

export function buildCustomWebpackBrowser(options: CustomWebpackBrowserSchema, context: BuilderContext): Observable<BuilderOutput> {
    return executeBrowserBuilder(options, context, getTransforms(options, context));
}

export default createBuilder<json.JsonObject & CustomWebpackBrowserSchema>(buildCustomWebpackBrowser);
