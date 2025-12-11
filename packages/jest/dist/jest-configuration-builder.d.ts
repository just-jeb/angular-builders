import { Path } from '@angular-devkit/core';
import { JestConfig } from './types';
import { CustomConfigResolver } from './custom-config.resolver';
import { DefaultConfigResolver } from './default-config.resolver';
export declare class JestConfigurationBuilder {
    private defaultConfigResolver;
    private customConfigResolver;
    constructor(defaultConfigResolver: DefaultConfigResolver, customConfigResolver: CustomConfigResolver);
    buildConfiguration(projectRoot: Path, workspaceRoot: Path, configPath?: string): Promise<JestConfig>;
}
