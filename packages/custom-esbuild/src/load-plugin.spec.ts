import { loadPlugins } from './load-plugins';
import { Target } from '@angular-devkit/architect';
import { Plugin } from 'esbuild';
import { CustomEsbuildApplicationSchema } from './custom-esbuild-schema';

describe('loadPlugin', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('should load a plugin without configuration', async () => {
    const mockPlugin = { name: 'mock' } as Plugin;
    jest.mock('test/test-plugin.js', () => mockPlugin, { virtual: true });
    const plugin = await loadPlugins(
      ['test-plugin.js'],
      './test',
      './tsconfig.json',
      null as any,
      {} as any,
      {} as any
    );

    expect(plugin).toEqual([mockPlugin]);
  });

  it('should load a plugin factory without configuration and pass options and target', async () => {
    const mockPlugin = { name: 'mock' } as Plugin;
    const pluginFactory = jest.fn().mockReturnValue(mockPlugin);
    const mockOptions = { tsConfig: './tsconfig.json' } as CustomEsbuildApplicationSchema;
    const mockTarget = { target: 'test' } as Target;
    jest.mock('test/test-plugin.js', () => pluginFactory, { virtual: true });
    const plugin = await loadPlugins(
      ['test-plugin.js'],
      './test',
      './tsconfig.json',
      null as any,
      mockOptions,
      mockTarget
    );

    expect(pluginFactory).toHaveBeenCalledWith(mockOptions, mockTarget);
    expect(plugin).toEqual([mockPlugin]);
  });

  it('should load a plugin with configuration', async () => {
    const pluginFactory = jest.fn();
    const mockOptions = { tsConfig: './tsconfig.json' } as CustomEsbuildApplicationSchema;
    const mockTarget = { target: 'test' } as Target;
    jest.mock('test/test-plugin.js', () => pluginFactory, { virtual: true });
    const plugin = await loadPlugins(
      [{ path: 'test-plugin.js', options: { test: 'test' } }],
      './test',
      './tsconfig.json',
      null as any,
      mockOptions,
      mockTarget
    );

    expect(pluginFactory).toHaveBeenCalledWith({ test: 'test' }, mockOptions, mockTarget);
    expect(plugin).toBeDefined();
  });
});
