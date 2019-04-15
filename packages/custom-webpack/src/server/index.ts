/**
 * Created by Evgeny Barabanov on 28/06/2018.
 */

import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { Schema as BuildWebpackServerSchema } from '@angular-devkit/build-angular/src/server/schema';
import { json } from '@angular-devkit/core';
import { Observable, throwError } from 'rxjs';
import { CustomWebpackSchema } from "../custom-webpack-schema";

export interface CustomWebpackServerSchema extends BuildWebpackServerSchema, CustomWebpackSchema {
}

export function buildCustomWebpackServer(options: CustomWebpackServerSchema, context: BuilderContext): Observable<BuilderOutput | never> {
    return throwError('Not implemented');
}

export default createBuilder<json.JsonObject & CustomWebpackServerSchema>(buildCustomWebpackServer);
