import {Builder, BuilderConfiguration, BuilderContext, BuildEvent} from '@angular-devkit/architect';
import {from, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {JestBuilderSchema} from './schema';

import {OptionsConverter} from "./options-converter";
import {JestConfigurationBuilder} from "./jest-configuration-builder";
import { DefaultConfigResolver } from './default-config.resolver';
import { CustomConfigResolver } from './custom-config.resolver';

const jest = require('jest');

export default class JestBuilder implements Builder<JestBuilderSchema> {

  private jestConfigurationBuilder: JestConfigurationBuilder;
  private optionsConverter: OptionsConverter;

  constructor(private context: BuilderContext) {
    this.jestConfigurationBuilder = new JestConfigurationBuilder(
      new DefaultConfigResolver(),
      new CustomConfigResolver(context.logger)
    );
    this.optionsConverter = new OptionsConverter();
  }

  run(builderConfig: BuilderConfiguration<Partial<JestBuilderSchema>>): Observable<BuildEvent> {
    const {options, root, sourceRoot} = builderConfig;
    const workspaceRoot = this.context.workspace.root;

    const configuration = this.jestConfigurationBuilder.buildConfiguration(root, sourceRoot, workspaceRoot, options.configPath);
    delete options.configPath;
    const argv = this.optionsConverter.convertToCliArgs(options);

    argv.push('--config', JSON.stringify(configuration));
    return from(jest.run(argv)).pipe(map(() => ({success: true})));
  }

}
