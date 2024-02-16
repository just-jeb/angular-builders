import * as path from 'node:path';
import type { Plugin } from 'esbuild';
import type { logging } from '@angular-devkit/core';
import { loadModule } from '@angular-builders/common';
import { PluginConfig } from './custom-esbuild-schema';

export async function loadPlugins(
  pluginConfig: PluginConfig[] | undefined,
  workspaceRoot: string,
  tsConfig: string,
  logger: logging.LoggerApi,
): Promise<Plugin[]> {
  const plugins = await Promise.all(
    (pluginConfig || []).map(async pluginConfig => {
        if (typeof pluginConfig === 'string') {
          return loadModule<Plugin | Plugin[]>(path.join(workspaceRoot, pluginConfig), tsConfig, logger);
        } else {
          const pluginFactory = await loadModule<(...args: any[]) => Plugin>(path.join(workspaceRoot, pluginConfig.path), tsConfig, logger);
          return pluginFactory(pluginConfig.options);
        }

      },
    ),
  );

  return plugins.flat();
}
