
// Our very simple example plugin.
const HelloWorldPlugin = require("./build/hello-world.plugin");
/**
 * This is where you define a function that modifies your webpack config
 */
module.exports = (cfg) => {
  cfg.plugins.push(new HelloWorldPlugin());
  return cfg;
}
