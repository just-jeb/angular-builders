import { loadPlugins } from './load-plugins';

describe('loadPlugin', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('should load a plugin without configuration', async () => {
    const pluginFactory = jest.fn();
    jest.mock('test/test-plugin.js', () => pluginFactory, { virtual: true });
    const plugin = await loadPlugins(['test-plugin.js'], './test', './tsconfig.json', null as any);

    expect(pluginFactory).not.toHaveBeenCalled();
    expect(plugin).toBeDefined();
  });

  it('should load a plugin with configuration', async () => {
    const pluginFactory = jest.fn();
    jest.mock('test/test-plugin.js', () => pluginFactory, { virtual: true });
    const plugin = await loadPlugins([{ path: 'test-plugin.js', options: { test: 'test' } }], './test', './tsconfig.json', null as any);

    expect(pluginFactory).toHaveBeenCalledWith({ test: 'test' });
    expect(plugin).toBeDefined();
  });
});
