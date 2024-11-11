function defineTitleByOptionPlugin(pluginOptions) {
  return {
    name: 'define-title',
    setup(build) {
      const options = build.initialOptions;
      options.define.titleByOption = JSON.stringify(pluginOptions.title);
    },
  };
};

module.exports = defineTitleByOptionPlugin;
