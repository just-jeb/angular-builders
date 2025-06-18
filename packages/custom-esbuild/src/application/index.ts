import * as path from 'node:path';
import { BuilderContext, createBuilder } from '@angular-devkit/architect';
import { buildApplication } from '@angular/build';
import { getSystemPath, json, normalize } from '@angular-devkit/core';
import { defer, switchMap } from 'rxjs';

import { loadPlugins } from '../load-plugins';
import { CustomEsbuildApplicationSchema } from '../custom-esbuild-schema';
import { loadIndexHtmlTransformer } from '../load-index-html-transformer';

export function buildCustomEsbuildApplication(
  options: CustomEsbuildApplicationSchema,
  context: BuilderContext
) {
  const workspaceRoot = getSystemPath(normalize(context.workspaceRoot));
  const tsConfig = path.join(workspaceRoot, options.tsConfig);

  return defer(async () => {
    const codePlugins = await loadPlugins(options.plugins, workspaceRoot, tsConfig, context.logger);

    const indexHtmlTransformer = options.indexHtmlTransformer
      ? await loadIndexHtmlTransformer(
          path.join(workspaceRoot, options.indexHtmlTransformer),
          tsConfig,
          context.logger,
          context.target
        )
      : undefined;

    return { codePlugins, indexHtmlTransformer };
  }).pipe(switchMap(extensions => buildApplication(options, context, extensions)));
}

export default createBuilder<json.JsonObject & CustomEsbuildApplicationSchema>(
  buildCustomEsbuildApplication
);
