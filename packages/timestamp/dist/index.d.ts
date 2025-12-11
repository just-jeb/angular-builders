import { SchemaObject as TimestampBuilderSchema } from './schema';
import { BuilderContext, BuilderOutput } from '@angular-devkit/architect';
import { Observable } from 'rxjs';
import { json } from '@angular-devkit/core';
export declare function createTimestamp({ path, format }: TimestampBuilderSchema, { workspaceRoot, logger }: BuilderContext): Observable<BuilderOutput>;
declare const _default: import("@angular-devkit/architect").Builder<json.JsonObject & TimestampBuilderSchema>;
export default _default;
