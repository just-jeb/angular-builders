import { Path } from '@angular-devkit/core';
import { SchemaObject as JestBuilderSchema } from './schema';
export declare const tsConfigName = "tsconfig.spec.json";
export declare function getTsConfigPath(projectRoot: Path, options: JestBuilderSchema): string;
