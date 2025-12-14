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
  // Exposed publicly for testing purposes.
  readonly tsJestTransformRegExp = '^.+\\.(ts|js|mjs|html|svg)$';

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
      testMatch: [`${getSystemPath(projectRoot)}${testPattern}`],
      transform: {
        [this.tsJestTransformRegExp]: [
          'jest-preset-angular',
          {
            // see: jest-preset-angular defaultTransformerOptions https://github.com/thymikee/jest-preset-angular/blob/main/src/presets/index.ts#L11
            stringifyContentPathRegex: '\\.(html|svg)$',
            // Join with the default `tsConfigName` if the `tsConfig` option is not provided
            tsconfig: getTsConfigPath(projectRoot, this.options),
            // Override moduleResolution for ts-jest compatibility
            // Angular 21+ uses "bundler" which doesn't work with Node.js/ts-jest
            compilerOptions: {
              moduleResolution: 'node',
            },
          },
        ],
      },
    };
  }
}
