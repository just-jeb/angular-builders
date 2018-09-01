
import {getSystemPath, normalize} from "@angular-devkit/core";
let jestConfig = {blah: true};

const existsSyncMock = jest.fn();
jest.mock('fs', () => ({existsSync: existsSyncMock}));

import {CustomConfigResolver} from "./custom-config.resolver";

describe("Resolve global custom config", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("Should return jest configuration from package.json if exists", () => {
    jest.mock('package.json', () => ({jest: jestConfig}), {virtual: true});
    const customConfig = CustomConfigResolver.resolveGlobal(normalize('./'));
    expect(customConfig).toEqual(jestConfig);
  });

  it("Should return jest configuration from workspace jest.config.js if exists and no configuration provided in package.json", () => {
    jest.mock('package.json', () => ({}), {virtual: true});
    jest.mock('jest.config.js', () => jestConfig, {virtual: true});
    existsSyncMock.mockReturnValue(true);
    const customConfig = CustomConfigResolver.resolveGlobal(normalize('./'));
    expect(customConfig).toEqual(jestConfig);
  });

  it("Should return empty object if neither workspace jest.config.js nor package.json jest config exist", () => {
    jest.mock('package.json', () => ({}), {virtual: true});
    existsSyncMock.mockReturnValue(false);
    const customConfig = CustomConfigResolver.resolveGlobal(normalize('./'));
    expect(customConfig).toEqual({});
  });
});

describe("Resolve project custom config", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("Should return jest configuration from project jest.config.js if exists", () => {
    jest.mock(getSystemPath(normalize('./myproject/project-jest.config.js')), () => jestConfig, {virtual: true});
    existsSyncMock.mockReturnValue(true);
    const customConfig = CustomConfigResolver.resolveForProject(normalize('./myproject'), 'project-jest.config.js');
    expect(customConfig).toEqual(jestConfig);
  });

  it("Should return empty object if project jest.config.js doesn't exist", () => {
    existsSyncMock.mockReturnValue(false);
    const customConfig = CustomConfigResolver.resolveGlobal(normalize('./'));
    expect(customConfig).toEqual({});
  });
});