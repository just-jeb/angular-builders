import {Builder, BuilderConfiguration, BuilderContext, BuildEvent} from '@angular-devkit/architect';
import {from, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {JestBuilderSchema} from './schema';

import {OptionsConverter} from "./options-converter";
import {JestConfigurationBuilder} from "./jest-configuration-builder";

const jest = require('jest');

export default class JestBuilder implements Builder<JestBuilderSchema> {
  constructor(private context: BuilderContext) {
  }

  run(builderConfig: BuilderConfiguration<Partial<JestBuilderSchema>>): Observable<BuildEvent> {
    const {options, root, sourceRoot} = builderConfig;
    const workspaceRoot = this.context.workspace.root;

    const configuration = JestConfigurationBuilder.buildConfiguration(root, sourceRoot, workspaceRoot, options.configPath);
    delete options.configPath;
    const argv = OptionsConverter.convertToCliArgs(options);


    argv.push('--config', JSON.stringify(configuration));
    return from(jest.run(argv)).pipe(map(() => ({success: true})));
  }

}
