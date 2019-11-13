const HtmlWebpackPlugin = require('html-webpack-plugin');

function awaitable() {
  return Promise.resolve();
}

/**
 * This is where you define a function that modifies your webpack config
 */
module.exports = async cfg => {
  await awaitable();

  cfg.plugins.push(
    new HtmlWebpackPlugin({
      filename: 'footer.html',
      template: 'src/footer-template.html'
    })
  );

  return cfg;
};
