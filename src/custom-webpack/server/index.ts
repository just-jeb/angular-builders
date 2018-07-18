/**
 * Created by Evgeny Barabanov on 28/06/2018.
 */

import {BuilderContext} from '@angular-devkit/architect';
import {CustomWebpackServerBuildSchema} from './schema';
import {ServerBuilder} from '@angular-devkit/build-angular';
import {getSystemPath, Path, virtualFs} from '@angular-devkit/core';
import * as fs from 'fs';
import {BuildWebpackServerSchema} from '@angular-devkit/build-angular/src/server/schema';

const webpackMerge = require('webpack-merge');

export class CustomWebpackServerBuilder extends ServerBuilder {

  constructor(public context: BuilderContext) {
    super(context);
  }
  buildWebpackConfig(root: Path,
                     projectRoot: Path,
                     host: virtualFs.Host<fs.Stats>,
                     options: BuildWebpackServerSchema) {
    const opt = options as CustomWebpackServerBuildSchema;
    const webpackConfigPath = opt.webpackConfigPath || 'webpack.config.js';
    const customWebpackConfig = require(`${getSystemPath(root)}/${webpackConfigPath}`);
    const browserWebpackConfig = super.buildWebpackConfig(root, projectRoot, host, options);
    return webpackMerge.strategy(opt.mergeStrategy || {})([browserWebpackConfig, customWebpackConfig]);
  }
}

export default CustomWebpackServerBuilder;
