import * as path from 'node:path';
import * as url from 'node:url';

import { registerTsProject } from './register-ts-project';

/**
 * This uses a dynamic import to load a module which may be ESM.
 * CommonJS code can load ESM code via a dynamic import. Unfortunately, TypeScript
 * will currently, unconditionally downlevel dynamic import into a require call.
 * require calls cannot load ESM code and will result in a runtime error. To workaround
 * this, a Function constructor is used to prevent TypeScript from changing the dynamic import.
 * Once TypeScript provides support for keeping the dynamic import this workaround can
 * be dropped.
 *
 * @param modulePath The path of the module to load.
 * @returns A Promise that resolves to the dynamically imported module.
 */
function loadEsmModule<T>(modulePath: string | URL): Promise<T> {
  return new Function('modulePath', `return import(modulePath);`)(modulePath) as Promise<T>;
}

/**
 * Loads CJS and ESM modules based on extension
 */
export async function loadModule<T>(modulePath: string, tsConfig: string): Promise<T> {
  switch (path.extname(modulePath)) {
    case '.mjs':
      // Load the ESM configuration file using the TypeScript dynamic import workaround.
      // Once TypeScript provides support for keeping the dynamic import this workaround can be
      // changed to a direct dynamic import.
      return (await loadEsmModule<{ default: T }>(url.pathToFileURL(modulePath))).default;

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
          return (await loadEsmModule<{ default: T }>(url.pathToFileURL(modulePath))).default;
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
          return (await loadEsmModule<{ default: T }>(url.pathToFileURL(modulePath))).default;
        }

        throw e;
      }
  }
}
