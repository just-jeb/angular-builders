import {DefaultConfigResolver, testPattern, tsConfigName} from "./default-config.resolver";
import {getSystemPath, normalize} from "@angular-devkit/core";

import defaultConfig from './jest-config/default-config';

describe('Resolve project default configuration', () => {
  it('Should resolve tsconfig relatively to project root', () => {
    const config = DefaultConfigResolver.resolveForProject(normalize('/some/cool/directory'));
    expect(config.globals['ts-jest'].tsConfigFile).toEqual(getSystemPath(normalize(`/some/cool/directory/${tsConfigName}`)));
  });

  it('Should resolve testMatch pattern relatively to project root', () => {
    const config = DefaultConfigResolver.resolveForProject(normalize('/some/cool/directory'));
    expect(config.testMatch).toEqual([getSystemPath(normalize(`/some/cool/directory/${testPattern}`))]);
  });
});

describe('Resolve global default configuration', () => {
  it('Should resolve default config from predefined config module', () => {
    expect(DefaultConfigResolver.resolveGlobal()).toEqual(defaultConfig);
  });
});