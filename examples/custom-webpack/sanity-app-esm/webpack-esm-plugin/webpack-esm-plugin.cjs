'use strict';
class WebpackEsmPlugin {
  apply(compiler) {
    console.error('hello from the WebpackEsmPlugin');
  }
}
module.exports = { WebpackEsmPlugin };
