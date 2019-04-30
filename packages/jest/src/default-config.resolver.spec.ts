import {DefaultConfigResolver, testPattern, tsConfigName} from "./default-config.resolver";
import {getSystemPath, normalize, join} from "@angular-devkit/core";

import defaultConfig from './jest-config/default-config';

const defaultConfigResolver = new DefaultConfigResolver();

describe('Resolve project default configuration', () => {
    it('Should resolve tsconfig relatively to project root', () => {
        const config = defaultConfigResolver.resolveForProject(normalize('/some/cool/directory'));
        expect(config.globals['ts-jest'].tsConfig).toEqual(getSystemPath(normalize(`/some/cool/directory/${tsConfigName}`)));
    });

    it('Should resolve testMatch pattern relatively to project root', () => {
        const config = defaultConfigResolver.resolveForProject(normalize('/some/cool/directory'));
        expect(config.testMatch).toEqual([`${getSystemPath(normalize('/some/cool/directory'))}${testPattern}`]);
    });
});

describe('Resolve global default configuration', () => {
    it('Should resolve default config from predefined config module', () => {
        expect(defaultConfigResolver.resolveGlobal()).toEqual(defaultConfig);
    });
});
