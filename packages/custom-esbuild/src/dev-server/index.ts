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

import { loadModules } from '../load-modules';
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
    switchMap(buildOptions => {
      const tsConfig = `${getSystemPath(workspaceRoot)}/${buildOptions.tsConfig}`;

      return Promise.all([
        // https://github.com/angular/angular-cli/pull/26212/files#diff-a99020cbdb97d20b2bc686bcb64b31942107d56db06fd880171b0a86f7859e6eR52
        loadModules<Connect.NextHandleFunction>(
          workspaceRoot,
          options.middlewares,
          tsConfig,
          context.logger
        ),

        loadModules<Plugin>(workspaceRoot, buildOptions.plugins, tsConfig, context.logger),
      ]);
    }),
    switchMap(([middlewares, plugins]) =>
      executeDevServerBuilder(
        options,
        context,
        /* transforms */ {},
        {
          buildPlugins: plugins,
          middleware: middlewares,
        }
      )
    )
  );
}

export default createBuilder<DevServerBuilderOptions & json.JsonObject>(
  executeCustomDevServerBuilder
);
