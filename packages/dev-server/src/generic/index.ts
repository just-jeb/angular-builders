import {Builder, BuilderConfiguration, BuilderContext, BuilderDescription, BuildEvent} from '@angular-devkit/architect';
import {
  BrowserBuilderSchema,
  DevServerBuilder,
  DevServerBuilderOptions,
  NormalizedBrowserBuilderSchema
} from '@angular-devkit/build-angular';
import {Path, virtualFs} from '@angular-devkit/core';
import {Observable} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';
import {Stats} from 'fs';
import {WebpackConfigRetriever} from '../webpack-config-retriever';
import {Configuration} from "webpack";
import {merge} from 'lodash';

export class GenericDevServerBuilder extends DevServerBuilder {

  private targetBuilder: Builder<any>;

  constructor(context: BuilderContext) {
    super(context);
  }

  run(builderConfig: BuilderConfiguration<DevServerBuilderOptions>): Observable<BuildEvent> {

    const architect = this.context.architect;
    const [project, target, configuration] = builderConfig.options.browserTarget.split(':');
    const targetSpec = {project, target, configuration};
    const targetConfig = architect.getBuilderConfiguration(targetSpec);

    // Before we run the dev server grab the target builder so that we have it synchronously
    // when we're ready to build the webpack config.
    return architect.getBuilderDescription(targetConfig).pipe(
      tap((targetDescription: BuilderDescription) => this.targetBuilder = architect.getBuilder<BrowserBuilderSchema>(targetDescription, this.context)),
      switchMap(() => super.run(builderConfig))
    )
  }

  buildWebpackConfig(
    root: Path,
    projectRoot: Path,
    host: virtualFs.Host<Stats>,
    browserOptions: NormalizedBrowserBuilderSchema,
  ): Configuration {
    // Check if we can use the generic webpack builder if so lets use it, otherwise we'll fall back to the DevServerBuilder's
    // implementation
    const webpackConfig = WebpackConfigRetriever.getTargetBuilderWebpackConfig(this.targetBuilder, root, projectRoot, host, browserOptions) ||
      super.buildWebpackConfig(root, projectRoot, host, browserOptions);
    //Hack to override private base method _buildServerConfig
    this['_buildServerConfig'] = this.buildServerConfig(webpackConfig['devServer']);
    return webpackConfig;
  }

  buildServerConfig = (devServerConfig: any) => (root: Path, projectRoot: Path, options: DevServerBuilderOptions, browserOptions: NormalizedBrowserBuilderSchema) => {
    const angularDevServerConfig = DevServerBuilder.prototype['_buildServerConfig'].call(this, root, options, browserOptions);
    if (devServerConfig) {
      merge(angularDevServerConfig, devServerConfig);
    }
    return angularDevServerConfig;
  }
}

export default GenericDevServerBuilder;
