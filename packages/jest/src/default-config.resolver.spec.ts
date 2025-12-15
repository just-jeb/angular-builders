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
        stringifyContentPathRegex: '\\.(html|svg)$',
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
        stringifyContentPathRegex: '\\.(html|svg)$',
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

  it('Should resolve default config with zoneless setup by default', () => {
    const config = defaultConfigResolver.resolveGlobal();
    expect(config.preset).toEqual('jest-preset-angular');
    expect(config.moduleNameMapper).toEqual(defaultConfig.moduleNameMapper);
    expect(config.setupFilesAfterEnv[0]).toContain('setup-zoneless.js');
  });

  it('Should use zoneless setup file when zoneless: true', () => {
    const resolver = new DefaultConfigResolver({ zoneless: true });
    const config = resolver.resolveGlobal();
    expect(config.setupFilesAfterEnv[0]).toContain('setup-zoneless.js');
  });

  it('Should use zone setup file when zoneless: false', () => {
    const resolver = new DefaultConfigResolver({ zoneless: false });
    const config = resolver.resolveGlobal();
    expect(config.setupFilesAfterEnv[0]).toContain('setup-zone.js');
  });

  it('Should add matchMedia mock when passed in globalMocks', () => {
    const resolver = new DefaultConfigResolver({
      globalMocks: ['matchMedia'],
    });
    expect(resolver.resolveGlobal().setupFilesAfterEnv).toEqual(
      expect.arrayContaining([getPathForMock('match-media.js')])
    );
  });

  it('Should not add matchMedia mock when not passed in globalMocks', () => {
    const resolver = new DefaultConfigResolver({
      globalMocks: [],
    });
    expect(resolver.resolveGlobal().setupFilesAfterEnv).toEqual(
      expect.not.arrayContaining([getPathForMock('match-media.js')])
    );
  });
});
