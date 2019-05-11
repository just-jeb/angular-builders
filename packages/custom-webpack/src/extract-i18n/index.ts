/**
 * Created by Pat Nolan on 10/05/2019.
 */

import {BuilderContext} from '@angular-devkit/architect';
import {ExtractI18nBuilder, NormalizedBrowserBuilderSchema} from '@angular-devkit/build-angular';
import {Path, virtualFs} from '@angular-devkit/core';
import * as fs from 'fs';
import {CustomWebpackSchema} from "../custom-webpack-schema";
import {CustomWebpackBuilder} from "../custom-webpack-builder";
import {Configuration} from "webpack";

export interface NormalizedCustomWebpackExtractI18nBuildSchema extends NormalizedBrowserBuilderSchema, CustomWebpackSchema {
}

export class CustomWebpackExtractI18nBuilder extends ExtractI18nBuilder {

  constructor(context: BuilderContext) {
	  super(context);
	  context.logger.log('info', 'CustomWebpackExtractI18nBuilder has been constructed');
  }

  buildWebpackConfig(root: Path,
                     projectRoot: Path,
                     options: NormalizedCustomWebpackExtractI18nBuildSchema): Configuration {
		this.context.logger.log('info', 'This is a custom build');
											 const browserWebpackConfig = super.buildWebpackConfig(root, projectRoot, options);
											 this.context.logger.log('info', 'A browserWebpackConfig has been created');
											 return CustomWebpackBuilder.buildWebpackConfig(root, options.customWebpackConfig, browserWebpackConfig, options);
  }
}

export default CustomWebpackExtractI18nBuilder;
