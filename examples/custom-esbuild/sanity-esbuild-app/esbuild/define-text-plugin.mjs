const defineTitlePlugin = {
  name: 'define-title',
  setup(build) {
    const options = build.initialOptions;
    options.define.title = JSON.stringify('sanity-esbuild-app (compilation provided)');
  },
};

const defineSubtitlePlugin = {
  name: 'define-subtitle',
  setup(build) {
    const options = build.initialOptions;
    options.define.subtitle = JSON.stringify('sanity-esbuild-app subtitle (compilation provided)');
  },
};

export default [defineTitlePlugin, defineSubtitlePlugin];
