
import {BuilderContext, BuilderConfiguration, BuildEvent, Builder} from '@angular-devkit/architect';
import {DevServerBuilder, DevServerBuilderOptions, BrowserBuilderSchema, BrowserBuilder, NormalizedBrowserBuilderSchema } from '@angular-devkit/build-angular';
import {Path, virtualFs} from '@angular-devkit/core';
import {Observable} from 'rxjs';
import {tap, switchMap} from 'rxjs/operators';
import {Stats} from 'fs';
import {GenericWebpackBuilder} from '../generic-webpack-builder';


export class GenericDevServerBuilder extends DevServerBuilder {

  private targetBuilder: Builder<BrowserBuilderSchema> | undefined;

  constructor(context: BuilderContext) {
    super(context);
  }

  run(builderConfig: BuilderConfiguration<DevServerBuilderOptions>): Observable<BuildEvent> {

    const architect = this.context.architect;
    const [project, target, configuration] = builderConfig.options.browserTarget.split(':');
    const targetSpec = { project, target, configuration };
    const targetConfig = architect.getBuilderConfiguration(targetSpec);

    // Before we run the dev server grab the target builder so that we have it syncroniously
    // when we're ready to build the webpack config.
    return architect.getBuilderDescription(targetConfig).pipe(
      tap(targetDescription => this.targetBuilder = architect.getBuilder<BrowserBuilderSchema>(targetDescription, this.context)),
      switchMap(() => super.run(builderConfig))
    )
  }

  buildWebpackConfig(
    root: Path,
    projectRoot: Path,
    host: virtualFs.Host<Stats>,
    browserOptions: BrowserBuilderSchema,
  ) {
    // Check if we can use the generic webpack builder if so lets use it, otherwise we'll fall back to the DevServerBuilder's
    // implementation
    return (
      GenericWebpackBuilder.buildWebpackConfig(this.targetBuilder, root, projectRoot, host, browserOptions) ||
      super.buildWebpackConfig(root, projectRoot, host, browserOptions)
    );
  }
}

export default GenericDevServerBuilder;
