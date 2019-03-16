import { createBuilder } from '@angular-devkit/architect/src/index2';
import * as angularBrowserBuilder from '@angular-devkit/build-angular/src/browser/index2';
import { Schema as BrowserBuilderSchema } from '@angular-devkit/build-angular/src/browser/schema';
import { NormalizedBrowserBuilderSchema } from '@angular-devkit/build-angular/src/utils';
import { json, logging, Path } from '@angular-devkit/core';

const originalBuildWebpackConfig = angularBrowserBuilder.buildWebpackConfig;
Object.defineProperty(angularBrowserBuilder, 'buildWebpackConfig', 
{writable: true, value: (root: Path, projectRoot: Path, options: NormalizedBrowserBuilderSchema, logger: logging.LoggerApi) => {
  logger.info('Hi');
  return originalBuildWebpackConfig(root, projectRoot, options, logger);
}})

export default createBuilder<json.JsonObject & BrowserBuilderSchema>(angularBrowserBuilder.buildWebpackBrowser);
