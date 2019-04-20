import { BuilderContext } from '@angular-devkit/architect';
import { ExecutionTransformer } from '@angular-devkit/build-angular';
import { normalize } from '@angular-devkit/core';
import { Configuration } from 'webpack';
import { CustomWebpackBuilder } from './custom-webpack-builder';
import { CustomWebpackSchema } from './custom-webpack-schema';

export const customWebpackConfigTransformFactory:
    (options: CustomWebpackSchema, context: BuilderContext) => ExecutionTransformer<Configuration> =
    (options, { workspaceRoot }) => (browserWebpackConfig) => {
        return CustomWebpackBuilder.buildWebpackConfig(
            normalize(workspaceRoot),
            options.customWebpackConfig,
            browserWebpackConfig,
            options
        );
    }