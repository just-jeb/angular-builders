import { BuilderContext, targetFromTargetString, createBuilder } from '@angular-devkit/architect/src/index2';
import { DevServerBuilderOutput, DevServerBuilderSchema, ServerConfigTransformFn, serveWebpackBrowser, buildServerConfig } from '@angular-devkit/build-angular/src/dev-server/index2';
import { Observable, of, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Configuration } from 'webpack';
import { customWebpackConfigTransformFactory, CustomWebpackBrowserSchema } from '../browser/index2';
import { Configuration as WebpackDevServerConfig } from 'webpack-dev-server';
import { mergeConfigs } from "../webpack-config-merger";

type ServerConfigTransformFnFactory = (options: DevServerBuilderSchema,
    browserOptions: CustomWebpackBrowserSchema, context: BuilderContext) => ServerConfigTransformFn

export const serverConfigTransformFactory: ServerConfigTransformFnFactory = (options, browserOptions, context) =>
    ({ root }, config: Configuration): Observable<WebpackDevServerConfig> => {
        const originalConfig = buildServerConfig(root, options, browserOptions, context.logger);
        const {devServer} = mergeConfigs(config, {devServer: originalConfig});
        return of(devServer);
    }

export const serveCustomWebpackBrowser = (options: DevServerBuilderSchema, context: BuilderContext): Observable<DevServerBuilderOutput> => {
    async function setup() {
        const browserTarget = targetFromTargetString(options.browserTarget);
        return context.getTargetOptions(browserTarget) as unknown as CustomWebpackBrowserSchema;
    }

    return from(setup())
        .pipe(switchMap(browserOptions => serveWebpackBrowser(options, context, {
            browserConfig: customWebpackConfigTransformFactory(browserOptions),
            serverConfig: serverConfigTransformFactory(options, browserOptions, context)
        })))
}

export default createBuilder<DevServerBuilderSchema, DevServerBuilderOutput>(serveCustomWebpackBrowser);