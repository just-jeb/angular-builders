import { BuilderContext, createBuilder, targetFromTargetString } from '@angular-devkit/architect';
import {
  DevServerBuilderOptions,
  DevServerBuilderOutput,
  executeDevServerBuilder,
} from '@angular-devkit/build-angular';
import { getSystemPath, json, normalize } from '@angular-devkit/core';
import { Observable, from, switchMap } from 'rxjs';
import type { Plugin } from 'esbuild';
import type { Connect } from 'vite';

import { loadModule } from '../utils';
import {
  CustomEsbuildApplicationSchema,
  CustomEsbuildDevServerSchema,
} from '../custom-esbuild-schema';

export function executeCustomDevServerBuilder(
  options: CustomEsbuildDevServerSchema,
  context: BuilderContext
): Observable<DevServerBuilderOutput> {
  async function getBuildTargetOptions() {
    const buildTarget = targetFromTargetString(
      // `browserTarget` has been deprecated.
      options.buildTarget ?? options.browserTarget!
    );

    return (await context.getTargetOptions(
      buildTarget
    )) as unknown as CustomEsbuildApplicationSchema;
  }

  const workspaceRoot = normalize(context.workspaceRoot);

  return from(getBuildTargetOptions()).pipe(
    switchMap(async buildOptions => {
      const tsConfig = `${getSystemPath(workspaceRoot)}/${buildOptions.tsConfig}`;

      const middleware = await Promise.all(
        (options.middlewares || []).map(path =>
          // https://github.com/angular/angular-cli/pull/26212/files#diff-a99020cbdb97d20b2bc686bcb64b31942107d56db06fd880171b0a86f7859e6eR52
          loadModule<Connect.NextHandleFunction>(workspaceRoot, path, tsConfig, context.logger)
        )
      );

      const buildPlugins = await Promise.all(
        (buildOptions.plugins || []).map(path =>
          loadModule<Plugin>(workspaceRoot, path, tsConfig, context.logger)
        )
      );

      return { middleware, buildPlugins };
    }),
    switchMap(extensions =>
      executeDevServerBuilder(options, context, /* transforms */ {}, extensions)
    )
  );
}

export default createBuilder<DevServerBuilderOptions & json.JsonObject>(
  executeCustomDevServerBuilder
);
