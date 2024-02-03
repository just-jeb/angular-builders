import type { Plugin, PluginBuild } from 'esbuild';

const defineTitlePlugin: Plugin = {
  name: 'define-title',
  setup(build: PluginBuild) {
    const options = build.initialOptions;
    options.define!['title'] = JSON.stringify('sanity-esbuild-app-esm (compilation provided)');
  },
};

const defineSubtitlePlugin: Plugin = {
  name: 'define-subtitle',
  setup(build: PluginBuild) {
    const options = build.initialOptions;
    options.define!['subtitle'] = JSON.stringify(
      'sanity-esbuild-app-esm subtitle (compilation provided)'
    );
  },
};

export default [defineTitlePlugin, defineSubtitlePlugin];
