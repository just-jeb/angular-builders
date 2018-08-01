import {Builder, BuilderConfiguration, BuilderContext, BuildEvent} from '@angular-devkit/architect';
import {from, Observable} from 'rxjs';
import {map, tap} from 'rxjs/operators';
import {JestBuilderSchema} from './schema';
import {getSystemPath} from '@angular-devkit/core';
import {existsSync} from 'fs';
import defaultConfig from './jest-config/default-config';
import {merge} from 'lodash';

const jest = require('jest');

export default class JestBuilder implements Builder<JestBuilderSchema> {
  constructor(private context: BuilderContext) {
  }

  run(builderConfig: BuilderConfiguration<Partial<JestBuilderSchema>>): Observable<BuildEvent> {
    const {options} = builderConfig;
    const root = this.context.workspace.root;
    const argv: any[] = [];
    for (const option of Object.keys(options)) {
      if (options[option] === true) {
        argv.push(`--${option}`);
      }
    }
    let customConfig = {};
    const packageJson = require(`${getSystemPath(root)}/package.json`);
    const jestConfigPath = `${getSystemPath(root)}/${options.configPath}`;
    if (packageJson.jest) {
      customConfig = packageJson.jest;
    } else if (existsSync(jestConfigPath)) {
      customConfig = require(jestConfigPath);
    }
    argv.push('--config', JSON.stringify(merge(defaultConfig, customConfig)));
    return from(jest.run(argv)).pipe(tap(res => console.log(res)), map(() => ({success: true})));
  }

}
