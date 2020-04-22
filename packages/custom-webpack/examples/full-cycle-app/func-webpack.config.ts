import { Configuration } from 'webpack';
import { CustomWebpackBrowserSchema, TargetOptions } from '@angular-builders/custom-webpack';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';

/**
 * This is where you define a function that modifies your webpack config
 */
export default (cfg: Configuration, opts: CustomWebpackBrowserSchema, targetOptions: TargetOptions) => {
  cfg.plugins.push(
    new HtmlWebpackPlugin({
      filename: 'footer.html',
      template: 'src/footer-template.html',
    })
  );

  return cfg;
};
