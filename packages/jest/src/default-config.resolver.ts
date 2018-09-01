import {getSystemPath, join, Path} from "@angular-devkit/core";
import defaultConfig from "./jest-config/default-config";

export const testPattern = `/**/+(*.)+(spec|test).+(ts|js)?(x)`;
export const tsConfigName = 'tsconfig.spec.json';

export class DefaultConfigResolver {
  static resolveGlobal(): any {
    return defaultConfig;
  }

  static resolveForProject(projectRoot: Path): any {
    return {
      globals: {
        'ts-jest': {
          tsConfigFile: getSystemPath(join(projectRoot, tsConfigName))
        }
      },
      testMatch: [
        `${getSystemPath(join(projectRoot, testPattern))}`
      ]
    };
  }
}