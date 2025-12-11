import { logging } from '@angular-devkit/core';
import { Target } from '@angular-devkit/architect';
import type { IndexHtmlTransform } from '@angular/build/private';
export declare function loadIndexHtmlTransformer(indexHtmlTransformerPath: string, tsConfig: string, logger: logging.LoggerApi, target: Target): Promise<IndexHtmlTransform>;
