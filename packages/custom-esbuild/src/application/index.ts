import { BuilderContext, createBuilder } from '@angular-devkit/architect';
import { buildApplication } from '@angular-devkit/build-angular';
import { getSystemPath, json, normalize } from '@angular-devkit/core';
import { ApplicationBuilderExtensions } from '@angular-devkit/build-angular/src/builders/application/options';
import { defer, switchMap } from 'rxjs';
import type { Plugin } from 'esbuild';

import { loadModule } from '../utils';
import { CustomEsbuildApplicationSchema } from '../custom-esbuild-schema';

export function buildCustomEsbuildApplication(
  options: CustomEsbuildApplicationSchema,
  context: BuilderContext
) {
  const workspaceRoot = normalize(context.workspaceRoot);
  const tsConfig = `${getSystemPath(workspaceRoot)}/${options.tsConfig}`;

  return defer(async () => {
    const paths = options.plugins || [];
    const codePlugins = await Promise.all(
      paths.map(path => loadModule<Plugin>(workspaceRoot, path, tsConfig, context.logger))
    );

    const indexHtmlTransformer = options.indexHtmlTransformer
      ? await loadModule(workspaceRoot, options.indexHtmlTransformer, tsConfig, context.logger)
      : undefined;

    return { codePlugins, indexHtmlTransformer } as ApplicationBuilderExtensions;
  }).pipe(switchMap(extensions => buildApplication(options, context, extensions)));
}

export default createBuilder<json.JsonObject & CustomEsbuildApplicationSchema>(
  buildCustomEsbuildApplication
);
