/**
 * Created by Evgeny Barabanov on 05/10/2018.
 */

import {BuilderContext} from '@angular-devkit/architect';
import { NormalizedKarmaBuilderSchema} from '@angular-devkit/build-angular/src/utils';
import {KarmaBuilder} from '@angular-devkit/build-angular/src/karma';
import {Path, virtualFs} from '@angular-devkit/core';
import * as fs from 'fs';
import {CustomWebpackBuilder} from '../custom-webpack-builder';
import {Configuration} from 'webpack';
import {CustomWebpackSchema} from '../custom-webpack-schema';

export interface NormalizedCustomWebpackKarmaBuildSchema extends NormalizedKarmaBuilderSchema, CustomWebpackSchema {
}

export class CustomWebpackKarmaBuilder extends KarmaBuilder {

  constructor(context: BuilderContext) {
    super(context);
  }

  buildWebpackConfig(root: Path,
                     projectRoot: Path,
                     sourceRoot: Path,
                     host: virtualFs.Host<fs.Stats>,
                     options: NormalizedCustomWebpackKarmaBuildSchema): Configuration {
    const karmaConfig = super.buildWebpackConfig(root, projectRoot, sourceRoot, host, options);
	  return CustomWebpackBuilder.buildWebpackConfig(root, options.customWebpackConfig, karmaConfig, options);
  }
}

export default CustomWebpackKarmaBuilder;
