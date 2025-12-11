import type { logging } from '@angular-devkit/core';
/**
 * Loads CJS and ESM modules based on extension
 */
export declare function loadModule<T>(modulePath: string, tsConfig: string, logger: logging.LoggerApi): Promise<T>;
