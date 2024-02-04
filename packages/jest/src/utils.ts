import { getSystemPath, join, Path } from '@angular-devkit/core';
import { SchemaObject as JestBuilderSchema } from './schema';

export const tsConfigName = 'tsconfig.spec.json';
export function getTsConfigPath(projectRoot: Path, options: JestBuilderSchema) {
  return getSystemPath(join(projectRoot, options.tsConfig || tsConfigName));
}
