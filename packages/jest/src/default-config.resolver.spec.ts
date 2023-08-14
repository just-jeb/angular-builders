import { DefaultConfigResolver, testPattern } from './default-config.resolver';
import { getSystemPath, normalize } from '@angular-devkit/core';

import { tsConfigName } from './utils';
import defaultConfig from './jest-config/default-config';

const defaultConfigResolver = new DefaultConfigResolver({});

describe('Resolve project default configuration', () => {
  it('Should resolve tsconfig relatively to project root', () => {
    const config = defaultConfigResolver.resolveForProject(normalize('/some/cool/directory'));
    expect(config.transform[defaultConfigResolver.tsJestTransformRegExp]).toEqual([
      'jest-preset-angular',
      {
        tsconfig: getSystemPath(normalize(`/some/cool/directory/${tsConfigName}`)),
      },
    ]);
  });

  it('Should resolve path to the tsconfig if "tsConfig" is provided', () => {
    const defaultConfigResolver = new DefaultConfigResolver({
      tsConfig: './ts-configs/tsconfig.spec.json',
    });
    const config = defaultConfigResolver.resolveForProject(normalize('/some/cool/project'));
    expect(config.transform[defaultConfigResolver.tsJestTransformRegExp]).toEqual([
      'jest-preset-angular',
      {
        tsconfig: getSystemPath(normalize(`/some/cool/project/ts-configs/tsconfig.spec.json`)),
      },
    ]);
  });

  it('Should resolve testMatch pattern relatively to project root', () => {
    const config = defaultConfigResolver.resolveForProject(normalize('/some/cool/directory'));
    expect(config.testMatch).toEqual([
      `${getSystemPath(normalize('/some/cool/directory'))}${testPattern}`,
    ]);
  });
});

describe('Resolve global default configuration', () => {
  const getPathForMock = (fileName: string) =>
    getSystemPath(normalize(`${__dirname}/global-mocks/${fileName}`));

  it('Should resolve default config from predefined config module', () => {
    expect(defaultConfigResolver.resolveGlobal()).toEqual(defaultConfig);
  });

  it('Should add to setup files global mocks that were passed in options', () => {
    const defaultConfigResolver = new DefaultConfigResolver({
      globalMocks: ['getComputedStyle', 'doctype', 'styleTransform', 'matchMedia'],
    });
    expect(defaultConfigResolver.resolveGlobal().setupFilesAfterEnv).toEqual(
      expect.arrayContaining([
        getPathForMock('computed-style.js'),
        getPathForMock('doctype.js'),
        getPathForMock('style-transform.js'),
        getPathForMock('match-media.js'),
      ])
    );
  });

  it('Should not add to setup files global mocks that were not passed in options', () => {
    const defaultConfigResolver = new DefaultConfigResolver({
      globalMocks: ['doctype', 'styleTransform', 'matchMedia'],
    });
    expect(defaultConfigResolver.resolveGlobal().setupFilesAfterEnv).toEqual(
      expect.not.arrayContaining([getPathForMock('computed-style.js')])
    );
  });
});
