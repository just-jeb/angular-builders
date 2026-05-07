import { Path, resolve } from '@angular-devkit/core';
import { isArray, mergeWith } from 'lodash';

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

/**
 * This function checks witch properties should be concat. Early return will
 * merge the data as lodash#merge would do it.
 */
function concatArrayProperties(objValue: any[], srcValue: unknown, property: string) {
  if (!ARRAY_PROPERTIES_TO_CONCAT.includes(property)) {
    return;
  }

  if (!isArray(objValue)) {
    return mergeWith(objValue, srcValue, (obj, src) => {
      if (isArray(obj)) {
        return obj.concat(src);
      }
    });
  }

  return objValue.concat(srcValue);
}

/**
 * Scope output directories per project in multi-project mode.
 * When a jest.config.js has a 'projects' array, each project should have its own
 * coverageDirectory, coveragePathIgnorePatterns, and other output paths to prevent
 * projects from overwriting each other's outputs.
 * 
 * This works by:
 * 1. Converting each project string path to a config object with { preset: projectPath }
 * 2. Adding scoped output directories (e.g., coverageDirectory/projectName)
 * 3. Removing the global output directory settings
 */
function scopeOutputDirectoriesForProjects(config: JestConfig): JestConfig {
  if (!config.projects || !Array.isArray(config.projects) || config.projects.length === 0) {
    return config;
  }

  console.log('[DEBUG] scopeOutputDirectoriesForProjects: Found projects array', config.projects.length);

  const scopedProjects = config.projects.map((project: any) => {
    // If project is already a config object (has preset, setupFilesAfterEnv, etc.), keep it
    if (typeof project !== 'string') {
      console.log('[DEBUG] Project is already a config object, keeping as-is');
      return project;
    }

    // For string project paths, convert to config object and scope outputs
    // Extract project name from path (e.g., 'projects/my-app' -> 'my-app')
    const projectName = project.split('/').pop() || project;

    const scopedConfig: any = { preset: project };

    // Scope coverage directory by appending project name
    if (config.coverageDirectory) {
      scopedConfig.coverageDirectory = `${config.coverageDirectory}/${projectName}`;
      console.log(`[DEBUG] Scoped coverage dir for project "${projectName}": ${scopedConfig.coverageDirectory}`);
    }

    return scopedConfig;
  });

  // Return a new config with scoped projects
  const result: any = {
    ...config,
    projects: scopedProjects,
  };

  // Remove global output dir settings since they're now scoped per project
  if (config.coverageDirectory) {
    delete result.coverageDirectory;
    console.log('[DEBUG] Removed global coverageDirectory');
  }

  console.log('[DEBUG] Final scoped config:', JSON.stringify(result, null, 2));

  return result;
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

  const mergedConfig = mergeWith(
    globalDefaultConfig,
    projectDefaultConfig,
    globalCustomConfig,
    projectCustomConfig,
    concatArrayProperties
  );

  console.log('[DEBUG] Merged config before scoping:', JSON.stringify(mergedConfig, null, 2));
  const result = scopeOutputDirectoriesForProjects(mergedConfig);
  console.log('[DEBUG] After scoping:', JSON.stringify(result, null, 2));
  return result;
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
