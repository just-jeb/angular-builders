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

// Angular CLI only skips filling unset array options with `[]` for `@angular/build:*`
// builders. `@angular/build` treats an empty array as user-provided (e.g. `[]` for
// `coverageReporters` runs no reporter, `[]` for `reporters` discards the ones set in
// the Vitest config file and `[]` for `include` runs no tests), so an empty array the
// user did not write has to reach it as `undefined`, exactly as it does for
// `@angular/build:unit-test`.
//
// `context.getTargetOptions` returns the target's raw angular.json options (plus the
// active configurations) before that transform runs, so an option that is present
// there was written by the user and is kept as is, even when a CLI flag emptied it.
// The builder only ever sees the merged, validated options, so an empty array that
// arrives as an override from outside angular.json (a bare CLI flag such as
// `ng test --coverage-reporters`, or `scheduleTarget(target, { include: [] })`)
// cannot be told apart from a filled-in default and is dropped as if it were unset.
async function dropUnsetEmptyArrayOptions(
  options: CustomEsbuildUnitTestSchema,
  context: BuilderContext
) {
  const rawOptions: json.JsonObject =
    (context.target && (await context.getTargetOptions(context.target))) || {};

  for (const option of Object.keys(options) as (keyof CustomEsbuildUnitTestSchema)[]) {
    const value = options[option];

    if (Array.isArray(value) && !value.length && !Object.hasOwn(rawOptions, option)) {
      delete options[option];
    }
  }
}

export function executeCustomEsbuildUnitTestBuilder(
  options: CustomEsbuildUnitTestSchema,
  context: BuilderContext
) {
  const buildTarget = targetFromTargetString(options.buildTarget);

  async function getBuildTargetOptions() {
    return (await context.getTargetOptions(
      buildTarget
    )) as unknown as CustomEsbuildApplicationSchema;
  }

  const workspaceRoot = getSystemPath(normalize(context.workspaceRoot));
  const tsConfig = path.join(workspaceRoot, options.tsConfig);

  return from(dropUnsetEmptyArrayOptions(options, context)).pipe(
    switchMap(getBuildTargetOptions),
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
