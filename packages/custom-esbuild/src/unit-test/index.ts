import * as path from 'node:path';
import { BuilderContext, createBuilder, targetFromTargetString } from '@angular-devkit/architect';
import { executeUnitTestBuilder, UnitTestBuilderOptions } from '@angular/build';
import { getSystemPath, json, normalize } from '@angular-devkit/core';
import { from, switchMap } from 'rxjs';

import { loadPlugins } from '../load-plugins';
import {
  CustomEsbuildApplicationSchema,
  CustomEsbuildUnitTestSchema,
} from '../custom-esbuild-schema';

export function executeCustomEsbuildUnitTestBuilder(
  options: CustomEsbuildUnitTestSchema,
  context: BuilderContext
) {
  if (Array.isArray(options.browsers) && !options.browsers.length) {
    delete options.browsers;
  }

  const buildTarget = targetFromTargetString(options.buildTarget);

  async function getBuildTargetOptions() {
    return (await context.getTargetOptions(
      buildTarget
    )) as unknown as CustomEsbuildApplicationSchema;
  }

  const workspaceRoot = getSystemPath(normalize(context.workspaceRoot));
  const tsConfig = path.join(workspaceRoot, options.tsConfig);

  return from(getBuildTargetOptions()).pipe(
    switchMap(async buildOptions => {
      const codePlugins = await loadPlugins(
        buildOptions.plugins,
        workspaceRoot,
        tsConfig,
        context.logger,
        options,
        context.target
      );

      return { codePlugins };
    }),
    switchMap(extensions =>
      executeUnitTestBuilder(
        { ...options, runner: 'vitest' as UnitTestBuilderOptions['runner'] },
        context,
        extensions
      )
    )
  );
}

export default createBuilder<json.JsonObject & CustomEsbuildUnitTestSchema>(
  executeCustomEsbuildUnitTestBuilder
);
