
const HtmlWebpackPlugin = require('html-webpack-plugin');
/**
 * This is where you define a function that modifies your webpack config
 */
module.exports = (cfg) => {
  cfg.plugins.push(new HtmlWebpackPlugin({ 
    filename: 'footer.html',
    template: 'src/footer-template.html'
  }));
  return cfg;
}
