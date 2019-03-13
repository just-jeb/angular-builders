/**
 * Created by Evgeny Barabanov on 28/06/2018.
 */

import {BuilderContext} from '@angular-devkit/architect';
import {BrowserBuilder, NormalizedBrowserBuilderSchema} from '@angular-devkit/build-angular';
import {Path, virtualFs} from '@angular-devkit/core';
import * as fs from 'fs';
import {CustomWebpackSchema} from "../custom-webpack-schema";
import {CustomWebpackBuilder} from "../custom-webpack-builder";
import {Configuration} from "webpack";

export interface NormalizedCustomWebpackBrowserBuildSchema extends NormalizedBrowserBuilderSchema, CustomWebpackSchema {
}

export class CustomWebpackBrowserBuilder extends BrowserBuilder {

  constructor(context: BuilderContext) {
    super(context);
  }

  buildWebpackConfig(root: Path,
                     projectRoot: Path,
                     host: virtualFs.Host<fs.Stats>,
                     options: NormalizedCustomWebpackBrowserBuildSchema): Configuration {
	  const browserWebpackConfig = super.buildWebpackConfig(root, projectRoot, host, options);
	  return CustomWebpackBuilder.buildWebpackConfig(root, options.customWebpackConfig, browserWebpackConfig, options);
  }
}

export default CustomWebpackBrowserBuilder;
