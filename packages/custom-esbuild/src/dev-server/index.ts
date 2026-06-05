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

import type { Middleware } from './types';
import { loadPlugins } from '../load-plugins';
import { patchBuilderContext } from './patch-builder-context';
import {
  CustomEsbuildApplicationSchema,
  CustomEsbuildDevServerSchema,
} from '../custom-esbuild-schema';
import { loadIndexHtmlTransformer } from '../load-index-html-transformer';

export function executeCustomDevServerBuilder(
  options: CustomEsbuildDevServerSchema,
  context: BuilderContext
): Observable<DevServerBuilderOutput> {
  const buildTarget = targetFromTargetString(options.buildTarget);

  async function getBuildTargetOptions() {
    return (await context.getTargetOptions(
      buildTarget
    )) as unknown as CustomEsbuildApplicationSchema;
  }

  const workspaceRoot = getSystemPath(normalize(context.workspaceRoot));

  return from(getBuildTargetOptions()).pipe(
    switchMap(async buildOptions => {
      const tsConfig = path.join(workspaceRoot, buildOptions.tsConfig);

      const middleware: Middleware[] = [];

      // Not using `Promise.all` preserves the order of middlewares as they
      // are declared in the configuration list.
      for (const middlewarePath of options.middlewares || []) {
        // https://github.com/angular/angular-cli/pull/26212/files#diff-a99020cbdb97d20b2bc686bcb64b31942107d56db06fd880171b0a86f7859e6eR52
        middleware.push(
          await loadModule<Middleware>(
            path.join(workspaceRoot, middlewarePath),
            tsConfig,
            context.logger
          )
        );
      }

      const buildPlugins = await loadPlugins(
        buildOptions.plugins,
        workspaceRoot,
        tsConfig,
        context.logger,
        options,
        context.target
      );

      const indexHtmlTransformer = buildOptions.indexHtmlTransformer
        ? await loadIndexHtmlTransformer(
            path.join(workspaceRoot, buildOptions.indexHtmlTransformer),
            tsConfig,
            context.logger,
            context.target
          )
        : undefined;

      patchBuilderContext(context, buildTarget);

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
