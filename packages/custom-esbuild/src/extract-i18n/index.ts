import { BuilderContext, createBuilder } from '@angular-devkit/architect';
import type { ExtractI18nBuilderOptions } from '@angular-devkit/build-angular';
import { executeExtractI18nBuilder } from '@angular-devkit/build-angular';

export function buildCustomEsbuildExtractI18n(
  options: ExtractI18nBuilderOptions,
  context: BuilderContext
) {
  context.getBuilderNameForTarget = async (_) => {
    return '@angular-devkit/build-angular:application'
  };

  const originalGetTargetOptions = context.getTargetOptions;
  context.getTargetOptions = async (target) => {
    const options = await originalGetTargetOptions(target);
    delete options.indexHtmlTransformer;
    delete options.plugins;
    return options;
  };

  return executeExtractI18nBuilder(
    options,
    context
  )
}

export default createBuilder(
  buildCustomEsbuildExtractI18n
);
