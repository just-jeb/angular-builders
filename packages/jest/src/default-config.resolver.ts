import { getSystemPath, join, Path, normalize } from '@angular-devkit/core';
import defaultConfig from './jest-config/default-config';

export const testPattern = `/**/+(*.)+(spec|test).+(ts|js)?(x)`;
export const tsConfigName = 'tsconfig.spec.json';

export class DefaultConfigResolver {
  constructor(private tsConfig?: string) {}

  resolveGlobal(): any {
    return defaultConfig;
  }

  resolveForProject(projectRoot: Path): any {
    return {
      globals: {
        'ts-jest': {
          // Join with the default `tsConfigName` if the `tsConfig` option
          // is not provided
          tsConfig: getSystemPath(join(projectRoot, this.tsConfig || tsConfigName)),
        },
      },
      testMatch: [`${getSystemPath(projectRoot)}${testPattern}`],
    };
  }
}
