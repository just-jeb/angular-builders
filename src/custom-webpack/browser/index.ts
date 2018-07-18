/**
 * Created by Evgeny Barabanov on 28/06/2018.
 */

import {BuilderContext} from '@angular-devkit/architect';
import {BrowserBuilder, NormalizedBrowserBuilderSchema} from '@angular-devkit/build-angular';
import {getSystemPath, Path, virtualFs} from '@angular-devkit/core';
import * as fs from 'fs';

const webpackMerge = require('webpack-merge');

export interface NormalizedCustomWebpackBrowserBuildSchema extends NormalizedBrowserBuilderSchema {
  webpackConfigPath?: string;
  mergeStrategy: { [key: string] : 'append' | 'prepend' | 'replace' }
}

export class CustomWebpackBrowserBuilder extends BrowserBuilder {

  constructor(context: BuilderContext) {
    super(context);
  }

  buildWebpackConfig(root: Path,
                     projectRoot: Path,
                     host: virtualFs.Host<fs.Stats>,
                     options: NormalizedCustomWebpackBrowserBuildSchema) {
    const webpackConfigPath = options.webpackConfigPath || 'webpack.config.js';
    const customWebpackConfig = require(`${getSystemPath(root)}/${webpackConfigPath}`);
    if (!customWebpackConfig) {
      throw Error('No custom webpack config path specified. The default path is ./webpack.config.js');
    }
    const browserWebpackCOnfig = super.buildWebpackConfig(root, projectRoot, host, options);
    return webpackMerge.strategy(options.mergeStrategy || {})([browserWebpackCOnfig, customWebpackConfig]);
  }
}

export default CustomWebpackBrowserBuilder;
