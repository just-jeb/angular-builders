import * as path from 'node:path';
import { BuilderContext, createBuilder, targetFromTargetString } from '@angular-devkit/architect';
import {
  DevServerBuilderOptions,
  DevServerBuilderOutput,
  executeDevServerBuilder,
} from '@angular/build';
import { getSystemPath, json, normalize } from '@angular-devkit/core';
import { Observable, from, switchMap } from 'rxjs';
import { loadModule } from '@angular-builders/common';

import { loadPlugins } from '../load-plugins';
import {
  CustomEsbuildApplicationSchema,
  CustomEsbuildDevServerSchema,
} from '../custom-esbuild-schema';
import { IndexHtmlTransform } from '@angular/build/private';

export function executeCustomDevServerBuilder(
  options: CustomEsbuildDevServerSchema,
  context: BuilderContext
): Observable<DevServerBuilderOutput> {
  const buildTarget = targetFromTargetString(
    options.buildTarget
  );

  async function getBuildTargetOptions() {
    return (await context.getTargetOptions(
      buildTarget
    )) as unknown as CustomEsbuildApplicationSchema;
  }

  const workspaceRoot = getSystemPath(normalize(context.workspaceRoot));

  return from(getBuildTargetOptions()).pipe(
    switchMap(async buildOptions => {
      const tsConfig = path.join(workspaceRoot, buildOptions.tsConfig);

      const middleware = await Promise.all(
        (options.middlewares || []).map(middlewarePath =>
          // https://github.com/angular/angular-cli/pull/26212/files#diff-a99020cbdb97d20b2bc686bcb64b31942107d56db06fd880171b0a86f7859e6eR52
          loadModule<any>(
            path.join(workspaceRoot, middlewarePath),
            tsConfig,
            context.logger
          )
        )
      );

      const buildPlugins = await loadPlugins(
        buildOptions.plugins,
        workspaceRoot,
        tsConfig,
        context.logger
      );

      const indexHtmlTransformer: IndexHtmlTransform = buildOptions.indexHtmlTransformer
        ? await loadModule(
            path.join(workspaceRoot, buildOptions.indexHtmlTransformer),
            tsConfig,
            context.logger
          )
        : undefined;

      // patchBuilderContext(context, buildTarget);

      return { middleware, buildPlugins, indexHtmlTransformer };
    }),
    switchMap((extensions) =>
      executeDevServerBuilder(options, context, extensions)
    )
  );
}

export default createBuilder<DevServerBuilderOptions & json.JsonObject>(
  executeCustomDevServerBuilder
);
