import {getSystemPath, join, Path} from '@angular-devkit/core';
import {existsSync} from 'fs';
import {Logger} from '@angular-devkit/core/src/logger';

export class CustomConfigResolver {

  constructor(private logger: Logger) {
  }

  resolveGlobal(workspaceRoot: Path): any {
    const packageJsonPath = getSystemPath(join(workspaceRoot, 'package.json'));
    const packageJson = require(packageJsonPath);
    const workspaceJestConfigPath = getSystemPath(join(workspaceRoot, 'jest.config.js'));

    return packageJson.jest || existsSync(workspaceJestConfigPath) && require(workspaceJestConfigPath) || {};
  }

  resolveForProject(projectRoot: Path, configPath: string){
    const jestConfigPath = getSystemPath(join(projectRoot, configPath));
    if (!existsSync(jestConfigPath)) {
      this.logger.warn(`warning: unable to locate custom jest configuration file at path "${jestConfigPath}"`);
      return {};
    }
    return require(jestConfigPath);
  }
}