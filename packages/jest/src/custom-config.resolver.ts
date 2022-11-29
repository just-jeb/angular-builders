import { existsSync } from 'fs';
import { getSystemPath, join, logging, Path } from '@angular-devkit/core';

import { JestConfig } from './types';
import { SchemaObject as JestBuilderSchema } from './schema';
import { getTsConfigPath, loadModule, tsNodeRegister } from './utils';

export class CustomConfigResolver {
  // https://jestjs.io/docs/configuration
  private allowedExtensions = ['js', 'ts', 'mjs', 'cjs', 'json'];

  constructor(private options: JestBuilderSchema, private logger: logging.LoggerApi) {}

  async resolveGlobal(workspaceRoot: Path): Promise<JestConfig> {
    const packageJsonPath = getSystemPath(join(workspaceRoot, 'package.json'));
    const packageJson = require(packageJsonPath);

    if (packageJson.jest) {
      return packageJson.jest;
    }

    const tsConfig = getTsConfigPath(workspaceRoot, this.options);
    const workspaceJestConfigPaths = this.allowedExtensions.map(extension =>
      getSystemPath(join(workspaceRoot, `jest.config.${extension}`))
    );
    const workspaceJestConfigPath = workspaceJestConfigPaths.find(path => existsSync(path));

    return workspaceJestConfigPath
      ? await resolveJestConfig(workspaceJestConfigPath, tsConfig, this.logger)
      : {};
  }

  async resolveForProject(projectRoot: Path, configPath: string): Promise<JestConfig> {
    const jestConfigPath = getSystemPath(join(projectRoot, configPath));
    if (!existsSync(jestConfigPath)) {
      this.logger.warn(
        `warning: unable to locate custom jest configuration file at path "${jestConfigPath}"`
      );
      return {};
    }
    const tsConfig = getTsConfigPath(projectRoot, this.options);
    return await resolveJestConfig(jestConfigPath, tsConfig, this.logger);
  }
}

async function resolveJestConfig(
  jestConfigPath: string,
  tsConfig: string,
  logger: logging.LoggerApi
): Promise<JestConfig> {
  tsNodeRegister(jestConfigPath, tsConfig, logger);
  return await loadModule(jestConfigPath);
}
