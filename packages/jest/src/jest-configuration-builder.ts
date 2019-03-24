import {normalize, Path, resolve} from "@angular-devkit/core";

import {merge} from 'lodash';
import {CustomConfigResolver} from "./custom-config.resolver";
import {DefaultConfigResolver} from "./default-config.resolver";

export const buildConfiguration = (defaultConfigResolver: DefaultConfigResolver,
  customConfigResolver: CustomConfigResolver) => 
  (projectRoot: Path,workspaceRoot: Path, configPath: string = 'jest.config.js') => {
    const globalDefaultConfig = defaultConfigResolver.resolveGlobal(workspaceRoot);
    const projectDefaultConfig = defaultConfigResolver.resolveForProject(projectRoot);
    const globalCustomConfig = customConfigResolver.resolveGlobal(workspaceRoot);
    const projectCustomConfig = customConfigResolver.resolveForProject(projectRoot, configPath);

    return merge(globalDefaultConfig, projectDefaultConfig, globalCustomConfig, projectCustomConfig);
}

export class JestConfigurationBuilder {

  constructor(private defaultConfigResolver: DefaultConfigResolver,
              private customConfigResolver: CustomConfigResolver) {
  }

  buildConfiguration(root: Path, sourceRoot: Path | undefined, workspaceRoot: Path, configPath: string = 'jest.config.js'): any {
    const configRoot = root === '' ? sourceRoot || normalize('') : root ;
    const projectRoot: Path = resolve(workspaceRoot, configRoot);

    const globalDefaultConfig = this.defaultConfigResolver.resolveGlobal(workspaceRoot);
    const projectDefaultConfig = this.defaultConfigResolver.resolveForProject(projectRoot);
    const globalCustomConfig = this.customConfigResolver.resolveGlobal(workspaceRoot);
    const projectCustomConfig = this.customConfigResolver.resolveForProject(projectRoot, configPath);

    return merge(globalDefaultConfig, projectDefaultConfig, globalCustomConfig, projectCustomConfig);
  }


}