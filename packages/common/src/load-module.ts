import * as path from 'node:path';
import * as url from 'node:url';

import { registerTsProject } from './register-ts-project';

/**
 * Loads CJS and ESM modules based on extension
 */
export async function loadModule<T>(modulePath: string, tsConfig: string): Promise<T> {
  const absoluteModulePath = url.pathToFileURL(modulePath).pathname;

  switch (path.extname(modulePath)) {
    case '.mjs':
      // Load the ESM configuration file using the TypeScript dynamic import workaround.
      // Once TypeScript provides support for keeping the dynamic import this workaround can be
      // changed to a direct dynamic import.
      return await import(absoluteModulePath).then(m => m.default);

    case '.cjs':
      return require(modulePath);

    case '.ts':
      const unregisterTsProject = registerTsProject(tsConfig);

      try {
        // If it's a TS file then there are 2 cases for exporing an object.
        // The first one is `export blah`, transpiled into `module.exports = { blah} `.
        // The second is `export default blah`, transpiled into `{ default: { ... } }`.
        return require(modulePath).default || require(modulePath);
      } catch (e: any) {
        if (e.code === 'ERR_REQUIRE_ESM') {
          // Load the ESM configuration file using the TypeScript dynamic import workaround.
          // Once TypeScript provides support for keeping the dynamic import this workaround can be
          // changed to a direct dynamic import.
          return await import(absoluteModulePath).then(m => m.default);
        }
        throw e;
      } finally {
        unregisterTsProject();
      }

    //.js
    default:
      // The file could be either CommonJS or ESM.
      // CommonJS is tried first then ESM if loading fails.
      try {
        return require(modulePath);
      } catch (e: any) {
        if (e.code === 'ERR_REQUIRE_ESM') {
          // Load the ESM configuration file using the TypeScript dynamic import workaround.
          // Once TypeScript provides support for keeping the dynamic import this workaround can be
          // changed to a direct dynamic import.
          return await import(absoluteModulePath).then(m => m.default);
        }

        throw e;
      }
  }
}
