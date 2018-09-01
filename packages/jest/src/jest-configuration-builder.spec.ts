import {normalize} from "@angular-devkit/core";

jest.mock('./default-config.resolver', () => ({
  DefaultConfigResolver: {
    resolveGlobal: jest.fn(),
    resolveForProject: jest.fn()
  }
}));
jest.mock('./custom-config.resolver', () => ({
  CustomConfigResolver: {
    resolveGlobal: jest.fn(),
    resolveForProject: jest.fn()
  }
}));

import {JestConfigurationBuilder} from "./jest-configuration-builder";
import {DefaultConfigResolver} from "./default-config.resolver";
import {CustomConfigResolver} from "./custom-config.resolver";

describe("Build Jest configuration object", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Should resolve projects with source root instead of root if the former exists and the latter is empty", () => {
    const sourceRoot = normalize('/my/source/root');
    JestConfigurationBuilder.buildConfiguration(normalize(''), sourceRoot, normalize('./'), 'jest.config.js');
    expect(DefaultConfigResolver.resolveForProject.mock.calls[0][0]).toEqual(sourceRoot);
    expect(CustomConfigResolver.resolveForProject.mock.calls[0][0]).toEqual(sourceRoot);
  });

  it("Should use root even if it's empty when source root is not provided", () => {
    JestConfigurationBuilder.buildConfiguration(normalize(''), undefined, normalize('./'), 'jest.config.js');
    expect(DefaultConfigResolver.resolveForProject.mock.calls[0][0]).toEqual('');
    expect(CustomConfigResolver.resolveForProject.mock.calls[0][0]).toEqual('');
  });

  it("Should prefer root over source root if the former is not empty", () => {
    const root = normalize('/my/root');
    JestConfigurationBuilder.buildConfiguration(root, normalize('/my/source/root'), normalize('./'), 'jest.config.js');
    expect(DefaultConfigResolver.resolveForProject.mock.calls[0][0]).toEqual(root);
    expect(CustomConfigResolver.resolveForProject.mock.calls[0][0]).toEqual(root);
  });

  it("Should use jest.config.js path if configPath is not provided", () => {
    JestConfigurationBuilder.buildConfiguration(normalize(''), undefined, normalize('./'));
    expect(CustomConfigResolver.resolveForProject.mock.calls[0][1]).toEqual('jest.config.js');
  });

  it("Should use provided configPath when resolving custom project configuration", () => {
    const jestConfigPath = '../my-jest.config.js';
    JestConfigurationBuilder.buildConfiguration(normalize(''), undefined, normalize('./'), jestConfigPath);
    expect(CustomConfigResolver.resolveForProject.mock.calls[0][1]).toEqual(jestConfigPath);
  });

  it("Should merge configs in the following order: defaultGlobalConfig <- defaultProjectConfig <- customGlobalConfig <- customProjectConfig", () => {
    DefaultConfigResolver.resolveGlobal.mockReturnValue({
      global: {
        default: 0,
        notSoDefault: true,
        theOnlyThingToStay: '!'
      },
      project: {
        default: 3,
      }
    });
    DefaultConfigResolver.resolveForProject.mockReturnValue({
      global: {
        notSoDefault: false
      },
      project: {
        default: 1,
        notSoDefault: "blah"
      }
    });
    CustomConfigResolver.resolveGlobal.mockReturnValue({
      global: {
        default: 2
      },
      project: {
        default: 10,
        notSoDefault: "blah blah"
      }
    });
    CustomConfigResolver.resolveForProject.mockReturnValue({
      project: {
        default: 5
      }
    });
    const config = JestConfigurationBuilder.buildConfiguration(normalize(''), undefined, normalize('./'));

    expect(config).toEqual({
      global: {
        default: 2,
        notSoDefault: false,
        theOnlyThingToStay: '!'
      },
      project: {
        default: 5,
        notSoDefault: "blah blah"
      }
    })
  })
});