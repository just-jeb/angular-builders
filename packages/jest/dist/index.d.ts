import { BuilderContext, BuilderOutput } from '@angular-devkit/architect';
import { Path, json } from '@angular-devkit/core';
import { Observable } from 'rxjs';
import { SchemaObject as JestBuilderSchema } from './schema';
export declare function getRoots(context: BuilderContext): Promise<{
    workspaceRoot: Path;
    projectRoot: Path;
}>;
export declare function runJest(options: JestBuilderSchema, context: BuilderContext): Observable<BuilderOutput>;
declare const _default: import("@angular-devkit/architect").Builder<JestBuilderSchema & json.JsonObject>;
export default _default;
