import { Configuration } as webpack from 'webpack';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';

/**
 * This is where you define a function that modifies your webpack config
 */
export default (cfg: Configuration) => {
  cfg.plugins.push(
    new HtmlWebpackPlugin({
      filename: 'footer.html',
      template: 'src/footer-template.html',
    })
  );

  return cfg;
};
