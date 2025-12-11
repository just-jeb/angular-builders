import type { Plugin } from 'esbuild';
import type { logging } from '@angular-devkit/core';
import { CustomEsbuildApplicationSchema, CustomEsbuildDevServerSchema, CustomEsbuildUnitTestSchema, PluginConfig } from './custom-esbuild-schema';
import { Target } from '@angular-devkit/architect';
export declare function loadPlugins(pluginConfig: PluginConfig[] | undefined, workspaceRoot: string, tsConfig: string, logger: logging.LoggerApi, builderOptions: CustomEsbuildApplicationSchema | CustomEsbuildDevServerSchema | CustomEsbuildUnitTestSchema, target: Target): Promise<Plugin[]>;
