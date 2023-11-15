const defineTextPlugin = {
  name: 'define-text',
  setup(build) {
    const options = build.initialOptions;

    options.define = {
      ...options.define,
      buildText: JSON.stringify('This text is provided during the compilation'),
    };
  },
};

module.exports = [defineTextPlugin];
