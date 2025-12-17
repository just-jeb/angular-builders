import { normalize } from '@angular-devkit/core';

import { JestConfigurationBuilder } from './jest-configuration-builder';

describe('Build Jest configuration object', () => {
  let defaultConfigResolver: any;
  let customConfigResolver: any;
  let jestConfigurationBuilder: JestConfigurationBuilder;

  beforeEach(() => {
    defaultConfigResolver = {
      resolveGlobal: jest.fn(),
      resolveForProject: jest.fn(),
    };
    customConfigResolver = {
      resolveGlobal: jest.fn(),
      resolveForProject: jest.fn(),
    };
    jestConfigurationBuilder = new JestConfigurationBuilder(
      defaultConfigResolver,
      customConfigResolver
    );
  });

  it('Should use project root for resolving the configuration', async () => {
    const projectRoot = normalize('/my/root');
    await jestConfigurationBuilder.buildConfiguration(
      projectRoot,
      normalize('./'),
      'jest.config.js'
    );
    expect(defaultConfigResolver.resolveForProject.mock.calls[0][0]).toEqual(projectRoot);
    expect(customConfigResolver.resolveForProject.mock.calls[0][0]).toEqual(projectRoot);
  });

  it('Should use jest.config.js path if config is not provided', async () => {
    await jestConfigurationBuilder.buildConfiguration(normalize(''), normalize('./'));
    expect(customConfigResolver.resolveForProject.mock.calls[0][1]).toEqual('jest.config.js');
  });

  it('Should use provided config when resolving custom project configuration', async () => {
    const jestConfigPath = '../my-jest.config.js';
    await jestConfigurationBuilder.buildConfiguration(
      normalize(''),
      normalize('./'),
      jestConfigPath
    );
    expect(customConfigResolver.resolveForProject.mock.calls[0][1]).toEqual(jestConfigPath);
  });

  it('Should merge configs in the following order: defaultGlobalConfig <- defaultProjectConfig <- customGlobalConfig <- customProjectConfig', async () => {
    defaultConfigResolver.resolveGlobal.mockReturnValue({
      global: {
        default: 0,
        notSoDefault: true,
        theOnlyThingToStay: '!',
      },
      project: {
        default: 3,
      },
    });
    defaultConfigResolver.resolveForProject.mockReturnValue({
      global: {
        notSoDefault: false,
      },
      project: {
        default: 1,
        notSoDefault: 'blah',
      },
    });
    customConfigResolver.resolveGlobal.mockReturnValue({
      global: {
        default: 2,
      },
      project: {
        default: 10,
        notSoDefault: 'blah blah',
      },
    });
    customConfigResolver.resolveForProject.mockReturnValue({
      project: {
        default: 5,
      },
    });
    const config = await jestConfigurationBuilder.buildConfiguration(
      normalize(''),
      normalize('./'),
      normalize('./')
    );

    expect(config).toEqual({
      global: {
        default: 2,
        notSoDefault: false,
        theOnlyThingToStay: '!',
      },
      project: {
        default: 5,
        notSoDefault: 'blah blah',
      },
    });
  });

  it('Should concat "setupFilesAfterEnv" and "astTransformers" properties only', async () => {
    defaultConfigResolver.resolveGlobal.mockReturnValue({
      globals: {
        'ts-jest': {
          astTransformers: ['astTA'],
        },
      },
      setupFilesAfterEnv: ['setupA'],
    });

    defaultConfigResolver.resolveForProject.mockReturnValue({
      testMatch: ['shouldNotBe'],
    });

    customConfigResolver.resolveGlobal.mockReturnValue({
      globals: {
        'ts-jest': {
          astTransformers: ['astTB'],
        },
      },
      setupFilesAfterEnv: ['setupB'],
      testMatch: ['shouldBeOnlyThis'],
    });

    customConfigResolver.resolveForProject.mockReturnValue({
      setupFilesAfterEnv: ['setupC'],
    });

    const config = await jestConfigurationBuilder.buildConfiguration(
      normalize(''),
      normalize('./'),
      normalize('./')
    );

    expect(config).toEqual({
      globals: {
        'ts-jest': {
          astTransformers: ['astTA', 'astTB'],
        },
      },
      setupFilesAfterEnv: ['setupA', 'setupB', 'setupC'],
      testMatch: ['shouldBeOnlyThis'],
    });
  });

  it('Should work with object style configuration for "astTransformers"', async () => {
    defaultConfigResolver.resolveGlobal.mockReturnValue({
      globals: {
        'ts-jest': {
          astTransformers: {
            before: ['astTA'],
          },
        },
      },
    });

    defaultConfigResolver.resolveForProject.mockReturnValue({
      testMatch: ['shouldNotBe'],
    });

    customConfigResolver.resolveGlobal.mockReturnValue({
      globals: {
        'ts-jest': {
          astTransformers: {
            before: ['astTB'],
            after: ['astTC'],
          },
        },
      },
      testMatch: ['shouldBeOnlyThis'],
    });

    customConfigResolver.resolveForProject.mockReturnValue({
      globals: {
        'ts-jest': {
          astTransformers: {},
        },
      },
    });

    const config = await jestConfigurationBuilder.buildConfiguration(
      normalize(''),
      normalize('./'),
      normalize('./')
    );

    expect(config).toEqual({
      globals: {
        'ts-jest': {
          astTransformers: {
            before: ['astTA', 'astTB'],
            after: ['astTC'],
          },
        },
      },
      testMatch: ['shouldBeOnlyThis'],
    });
  });

  it('Should call the default config resolver resolveGlobal method', async () => {
    const workspaceRoot = normalize('my/workspace/root');
    await jestConfigurationBuilder.buildConfiguration(
      normalize(''),
      workspaceRoot,
      normalize('./')
    );
    expect(defaultConfigResolver.resolveGlobal).toHaveBeenCalledTimes(1);
  });
});
