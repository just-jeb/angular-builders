import { loadModule } from '@angular-builders/common';
import { Target } from '@angular-devkit/architect';
import type { IndexHtmlTransform } from '@angular/build/private';

export async function loadIndexHtmlTransformer(
  indexHtmlTransformerPath: string,
  tsConfig: string,
  target: Target
): Promise<IndexHtmlTransform> {
  const transformer = await loadModule<(indexHtml: string, target: Target) => Promise<string>>(
    indexHtmlTransformerPath,
    tsConfig
  );
  return (indexHtml: string) => transformer(indexHtml, target);
}
