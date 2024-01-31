import * as path from 'node:path';
import { BuilderContext, createBuilder, targetFromTargetString } from '@angular-devkit/architect';
import {
  DevServerBuilderOptions,
  DevServerBuilderOutput,
  executeDevServerBuilder,
} from '@angular-devkit/build-angular';
import { IndexHtmlTransform } from '@angular-devkit/build-angular/src/utils/index-file/index-html-generator';
import { getSystemPath, json, normalize } from '@angular-devkit/core';
import { Observable, from, switchMap } from 'rxjs';
import type { Plugin } from 'esbuild';
import type { Connect } from 'vite';

import { loadModule } from '../utils';
import { patchBuilderContext } from './patch-builder-context';
import {
  CustomEsbuildApplicationSchema,
  CustomEsbuildDevServerSchema,
} from '../custom-esbuild-schema';

export function executeCustomDevServerBuilder(
  options: CustomEsbuildDevServerSchema,
  context: BuilderContext
): Observable<DevServerBuilderOutput> {
  const buildTarget = targetFromTargetString(
    // `browserTarget` has been deprecated.
    options.buildTarget ?? options.browserTarget!
  );

  async function getBuildTargetOptions() {
    return (await context.getTargetOptions(
      buildTarget
    )) as unknown as CustomEsbuildApplicationSchema;
  }

  const workspaceRoot = normalize(context.workspaceRoot);

  return from(getBuildTargetOptions()).pipe(
    switchMap(async buildOptions => {
      const tsConfig = path.join(getSystemPath(workspaceRoot), buildOptions.tsConfig);

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

      const indexHtmlTransformer: IndexHtmlTransform = buildOptions.indexHtmlTransformer
        ? await loadModule(
            workspaceRoot,
            buildOptions.indexHtmlTransformer,
            tsConfig,
            context.logger
          )
        : undefined;

      patchBuilderContext(context, buildTarget);

      return {
        transforms: { indexHtml: indexHtmlTransformer },
        extensions: { middleware, buildPlugins },
      };
    }),
    switchMap(({ transforms, extensions }) =>
      executeDevServerBuilder(options, context, transforms, extensions)
    )
  );
}

export default createBuilder<DevServerBuilderOptions & json.JsonObject>(
  executeCustomDevServerBuilder
);
