import type { Plugin, PluginBuild } from 'esbuild';

const defineTextPlugin: Plugin = {
  name: 'define-text',
  setup(build: PluginBuild) {
    const options = build.initialOptions;
    options.define!['buildText'] = JSON.stringify('This text is provided during the compilation');
  },
};

export default defineTextPlugin;
