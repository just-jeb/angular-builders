import { pick } from 'lodash';
import { getSystemPath, normalize, Path } from '@angular-devkit/core';

import { JestConfig } from './types';
import { getTsConfigPath } from './utils';
import defaultConfig from './jest-config/default-config';
import { SchemaObject as JestBuilderSchema } from './schema';

export const testPattern = `/**/*(*.)@(spec|test).[tj]s?(x)`;

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

  resolveGlobal(): JestConfig {
    const setupFilesAfterEnv = [
      ...defaultConfig.setupFilesAfterEnv,
      ...getMockFiles(this.options.globalMocks),
    ];
    return { ...defaultConfig, setupFilesAfterEnv };
  }

  resolveForProject(projectRoot: Path): JestConfig {
    return {
      globals: {
        'ts-jest': {
          // Join with the default `tsConfigName` if the `tsConfig` option
          // is not provided
          tsconfig: getTsConfigPath(projectRoot, this.options),
        },
      },
      testMatch: [`${getSystemPath(projectRoot)}${testPattern}`],
    };
  }
}
