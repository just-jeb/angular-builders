import * as path from 'node:path';
import type { Plugin } from 'esbuild';
import { loadModule } from '@angular-builders/common';

export async function loadPlugins(
  paths: string[] | undefined,
  workspaceRoot: string,
  tsConfig: string
): Promise<Plugin[]> {
  const plugins = await Promise.all(
    (paths || []).map(pluginPath =>
      loadModule<Plugin | Plugin[]>(path.join(workspaceRoot, pluginPath), tsConfig)
    )
  );

  return plugins.flat();
}
