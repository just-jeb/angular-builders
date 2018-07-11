/**
 * Created by Evgeny Barabanov on 28/06/2018.
 */

import {BuilderContext} from '@angular-devkit/architect';
import {CustomWebpackDevServerBuildSchema} from './schema';
import {DevServerBuilder, NormalizedBrowserBuilderSchema} from '@angular-devkit/build-angular';
import {getSystemPath, Path, virtualFs} from '@angular-devkit/core';
import * as fs from 'fs';

const webpackMerge = require('webpack-merge');

export class CustomWebpackDevServerBuilder extends DevServerBuilder {

  constructor(public context: BuilderContext) {
    super(context);
  }
  buildWebpackConfig(root: Path,
                     projectRoot: Path,
                     host: virtualFs.Host<fs.Stats>,
                     options: NormalizedBrowserBuilderSchema) {

    const opt = options as CustomWebpackDevServerBuildSchema;
    const webpackConfigPath = opt.webpackConfigPath || 'webpack.config.js';
    const customWebpackConfig = require(`${getSystemPath(root)}/${webpackConfigPath}`);
    const browserWebpackConfig = super.buildWebpackConfig(root, projectRoot, host, options);
    
    return webpackMerge([browserWebpackConfig, customWebpackConfig]);
  }
}

export default CustomWebpackDevServerBuilder;
