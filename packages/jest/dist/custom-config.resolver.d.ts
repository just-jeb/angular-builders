import { logging, Path } from '@angular-devkit/core';
import { JestConfig } from './types';
import { SchemaObject as JestBuilderSchema } from './schema';
export declare class CustomConfigResolver {
    private options;
    private logger;
    private allowedExtensions;
    constructor(options: JestBuilderSchema, logger: logging.LoggerApi);
    resolveGlobal(workspaceRoot: Path): Promise<JestConfig>;
    resolveForProject(projectRoot: Path, configPath: string): Promise<JestConfig>;
}
