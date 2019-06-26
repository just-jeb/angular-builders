import { Path, resolve } from "@angular-devkit/core";
import { mergeWith } from 'lodash';
import { CustomConfigResolver } from "./custom-config.resolver";
import { DefaultConfigResolver } from "./default-config.resolver";

/**
 * A whitelist of property names that are meant to be concat.
 */
const ARRAY_PROPERTIES_TO_CONCAT = [
  // From Jest Config
  'setupFilesAfterEnv',
  // From ts-jest config
  'astTransformers'
];

/**
 * This function checks witch properties should be concat. Early return will
 * merge the data as lodash#merge would do it. 
 */
function concatArrayProperties(objValue: unknown, srcValue: unknown, property: string) {
  if (!ARRAY_PROPERTIES_TO_CONCAT.includes(property) || !Array.isArray(objValue)) {
    return;
  }

  if (!Array.isArray(srcValue)) {
    throw new TypeError(`Expected ${property} to be an array. Instead got ${typeof property}`);
  }

  return objValue.concat(srcValue);
}

export const buildConfiguration = (defaultConfigResolver: DefaultConfigResolver,
  customConfigResolver: CustomConfigResolver) => 
  (projectRoot: Path,workspaceRoot: Path, configPath: string = 'jest.config.js') => {
    const globalDefaultConfig = defaultConfigResolver.resolveGlobal();
    const projectDefaultConfig = defaultConfigResolver.resolveForProject(projectRoot);
    const globalCustomConfig = customConfigResolver.resolveGlobal(workspaceRoot);
    const projectCustomConfig = customConfigResolver.resolveForProject(projectRoot, configPath);
    
    return mergeWith(globalDefaultConfig, projectDefaultConfig, globalCustomConfig, projectCustomConfig, concatArrayProperties);
}

export class JestConfigurationBuilder {

  constructor(private defaultConfigResolver: DefaultConfigResolver,
              private customConfigResolver: CustomConfigResolver) {
  }

  buildConfiguration(projectRoot: Path, workspaceRoot: Path, configPath: string = 'jest.config.js'): any {
    const pathToProject: Path = resolve(workspaceRoot, projectRoot);

    return buildConfiguration(this.defaultConfigResolver, this.customConfigResolver)(pathToProject, workspaceRoot, configPath);
  }


}