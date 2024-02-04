import * as path from 'node:path';
import type { Plugin } from 'esbuild';
import type { logging } from '@angular-devkit/core';
import { loadModule } from '@angular-builders/common';

export async function loadPlugins(
  paths: string[] | undefined,
  workspaceRoot: string,
  tsConfig: string,
  logger: logging.LoggerApi
): Promise<Plugin[]> {
  const plugins = await Promise.all(
    (paths || []).map(pluginPath =>
      loadModule<Plugin | Plugin[]>(path.join(workspaceRoot, pluginPath), tsConfig, logger)
    )
  );

  return plugins.flat();
}
