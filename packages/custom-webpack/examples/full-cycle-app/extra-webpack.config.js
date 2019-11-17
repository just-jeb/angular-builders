const HtmlWebpackPlugin = require('html-webpack-plugin');
/**
 * This is where you define your additional webpack configuration items to be appended to
 * the end of the webpack config.
 */
module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'footer.html',
      template: 'src/footer-template.html',
    }),
  ],
};
