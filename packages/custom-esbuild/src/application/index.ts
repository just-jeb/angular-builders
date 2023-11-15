import { BuilderContext, createBuilder } from '@angular-devkit/architect';
import { buildApplication } from '@angular-devkit/build-angular';
import { getSystemPath, json, normalize } from '@angular-devkit/core';
import { from, switchMap } from 'rxjs';
import type { Plugin } from 'esbuild';

import { loadModules } from '../load-modules';
import { CustomEsbuildApplicationSchema } from '../custom-esbuild-schema';

export function buildCustomEsbuildApplication(
  options: CustomEsbuildApplicationSchema,
  context: BuilderContext
) {
  const workspaceRoot = normalize(context.workspaceRoot);
  const tsConfig = `${getSystemPath(workspaceRoot)}/${options.tsConfig}`;

  return from(loadModules<Plugin>(workspaceRoot, options.plugins, tsConfig, context.logger)).pipe(
    switchMap(plugins => buildApplication(options, context, plugins))
  );
}

export default createBuilder<json.JsonObject & CustomEsbuildApplicationSchema>(
  buildCustomEsbuildApplication
);
