import {normalize} from "@angular-devkit/core";
import {JestConfigurationBuilder} from "./jest-configuration-builder";

describe("Build Jest configuration object", () => {

  let defaultConfigResolver: any;
  let customConfigResolver: any;
  let jestConfigurationBuilder: JestConfigurationBuilder;

  beforeEach(() => {
    defaultConfigResolver = {
      resolveGlobal: jest.fn(),
      resolveForProject: jest.fn()
    };
    customConfigResolver = {
      resolveGlobal: jest.fn(),
      resolveForProject: jest.fn()
    };
    jestConfigurationBuilder = new JestConfigurationBuilder(
      defaultConfigResolver,
      customConfigResolver
    );
  });

  it("Should resolve projects with source root instead of root if the former exists and the latter is empty", () => {
    const sourceRoot = normalize('/my/source/root');
    jestConfigurationBuilder.buildConfiguration(normalize(''), sourceRoot, normalize('./'), 'jest.config.js');
    expect(defaultConfigResolver.resolveForProject.mock.calls[0][0]).toEqual(sourceRoot);
    expect(customConfigResolver.resolveForProject.mock.calls[0][0]).toEqual(sourceRoot);
  });

  it("Should use root even if it's empty when source root is not provided", () => {
    jestConfigurationBuilder.buildConfiguration(normalize(''), undefined, normalize('./'), 'jest.config.js');
    expect(defaultConfigResolver.resolveForProject.mock.calls[0][0]).toEqual('');
    expect(customConfigResolver.resolveForProject.mock.calls[0][0]).toEqual('');
  });

  it("Should prefer root over source root if the former is not empty", () => {
    const root = normalize('/my/root');
    jestConfigurationBuilder.buildConfiguration(root, normalize('/my/source/root'), normalize('./'), 'jest.config.js');
    expect(defaultConfigResolver.resolveForProject.mock.calls[0][0]).toEqual(root);
    expect(customConfigResolver.resolveForProject.mock.calls[0][0]).toEqual(root);
  });

  it("Should use jest.config.js path if configPath is not provided", () => {
    jestConfigurationBuilder.buildConfiguration(normalize(''), undefined, normalize('./'));
    expect(customConfigResolver.resolveForProject.mock.calls[0][1]).toEqual('jest.config.js');
  });

  it("Should use provided configPath when resolving custom project configuration", () => {
    const jestConfigPath = '../my-jest.config.js';
    jestConfigurationBuilder.buildConfiguration(normalize(''), undefined, normalize('./'), jestConfigPath);
    expect(customConfigResolver.resolveForProject.mock.calls[0][1]).toEqual(jestConfigPath);
  });

  it("Should merge configs in the following order: defaultGlobalConfig <- defaultProjectConfig <- customGlobalConfig <- customProjectConfig", () => {
    defaultConfigResolver.resolveGlobal.mockReturnValue({
      global: {
        default: 0,
        notSoDefault: true,
        theOnlyThingToStay: '!'
      },
      project: {
        default: 3,
      }
    });
    defaultConfigResolver.resolveForProject.mockReturnValue({
      global: {
        notSoDefault: false
      },
      project: {
        default: 1,
        notSoDefault: "blah"
      }
    });
    customConfigResolver.resolveGlobal.mockReturnValue({
      global: {
        default: 2
      },
      project: {
        default: 10,
        notSoDefault: "blah blah"
      }
    });
    customConfigResolver.resolveForProject.mockReturnValue({
      project: {
        default: 5
      }
    });
    const config = jestConfigurationBuilder.buildConfiguration(normalize(''), undefined, normalize('./'));

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