import { Path } from '@angular-devkit/core';
import { JestConfig } from './types';
import { SchemaObject as JestBuilderSchema } from './schema';
export declare const testPattern = "/**/*(*.)@(spec|test).[tj]s?(x)";
export declare class DefaultConfigResolver {
    private options;
    readonly tsJestTransformRegExp = "^.+\\.(ts|js|mjs|html|svg)$";
    constructor(options: JestBuilderSchema);
    resolveGlobal(): JestConfig;
    resolveForProject(projectRoot: Path): JestConfig;
}
