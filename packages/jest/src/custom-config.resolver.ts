import { existsSync } from 'fs';
import { getSystemPath, join, logging, Path } from '@angular-devkit/core';
import { loadModule } from '@angular-builders/common';

import { JestConfig } from './types';
import { SchemaObject as JestBuilderSchema } from './schema';
import { getTsConfigPath } from './utils';

export class CustomConfigResolver {
  // https://jestjs.io/docs/configuration
  private allowedExtensions = ['js', 'ts', 'mjs', 'cjs', 'json'];

  constructor(
    private options: JestBuilderSchema,
    private logger: logging.LoggerApi
  ) {}

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

    if (!workspaceJestConfigPath) {
      return {};
    }

    return await loadModule<JestConfig>(workspaceJestConfigPath, tsConfig, this.logger);
  }

  async resolveForProject(projectRoot: Path, config: string | JestConfig): Promise<JestConfig> {
    // If config is already an object (from angular.json), return it directly
    if (typeof config === 'object' && config !== null) {
      return config;
    }

    // At this point, config is guaranteed to be a string
    const configPath = config as string;

    // Try parsing string as JSON (like Jest CLI behavior)
    const inlineConfig = this.tryParseJsonConfig(configPath);
    if (inlineConfig !== null) {
      return inlineConfig;
    }

    // Treat as file path
    const jestConfigPath = getSystemPath(join(projectRoot, configPath));
    if (!existsSync(jestConfigPath)) {
      this.logger.warn(
        `warning: unable to locate custom jest configuration file at path "${jestConfigPath}"`
      );
      return {};
    }
    const tsConfig = getTsConfigPath(projectRoot, this.options);
    return await loadModule<JestConfig>(jestConfigPath, tsConfig, this.logger);
  }

  private tryParseJsonConfig(config: string): JestConfig | null {
    try {
      const parsed = JSON.parse(config);
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        return parsed as JestConfig;
      }
    } catch {
      // Not valid JSON, will be treated as file path
    }
    return null;
  }
}
