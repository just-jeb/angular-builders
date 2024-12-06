import { loadModule } from '@angular-builders/common';
import { logging } from '@angular-devkit/core';
import { Target } from '@angular-devkit/architect';
import type { IndexHtmlTransform } from '@angular/build/src/utils/index-file/index-html-generator';

export async function loadIndexHtmlTransformer(
  indexHtmlTransformerPath: string,
  tsConfig: string,
  logger: logging.LoggerApi,
  target: Target
): Promise<IndexHtmlTransform> {
  const transformer = await loadModule<(indexHtml: string, target: Target) => Promise<string>>(
    indexHtmlTransformerPath,
    tsConfig,
    logger
  );
  return (indexHtml: string) => transformer(indexHtml, target);
}
