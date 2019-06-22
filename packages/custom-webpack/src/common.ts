import { BuilderContext } from '@angular-devkit/architect';
import { ExecutionTransformer } from '@angular-devkit/build-angular';
import { normalize, getSystemPath } from '@angular-devkit/core';
import { Configuration } from 'webpack';
import { CustomWebpackBuilder } from './custom-webpack-builder';
import { CustomWebpackSchema } from './custom-webpack-schema';
import { IndexHtmlTransform } from '@angular-devkit/build-angular/src/angular-cli-files/utilities/index-file/write-index-html';

export const customWebpackConfigTransformFactory:
    (options: CustomWebpackSchema, context: BuilderContext) => ExecutionTransformer<Configuration> =
    (options, { workspaceRoot }) => (browserWebpackConfig) => {
        return CustomWebpackBuilder.buildWebpackConfig(
            normalize(workspaceRoot),
            options.customWebpackConfig,
            browserWebpackConfig,
            options //TODO: pass Target options as well (configuration option in particular)
        );
    }

export const indexHtmlTransformFactory:
    (options: CustomWebpackSchema, context: BuilderContext) => IndexHtmlTransform =
    ({ indexTransformFactory }, { workspaceRoot, target }) => {
        if (!indexTransformFactory) return null;
        const transformFactory = require(`${getSystemPath(normalize(workspaceRoot))}/${indexTransformFactory}`);
        return transformFactory(target);
    }

export const getTransforms = (options: CustomWebpackSchema, context: BuilderContext) => ({    
        webpackConfiguration: customWebpackConfigTransformFactory(options, context),
        indexHtml: indexHtmlTransformFactory(options, context)    
    })