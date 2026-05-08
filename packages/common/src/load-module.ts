import * as path from 'node:path';
import * as url from 'node:url';
import * as fs from 'node:fs';
import type { logging } from '@angular-devkit/core';

const _tsNodeRegister = (() => {
  let lastTsConfig: string | undefined;
  let lastEsmMode: boolean | undefined;
  return (tsConfig: string, logger: logging.LoggerApi, esmMode: boolean = false) => {
    // Check if the function was previously called with the same tsconfig
    if (lastTsConfig && lastTsConfig !== tsConfig) {
      logger.warn(`Trying to register ts-node again with a different tsconfig - skipping the registration.
                   tsconfig 1: ${lastTsConfig}
                   tsconfig 2: ${tsConfig}`);
    }

    if (lastTsConfig) {
      return;
    }

    lastTsConfig = tsConfig;
    lastEsmMode = esmMode;

    const registerOptions: any = {
      project: tsConfig,
      compilerOptions: {
        module: esmMode ? 'ESNext' : 'CommonJS',
        // We deliberately do NOT override moduleResolution here.
        // The user's tsconfig moduleResolution setting (node, bundler, node16, etc.) is preserved.
        // TypeScript allows moduleResolution:bundler with module:CommonJS, so type checking
        // works correctly for all moduleResolution values — including 'bundler', which supports
        // subpath package exports (e.g. '@angular/core/primitives/di').
        // Overriding moduleResolution to 'node' (as was done previously) was the root cause of
        // issue https://github.com/just-jeb/angular-builders/issues/2025: it prevented TypeScript
        // from resolving subpath exports, causing TS2307 errors at build time.
        types: [
          'node', // NOTE: `node` is added so user configs can use Node.js globals (process, __dirname, etc.)
        ],
      },
    };

    // If ESM mode is detected, register with experimentalEsm flag
    if (esmMode) {
      registerOptions.experimentalEsm = true;
    }

    loadTsNode().register(registerOptions);

    const tsConfigPaths = loadTsConfigPaths();
    const result = tsConfigPaths.loadConfig(tsConfig);
    // The `loadConfig` returns a `ConfigLoaderResult` which must be guarded with
    // the `resultType` check.
    if (result.resultType === 'success') {
      const { absoluteBaseUrl: baseUrl, paths } = result;
      if (baseUrl && paths) {
        tsConfigPaths.register({ baseUrl, paths });
      }
    }
  };
})();

/**
 * Detect if the workspace is configured for ESM by checking for type: "module" in workspace package.json
 */
function isEsmWorkspace(tsConfigPath: string): boolean {
  try {
    // Find workspace root by walking up from tsConfig location
    let currentDir = path.dirname(tsConfigPath);
    const root = path.parse(currentDir).root;

    while (currentDir !== root) {
      const pkgPath = path.join(currentDir, 'package.json');
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        return pkg.type === 'module';
      }
      currentDir = path.dirname(currentDir);
    }
  } catch {
    // If we can't detect, default to CJS
  }

  return false;
}

/**
 * check for TS node registration
 * @param file: file name or file directory are allowed
 */
function tsNodeRegister(file: string = '', tsConfig: string, logger: logging.LoggerApi) {
  if (file?.endsWith('.ts')) {
    // Register TS compiler lazily, with ESM detection
    const esmMode = isEsmWorkspace(tsConfig);
    _tsNodeRegister(tsConfig, logger, esmMode);
  }
}

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
export async function loadModule<T>(
  modulePath: string,
  tsConfig: string,
  logger: logging.LoggerApi
): Promise<T> {
  tsNodeRegister(modulePath, tsConfig, logger);

  switch (path.extname(modulePath)) {
    case '.mjs':
      // Load the ESM configuration file using the TypeScript dynamic import workaround.
      // Once TypeScript provides support for keeping the dynamic import this workaround can be
      // changed to a direct dynamic import.
      return (await loadEsmModule<{ default: T }>(url.pathToFileURL(modulePath))).default;
    case '.cjs':
      return require(modulePath);
    case '.ts':
      try {
        // If it's a TS file then there are 2 cases for exporting an object.
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
      }
    //.js
    default:
      // The file could be either CommonJS or ESM.
      // CommonJS is tried first then ESM if loading fails.
      try {
        return require(modulePath).default || require(modulePath);
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

/**
 * Loads `ts-node` lazily. Moved to a separate function to declare
 * a return type, more readable than an inline variant.
 */
function loadTsNode(): typeof import('ts-node') {
  return require('ts-node');
}

/**
 * Loads `tsconfig-paths` lazily. Moved to a separate function to declare
 * a return type, more readable than an inline variant.
 */
function loadTsConfigPaths(): typeof import('tsconfig-paths') {
  return require('tsconfig-paths');
}
