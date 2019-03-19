import { BuilderContext, targetFromTargetString, createBuilder } from '@angular-devkit/architect/src/index2';
import { DevServerBuilderOutput, DevServerBuilderSchema, ServerConfigTransformFn, serveWebpackBrowser } from '@angular-devkit/build-angular/src/dev-server/index2';
import { Observable, of, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Configuration } from 'webpack';
import { customWebpackConfigTransform, CustomWebpackBrowserSchema } from '../browser/index2';

//TODO: check why no devServer on Configuration while there is in webpack:
//https://webpack.js.org/configuration/dev-server/
const serverConfigTransform: ServerConfigTransformFn = (workspace, config: Configuration & { devServer: any }) => {
    return of(config.devServer || {});
}

export const serveCustomWebpackBrowser = (options: DevServerBuilderSchema, context: BuilderContext): Observable<DevServerBuilderOutput> => {
    async function setup() {
        const browserTarget = targetFromTargetString(options.browserTarget);
        return context.getTargetOptions(browserTarget) as unknown as CustomWebpackBrowserSchema;
    }

    return from(setup())
        .pipe(switchMap(browserOptions => serveWebpackBrowser(options, context, {
            browserConfig: customWebpackConfigTransform(browserOptions),
            serverConfig: serverConfigTransform
        })))
}

export default createBuilder<DevServerBuilderSchema, DevServerBuilderOutput>(serveCustomWebpackBrowser);