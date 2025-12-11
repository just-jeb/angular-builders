import { BuilderContext, BuilderHandlerFn } from '@angular-devkit/architect';
import { ExecutionTransformer } from '@angular-devkit/build-angular';
import type { IndexHtmlTransform } from '@angular/build/private';
import { Configuration } from 'webpack';
import { json } from '@angular-devkit/core';
export interface BuildTargetOptions {
    buildTarget: string;
}
export type BuilderExecutor<O extends BuildTargetOptions & json.JsonObject> = (options: O, context: BuilderContext, transforms?: {
    webpackConfiguration?: ExecutionTransformer<Configuration>;
    indexHtml?: IndexHtmlTransform;
}) => any;
export declare const executeBrowserBasedBuilder: <O extends BuildTargetOptions & json.JsonObject>(executebBuilder: BuilderExecutor<O>) => BuilderHandlerFn<O>;
