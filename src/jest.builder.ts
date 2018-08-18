import {Builder, BuilderConfiguration, BuilderContext, BuildEvent} from '@angular-devkit/architect';
import {from, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {JestBuilderSchema} from './schema';
import {getSystemPath, join, normalize, Path, resolve} from '@angular-devkit/core';
import {existsSync} from 'fs';
import defaultConfig from './jest-config/default-config';
import {merge} from 'lodash';

const jest = require('jest');

const testPattern = `/**/+(*.)+(spec|test).+(ts|js)?(x)`;
const tsConfigName = 'tsconfig.spec.json';

export default class JestBuilder implements Builder<JestBuilderSchema> {
  constructor(private context: BuilderContext) {
  }

  run(builderConfig: BuilderConfiguration<Partial<JestBuilderSchema>>): Observable<BuildEvent> {
    const {options, root, sourceRoot} = builderConfig;
    const workspaceRoot = this.context.workspace.root;
    const argv: any[] = [];
    for (const option of Object.keys(options)) {
      if (options[option] === true) {
        argv.push(`--${option}`);
      }
    }
    const configRoot = root === '' ? sourceRoot || normalize('') : root ;
    const projectRoot: Path = resolve(workspaceRoot, configRoot);

    const projectSpecificConfig = {
      globals:   {
        'ts-jest': {
          tsConfigFile: getSystemPath(join(projectRoot, tsConfigName))
        }
      },
      testMatch: [
        `${getSystemPath(projectRoot)}${testPattern}`
      ]
    };

    let customConfig = {};
    const packageJsonPath = getSystemPath(join(workspaceRoot, 'package.json'));
    const packageJson = require(packageJsonPath);
    const jestConfigPath = getSystemPath(join(projectRoot, options.configPath || ''));
    if (packageJson.jest) {
      customConfig = packageJson.jest;
    } else if (existsSync(jestConfigPath)) {
      customConfig = require(jestConfigPath);
    }
    argv.push('--config', JSON.stringify(merge(defaultConfig, projectSpecificConfig, customConfig)));
    return from(jest.run(argv)).pipe(map(() => ({success: true})));
  }

}
