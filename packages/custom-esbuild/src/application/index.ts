import * as path from 'node:path';
import { BuilderContext, createBuilder } from '@angular-devkit/architect';
import { buildApplication } from '@angular-devkit/build-angular';
import { getSystemPath, json, normalize } from '@angular-devkit/core';
import type { ApplicationBuilderExtensions } from '@angular/build/src/builders/application/options';
import { defer, switchMap } from 'rxjs';
import { loadModule } from '@angular-builders/common';

import { loadPlugins } from '../load-plugins';
import { CustomEsbuildApplicationSchema } from '../custom-esbuild-schema';

export function buildCustomEsbuildApplication(
  options: CustomEsbuildApplicationSchema,
  context: BuilderContext
) {
  const workspaceRoot = getSystemPath(normalize(context.workspaceRoot));
  const tsConfig = path.join(workspaceRoot, options.tsConfig);

  return defer(async () => {
    const codePlugins = await loadPlugins(options.plugins, workspaceRoot, tsConfig, context.logger);

    const indexHtmlTransformer = options.indexHtmlTransformer
      ? await loadModule(
          path.join(workspaceRoot, options.indexHtmlTransformer),
          tsConfig,
          context.logger
        )
      : undefined;

    return { codePlugins, indexHtmlTransformer } as ApplicationBuilderExtensions;
  }).pipe(switchMap(extensions => buildApplication(options, context, extensions)));
}

export default createBuilder<json.JsonObject & CustomEsbuildApplicationSchema>(
  buildCustomEsbuildApplication
);
