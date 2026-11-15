import { loadModule } from '@angular-builders/common';
import { logging } from '@angular-devkit/core';
import { Target } from '@angular-devkit/architect';
import type { IndexHtmlTransform } from '@angular/build/private';
import { CustomEsbuildApplicationSchema } from './custom-esbuild-schema';

export async function loadIndexHtmlTransformer(
  indexHtmlTransformerPath: string,
  tsConfig: string,
  logger: logging.LoggerApi,
  target: Target,
  options: CustomEsbuildApplicationSchema
): Promise<IndexHtmlTransform> {
  const transformer = await loadModule<
    (
      indexHtml: string,
      target: Target,
      options: CustomEsbuildApplicationSchema
    ) => string | Promise<string>
  >(indexHtmlTransformerPath, tsConfig, logger);
  return async (indexHtml: string) => transformer(indexHtml, target, options);
}
