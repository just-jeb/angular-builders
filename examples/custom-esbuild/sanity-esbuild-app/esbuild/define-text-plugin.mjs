const defineTextPlugin = {
  name: 'define-text',
  setup(build) {
    const options = build.initialOptions;
    options.define.buildText = JSON.stringify('This text is provided during the compilation');
  },
};

export default defineTextPlugin;
