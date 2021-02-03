import { Configuration, DefinePlugin } from 'webpack';
import { CustomWebpackBrowserSchema, TargetOptions } from '@angular-builders/custom-webpack';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import { version } from '@project';

/**
 * This is where you define a function that modifies your webpack config
 */
export default (
  cfg: Configuration,
  opts: CustomWebpackBrowserSchema,
  targetOptions: TargetOptions
) => {
  cfg.plugins.push(
    new HtmlWebpackPlugin({
      filename: 'footer.html',
      template: 'src/footer-template.html',
    }),
    new DefinePlugin({
      APP_VERSION: JSON.stringify(version),
    })
  );

  return cfg;
};
