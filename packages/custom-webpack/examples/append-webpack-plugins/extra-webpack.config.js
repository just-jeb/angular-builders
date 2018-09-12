
// Our very simple example plugin.
const HelloWorldPlugin = require("./build/hello-world.plugin");
/**
 * This is where you define your additional webpack configuration items to be appended to
 * the end of the webpack config.
 */
module.exports = {
  plugins: [
    new HelloWorldPlugin()
  ]
};
