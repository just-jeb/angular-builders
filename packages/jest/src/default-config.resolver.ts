import { pick } from 'lodash';
import { getSystemPath, normalize, Path } from '@angular-devkit/core';

import { JestConfig } from './types';
import { getTsConfigPath } from './utils';
import defaultConfig from './jest-config/default-config';
import { SchemaObject as JestBuilderSchema } from './schema';

export const testPattern = `/**/*(*.)@(spec|test).[tj]s?(x)`;

const globalMocks = {
  matchMedia: 'match-media.js',
};

const getMockFiles = (enabledMocks: string[] = []): string[] =>
  Object.values(pick(globalMocks, enabledMocks)).map(fileName =>
    getSystemPath(normalize(`${__dirname}/global-mocks/${fileName}`))
  );

const getSetupFile = (zoneless: boolean = true): string => {
  const setupFileName = zoneless ? 'setup-zoneless.js' : 'setup-zone.js';
  return getSystemPath(normalize(`${__dirname}/jest-config/${setupFileName}`));
};

export class DefaultConfigResolver {
  // Exposed publicly for testing purposes.
  readonly tsJestTransformRegExp = '^.+\\.(ts|js|mjs|html|svg)$';

  constructor(private options: JestBuilderSchema) {}

  resolveGlobal(): JestConfig {
    const setupFilesAfterEnv = [
      getSetupFile(this.options.zoneless ?? true),
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
          },
        ],
      },
    };
  }
}
