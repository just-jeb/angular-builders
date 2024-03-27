import type { Plugin, PluginBuild } from 'esbuild';

function defineTitleByOptionPlugin(pluginOptions: {title: string}): Plugin {
  return {
    name: 'define-title',
    setup(build: PluginBuild) {
      const options = build.initialOptions;
      options.define!['titleByOption'] = JSON.stringify(pluginOptions.title);
    },
  };
};

export default defineTitleByOptionPlugin;
