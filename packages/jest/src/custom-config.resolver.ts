import {getSystemPath, join, Path} from "@angular-devkit/core";
import {existsSync} from "fs";

export class CustomConfigResolver {
  static resolveGlobal(workspaceRoot: Path): any {
    const packageJsonPath = getSystemPath(join(workspaceRoot, 'package.json'));
    const packageJson = require(packageJsonPath);
    const workspaceJestConfigPath = getSystemPath(join(workspaceRoot, 'jest.config.js'));

    return packageJson.jest || existsSync(workspaceJestConfigPath) && require(workspaceJestConfigPath) || {}
  }

  static resolveForProject(projectRoot: Path, configPath: string){
    const jestConfigPath = getSystemPath(join(projectRoot, configPath));
    return existsSync(jestConfigPath) && require(jestConfigPath) || {};
  }
}