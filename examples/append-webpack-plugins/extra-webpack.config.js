
// Our very simple example plugin.
const BuildStampPlugin = require('./build/BuildStampPlugin');

/**
 * This is where you define your additional webpack configuration items to be appended to
 * the end of the webpack config.
 */
module.exports = {
  plugins: [
    new BuildStampPlugin()
  ]
};
