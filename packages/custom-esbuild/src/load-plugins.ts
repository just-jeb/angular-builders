import type { Plugin } from 'esbuild';
import type { Path, logging } from '@angular-devkit/core';

import { loadModule } from './utils';

export async function loadPlugins(
  paths: string[] | undefined,
  workspaceRoot: Path,
  tsConfig: string,
  logger: logging.LoggerApi
): Promise<Plugin[]> {
  const plugins = await Promise.all(
    (paths || []).map(path => loadModule<Plugin | Plugin[]>(workspaceRoot, path, tsConfig, logger))
  );

  return plugins.flat();
}
