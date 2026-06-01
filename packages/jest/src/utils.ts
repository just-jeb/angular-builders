import { getSystemPath, join, Path } from '@angular-devkit/core';
import { SchemaObject as JestBuilderSchema } from './schema';
import * as jestRunnerSchema from './schema.json';

export const tsConfigName = 'tsconfig.spec.json';

// The default jest config path, sourced from the builder schema so it can never
// drift from the value Angular materializes for an unset `config` option. See #1102.
export const DEFAULT_JEST_CONFIG = jestRunnerSchema.properties.config.default;
export function getTsConfigPath(projectRoot: Path, options: JestBuilderSchema) {
  return getSystemPath(join(projectRoot, options.tsConfig || tsConfigName));
}
