import { Path, getSystemPath, logging } from '@angular-devkit/core';

import { loadModule, tsNodeRegister } from './utils';

/**
 * This requires a generic type since the function is unaware of
 * the interface it's trying to load. We load only the module content
 * and always return an empty list if the list of paths is not provided.
 */
export function loadModules<T>(
  workspaceRoot: Path,
  paths: string[] | undefined,
  tsConfig: string,
  logger: logging.LoggerApi
): Promise<T[]> {
  paths ||= [];

  return Promise.all(
    paths.map(path => {
      const modulePath = `${getSystemPath(workspaceRoot)}/${path}`;
      tsNodeRegister(modulePath, tsConfig, logger);
      return loadModule<T>(modulePath);
    })
  );
}
