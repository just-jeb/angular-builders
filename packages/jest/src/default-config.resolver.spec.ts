import { DefaultConfigResolver, testPattern, tsConfigName } from './default-config.resolver';
import { getSystemPath, normalize } from '@angular-devkit/core';

import defaultConfig from './jest-config/default-config';

const defaultConfigResolver = new DefaultConfigResolver();

describe('Resolve project default configuration', () => {
    it('Should resolve tsconfig relatively to project root', () => {
        const config = defaultConfigResolver.resolveForProject(normalize('/some/cool/directory'));
        expect(config.globals['ts-jest'].tsConfig).toEqual(
            getSystemPath(normalize(`/some/cool/directory/${tsConfigName}`))
        );
    });

    it('Should resolve path to the tsconfig if "tsConfig" is provided', () => {
        const defaultConfigResolver = new DefaultConfigResolver('./ts-configs/tsconfig.spec.json');
        const config = defaultConfigResolver.resolveForProject(normalize('/some/cool/project'));
        const tsConfig = config.globals['ts-jest'].tsConfig;
        expect(tsConfig).toEqual(
            getSystemPath(normalize(`/some/cool/project/ts-configs/tsconfig.spec.json`))
        );
    });

    it('Should resolve testMatch pattern relatively to project root', () => {
        const config = defaultConfigResolver.resolveForProject(normalize('/some/cool/directory'));
        expect(config.testMatch).toEqual([
            `${getSystemPath(normalize('/some/cool/directory'))}${testPattern}`
        ]);
    });
});

describe('Resolve global default configuration', () => {
    it('Should resolve default config from predefined config module', () => {
        expect(defaultConfigResolver.resolveGlobal()).toEqual(defaultConfig);
    });
});
