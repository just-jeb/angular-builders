// Should be defined before any import due to the hoisting
const existsSyncMock = jest.fn();

import {getSystemPath, normalize} from '@angular-devkit/core';
// TODO: find a way to mock 'fs' only for custom-config.resolver
jest.mock('fs', () => ({existsSync: existsSyncMock}));

import {CustomConfigResolver} from './custom-config.resolver';

const jestConfig = {blah: true};
const mockLogger = <any>{ warn: jest.fn() };
const customConfigResolver = new CustomConfigResolver(mockLogger);

describe('Resolve global custom config', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('Should return jest configuration from package.json if exists', () => {
    jest.mock('package.json', () => ({jest: jestConfig}), {virtual: true});
    const customConfig = customConfigResolver.resolveGlobal(normalize('./'));
    expect(customConfig).toEqual(jestConfig);
  });

  it('Should return jest configuration from workspace jest.config.js if exists and no configuration provided in package.json', () => {
    jest.mock('package.json', () => ({}), {virtual: true});
    jest.mock('jest.config.js', () => jestConfig, {virtual: true});
    existsSyncMock.mockReturnValue(true);
    const customConfig = customConfigResolver.resolveGlobal(normalize('./'));
    expect(customConfig).toEqual(jestConfig);
  });

  it('Should return empty object if neither workspace jest.config.js nor package.json jest config exist', () => {
    jest.mock('package.json', () => ({}), {virtual: true});
    existsSyncMock.mockReturnValue(false);
    const customConfig = customConfigResolver.resolveGlobal(normalize('./'));
    expect(customConfig).toEqual({});
  });
});

describe('Resolve project custom config', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('Should return jest configuration from project jest.config.js if exists', () => {
    jest.mock(getSystemPath(normalize('./myproject/project-jest.config.js')), () => jestConfig, {virtual: true});
    existsSyncMock.mockReturnValue(true);
    const customConfig = customConfigResolver.resolveForProject(normalize('./myproject'), 'project-jest.config.js');
    expect(customConfig).toEqual(jestConfig);
  });

  it('Should return empty object if project jest.config.js doesn\'t exist', () => {
    existsSyncMock.mockReturnValue(false);
    const customConfig = customConfigResolver.resolveForProject(normalize('./myproject'), 'project-jest.config.js');
    expect(customConfig).toEqual({});
  });

  it('should log a warning when the custom configuration is not found', () => {
    existsSyncMock.mockReturnValue(false);
    customConfigResolver.resolveForProject(normalize('./myproject'), 'project-jest.config.js');
    expect(mockLogger.warn.mock.calls.length).toBe(1);
  });
});