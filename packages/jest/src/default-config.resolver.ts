import { getSystemPath, join, normalize, Path } from '@angular-devkit/core';
import defaultConfig from './jest-config/default-config';
import { SchemaObject as JestBuilderSchema } from './schema';
import { pick } from 'lodash';

export const tsConfigName = 'tsconfig.spec.json';

const globalMocks = {
  getComputedStyle: 'computed-style.js',
  doctype: 'doctype.js',
  matchMedia: 'match-media.js',
  styleTransform: 'style-transform.js',
};

const getMockFiles = (enabledMocks: string[] = []): string[] =>
  Object.values(pick(globalMocks, enabledMocks)).map(fileName =>
    getSystemPath(normalize(`${__dirname}/global-mocks/${fileName}`))
  );

export class DefaultConfigResolver {
  constructor(private options: JestBuilderSchema) {}

  resolveGlobal(): any {
    const setupFilesAfterEnv = [
      ...defaultConfig.setupFilesAfterEnv,
      ...getMockFiles(this.options.globalMocks),
    ];
    return { ...defaultConfig, setupFilesAfterEnv };
  }

  resolveForProject(projectRoot: Path): any {
    return {
      globals: {
        'ts-jest': {
          // Join with the default `tsConfigName` if the `tsConfig` option
          // is not provided
          tsconfig: getSystemPath(join(projectRoot, this.options.tsConfig || tsConfigName)),
        },
      },
      rootDir: `${getSystemPath(projectRoot)}`,
    };
  }
}
