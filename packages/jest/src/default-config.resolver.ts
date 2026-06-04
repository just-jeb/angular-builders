import { pick } from 'lodash';
import { getSystemPath, normalize, Path } from '@angular-devkit/core';
import * as path from 'node:path';

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
      // Scope coverage output to the project directory so that multiple projects
      // in a workspace don't overwrite each other's coverage reports. See #1009.
      coverageDirectory: path.join(getSystemPath(projectRoot), 'coverage'),
      transform: {
        [this.tsJestTransformRegExp]: [
          'jest-preset-angular',
          {
            // see: jest-preset-angular defaultTransformerOptions https://github.com/thymikee/jest-preset-angular/blob/main/src/presets/index.ts#L11
            stringifyContentPathRegex: '\\.(html|svg)$',
            // Join with the default `tsConfigName` if the `tsConfig` option is not provided
            tsconfig: getTsConfigPath(projectRoot, this.options),
            // Default to isolatedModules: true for significantly faster compilation.
            // With isolatedModules: false (the previous implicit default), ts-jest uses the
            // TypeScript language service to build a full cross-file Program for every test
            // file, which becomes extremely slow with Angular 19+ code (signals, new control
            // flow, standalone-by-default). Angular 19+ users report 2min → 15min regressions.
            // Cross-file type checking is better handled by `tsc --noEmit` or `ng build`.
            // Users who need the old behaviour can opt out via their jest.config.ts:
            //   transform: { '...': ['jest-preset-angular', { isolatedModules: false }] }
            // BREAKING CHANGE: targeted for the next major version.
            isolatedModules: true,
          },
        ],
      },
    };
  }
}
