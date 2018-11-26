/**
 * Created by Evgeny Barabanov on 28/06/2018.
 */

import {BuilderContext} from '@angular-devkit/architect';
import {CustomWebpackServerBuildSchema} from './schema';
import {ServerBuilder} from '@angular-devkit/build-angular';
import {Path, virtualFs} from '@angular-devkit/core';
import * as fs from 'fs';
import {BuildWebpackServerSchema} from '@angular-devkit/build-angular/src/server/schema';
import {CustomWebpackBuilder} from "../custom-webpack-builder";

export class CustomWebpackServerBuilder extends ServerBuilder {

	constructor(public context: BuilderContext) {
		super(context);
	}

	buildWebpackConfig(root: Path,
					   projectRoot: Path,
					   host: virtualFs.Host<fs.Stats>,
					   options: BuildWebpackServerSchema) {
		const serverWebpackConfig = super.buildWebpackConfig(root, projectRoot, host, options);
		const opt = options as CustomWebpackServerBuildSchema;
		return CustomWebpackBuilder.buildWebpackConfig(root, opt.customWebpackConfig, serverWebpackConfig, options) as any;
	}
}

export default CustomWebpackServerBuilder;
