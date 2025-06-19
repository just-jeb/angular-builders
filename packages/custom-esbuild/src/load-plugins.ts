import * as path from 'node:path';
import type { Plugin } from 'esbuild';
import type { logging } from '@angular-devkit/core';
import { loadModule } from '@angular-builders/common';
import {
  CustomEsbuildApplicationSchema,
  CustomEsbuildDevServerSchema,
  PluginConfig,
} from './custom-esbuild-schema';
import { Target } from '@angular-devkit/architect';

export async function loadPlugins(
  pluginConfig: PluginConfig[] | undefined,
  workspaceRoot: string,
  tsConfig: string,
  logger: logging.LoggerApi,
  builderOptions: CustomEsbuildApplicationSchema | CustomEsbuildDevServerSchema,
  target: Target
): Promise<Plugin[]> {
  const plugins = await Promise.all(
    (pluginConfig || []).map(async pluginConfig => {
      if (typeof pluginConfig === 'string') {
        const pluginsOrFactory = await loadModule<
          | Plugin
          | Plugin[]
          | ((
              options: CustomEsbuildApplicationSchema | CustomEsbuildDevServerSchema,
              target: Target
            ) => Plugin | Plugin[])
        >(path.join(workspaceRoot, pluginConfig), tsConfig, logger);
        if (typeof pluginsOrFactory === 'function') {
          return pluginsOrFactory(builderOptions, target);
        } else {
          return pluginsOrFactory;
        }
      } else {
        const pluginFactory = await loadModule<(...args: any[]) => Plugin>(
          path.join(workspaceRoot, pluginConfig.path),
          tsConfig,
          logger
        );
        return pluginFactory(pluginConfig.options, builderOptions, target);
      }
    })
  );

  return plugins.flat();
}
