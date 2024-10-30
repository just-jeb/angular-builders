import * as path from 'node:path';
import { BuilderContext, createBuilder } from '@angular-devkit/architect';
import { buildApplication } from '@angular/build';
import { getSystemPath, json, normalize } from '@angular-devkit/core';
import { defer, switchMap } from 'rxjs';
import { loadModule } from '@angular-builders/common';

import { loadPlugins } from '../load-plugins';
import { CustomEsbuildApplicationSchema } from '../custom-esbuild-schema';
import { IndexHtmlTransform } from '@angular/build/private';

export function buildCustomEsbuildApplication(
  options: CustomEsbuildApplicationSchema,
  context: BuilderContext
) {
  const workspaceRoot = getSystemPath(normalize(context.workspaceRoot));
  const tsConfig = path.join(workspaceRoot, options.tsConfig);

  return defer(async () => {
    const codePlugins = await loadPlugins(options.plugins, workspaceRoot, tsConfig, context.logger);

    const indexHtmlTransformer: IndexHtmlTransform = options.indexHtmlTransformer
      ? await loadModule(
          path.join(workspaceRoot, options.indexHtmlTransformer),
          tsConfig,
          context.logger
        )
      : undefined;

    return codePlugins;
  }).pipe(switchMap(plugins => buildApplication(options, context, plugins)));
}

export default createBuilder<json.JsonObject & CustomEsbuildApplicationSchema>(
  buildCustomEsbuildApplication
);
