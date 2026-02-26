import { Path, resolve } from '@angular-devkit/core';

import { JestConfig } from './types';
import { CustomConfigResolver } from './custom-config.resolver';
import { DefaultConfigResolver } from './default-config.resolver';

/**
 * A whitelist of property names that are meant to be concat.
 */
const ARRAY_PROPERTIES_TO_CONCAT = [
  // From Jest Config
  'setupFilesAfterEnv',
  // From ts-jest config
  'astTransformers',
];

type MergeCustomizer = (objValue: any, srcValue: any, key: string) => any;

/**
 * Deep merge two objects, invoking a customizer for each key.
 * If the customizer returns `undefined`, the default deep-merge behavior applies.
 */
function deepMergeWith(target: any, source: any, customizer: MergeCustomizer): any {
  if (source === undefined || source === null) {
    return target;
  }
  if (target === undefined || target === null) {
    return source;
  }
  const result = { ...target };
  for (const key of Object.keys(source)) {
    const customResult = customizer(result[key], source[key], key);
    if (customResult !== undefined) {
      result[key] = customResult;
    } else if (
      typeof result[key] === 'object' &&
      result[key] !== null &&
      !Array.isArray(result[key]) &&
      typeof source[key] === 'object' &&
      source[key] !== null &&
      !Array.isArray(source[key])
    ) {
      result[key] = deepMergeWith(result[key], source[key], customizer);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

/**
 * This function checks which properties should be concat. Returning `undefined`
 * falls through to the default deep-merge behavior.
 */
function concatArrayProperties(objValue: any, srcValue: unknown, property: string): any {
  if (!ARRAY_PROPERTIES_TO_CONCAT.includes(property)) {
    return undefined;
  }

  if (!Array.isArray(objValue)) {
    return deepMergeWith(objValue, srcValue, (obj, src) => {
      if (Array.isArray(obj)) {
        return obj.concat(src);
      }
      return undefined;
    });
  }

  return objValue.concat(srcValue);
}

const buildConfiguration = async (
  defaultConfigResolver: DefaultConfigResolver,
  customConfigResolver: CustomConfigResolver,
  projectRoot: Path,
  workspaceRoot: Path,
  config: string | JestConfig = 'jest.config.js'
) => {
  const globalDefaultConfig = defaultConfigResolver.resolveGlobal();
  const projectDefaultConfig = defaultConfigResolver.resolveForProject(projectRoot);
  const globalCustomConfig = await customConfigResolver.resolveGlobal(workspaceRoot);
  const projectCustomConfig = await customConfigResolver.resolveForProject(projectRoot, config);

  return [projectDefaultConfig, globalCustomConfig, projectCustomConfig].reduce(
    (acc, cfg) => deepMergeWith(acc, cfg, concatArrayProperties),
    globalDefaultConfig
  );
};

export class JestConfigurationBuilder {
  constructor(
    private defaultConfigResolver: DefaultConfigResolver,
    private customConfigResolver: CustomConfigResolver
  ) {}

  async buildConfiguration(
    projectRoot: Path,
    workspaceRoot: Path,
    config: string | JestConfig = 'jest.config.js'
  ): Promise<JestConfig> {
    const pathToProject: Path = resolve(workspaceRoot, projectRoot);

    return await buildConfiguration(
      this.defaultConfigResolver,
      this.customConfigResolver,
      pathToProject,
      workspaceRoot,
      config
    );
  }
}
