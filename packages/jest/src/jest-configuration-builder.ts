import {normalize, Path, resolve} from "@angular-devkit/core";

import {merge} from 'lodash';
import {CustomConfigResolver} from "./custom-config.resolver";
import {DefaultConfigResolver} from "./default-config.resolver";

export class JestConfigurationBuilder {
  static buildConfiguration(root: Path, sourceRoot: Path | undefined, workspaceRoot: Path, configPath: string = 'jest.config.js'): any {
    const configRoot = root === '' ? sourceRoot || normalize('') : root ;
    const projectRoot: Path = resolve(workspaceRoot, configRoot);

    const globalDefaultConfig = DefaultConfigResolver.resolveGlobal();
    const projectDefaultConfig = DefaultConfigResolver.resolveForProject(projectRoot);
    const globalCustomConfig = CustomConfigResolver.resolveGlobal(workspaceRoot);
    const globalProjectConfig = CustomConfigResolver.resolveForProject(projectRoot, configPath);

    return merge(globalDefaultConfig, projectDefaultConfig, globalCustomConfig, globalProjectConfig);
  }


}