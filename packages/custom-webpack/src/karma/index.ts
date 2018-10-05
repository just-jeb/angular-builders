/**
 * Created by Evgeny Barabanov on 05/10/2018.
 */

import {BuilderContext} from '@angular-devkit/architect';
import {KarmaBuilder, NormalizedKarmaBuilderSchema} from '@angular-devkit/build-angular';
import {Path, virtualFs} from '@angular-devkit/core';
import * as fs from 'fs';
import {CustomWebpackSchema} from "../custom-webpack-schema";
import {CustomWebpackBuilder} from "../custom-webpack-builder";

export interface NormalizedCustomWebpackBrowserBuildSchema extends NormalizedKarmaBuilderSchema, CustomWebpackSchema {
}

export class CustomWebpackKarmaBuilder extends KarmaBuilder {

  constructor(context: BuilderContext) {
    super(context);
    super['_buildWebpackConfig'] = this.buildWebpackConfig;
  }

  buildWebpackConfig(root: Path,
                     projectRoot: Path,
                     sourceRoot: Path,
                     host: virtualFs.Host<fs.Stats>,
                     options: NormalizedCustomWebpackBrowserBuildSchema) {
    const karmaConfig = KarmaBuilder.prototype['_buildWebpackConfig'].call(this, root, projectRoot, sourceRoot, host, options);
	  return CustomWebpackBuilder.buildWebpackConfig(root, options.customWebpackConfig, karmaConfig);
  }
}

export default CustomWebpackKarmaBuilder;
