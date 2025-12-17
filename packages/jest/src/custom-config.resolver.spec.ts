// Should be defined before any import due to the hoisting
const existsSyncMock = jest.fn();

import { getSystemPath, normalize } from '@angular-devkit/core';
// TODO: find a way to mock 'fs' only for custom-config.resolver
jest.mock('fs', () => ({ existsSync: existsSyncMock }));

import { CustomConfigResolver } from './custom-config.resolver';

const jestConfig = { blah: true };
const mockLogger = <any>{ warn: jest.fn() };
const customConfigResolver = new CustomConfigResolver({}, mockLogger);

describe('Resolve global custom config', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('Should return jest configuration from package.json if exists', async () => {
    jest.mock('package.json', () => ({ jest: jestConfig }), { virtual: true });
    const customConfig = await customConfigResolver.resolveGlobal(normalize('./'));
    expect(customConfig).toEqual(jestConfig);
  });

  it('Should return jest configuration from workspace jest.config.js if exists and no configuration provided in package.json', async () => {
    jest.mock('package.json', () => ({}), { virtual: true });
    jest.mock('jest.config.js', () => jestConfig, { virtual: true });
    existsSyncMock.mockReturnValue(true);
    const customConfig = await customConfigResolver.resolveGlobal(normalize('./'));
    expect(customConfig).toEqual(jestConfig);
  });

  it('Should return empty object if neither workspace jest.config.js nor package.json jest config exist', async () => {
    jest.mock('package.json', () => ({}), { virtual: true });
    existsSyncMock.mockReturnValue(false);
    const customConfig = await customConfigResolver.resolveGlobal(normalize('./'));
    expect(customConfig).toEqual({});
  });
});

describe('Resolve project custom config', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('Should return jest configuration from project jest.config.js if exists', async () => {
    jest.mock(getSystemPath(normalize('./myproject/project-jest.config.js')), () => jestConfig, {
      virtual: true,
    });
    existsSyncMock.mockReturnValue(true);
    const customConfig = await customConfigResolver.resolveForProject(
      normalize('./myproject'),
      'project-jest.config.js'
    );
    expect(customConfig).toEqual(jestConfig);
  });

  it("Should return empty object if project jest.config.js doesn't exist", async () => {
    existsSyncMock.mockReturnValue(false);
    const customConfig = await customConfigResolver.resolveForProject(
      normalize('./myproject'),
      'project-jest.config.js'
    );
    expect(customConfig).toEqual({});
  });

  it('should log a warning when the custom configuration is not found', async () => {
    existsSyncMock.mockReturnValue(false);
    await customConfigResolver.resolveForProject(
      normalize('./myproject'),
      'project-jest.config.js'
    );
    expect(mockLogger.warn.mock.calls.length).toBe(1);
  });

  it('Should parse and return inline JSON configuration', async () => {
    const inlineConfig = { testTimeout: 10000, verbose: true };
    const customConfig = await customConfigResolver.resolveForProject(
      normalize('./myproject'),
      JSON.stringify(inlineConfig)
    );
    expect(customConfig).toEqual(inlineConfig);
    // Should not try to check file existence for JSON config
    expect(existsSyncMock).not.toHaveBeenCalled();
  });

  it('Should treat non-JSON string as file path', async () => {
    existsSyncMock.mockReturnValue(false);
    await customConfigResolver.resolveForProject(
      normalize('./myproject'),
      'jest.config.js'
    );
    expect(existsSyncMock).toHaveBeenCalled();
  });

  it('Should treat invalid JSON as file path', async () => {
    existsSyncMock.mockReturnValue(false);
    await customConfigResolver.resolveForProject(
      normalize('./myproject'),
      '{invalid json'
    );
    expect(existsSyncMock).toHaveBeenCalled();
  });

  it('Should not treat JSON array as config', async () => {
    existsSyncMock.mockReturnValue(false);
    await customConfigResolver.resolveForProject(
      normalize('./myproject'),
      '["item1", "item2"]'
    );
    // Arrays should be treated as file paths, not config objects
    expect(existsSyncMock).toHaveBeenCalled();
  });

  it('Should return object config directly when passed as object', async () => {
    const objectConfig = { testTimeout: 10000, verbose: true };
    const customConfig = await customConfigResolver.resolveForProject(
      normalize('./myproject'),
      objectConfig
    );
    expect(customConfig).toEqual(objectConfig);
    // Should not try to check file existence for object config
    expect(existsSyncMock).not.toHaveBeenCalled();
  });
});
