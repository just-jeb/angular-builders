import { BuilderContext } from '@angular-devkit/architect';
import {
  executeBrowserBuilder,
  executeDevServerBuilder,
  executeExtractI18nBuilder,
  executeKarmaBuilder,
  executeServerBuilder,
} from '@angular-devkit/build-angular';
import {
  BrowserBuilderOptions,
  DevServerBuilderOptions,
  ExtractI18nBuilderOptions,
  KarmaBuilderOptions,
  ServerBuilderOptions,
} from './custom-webpack-schema';
import {
  customWebpackConfigurationTransformFactory,
  indexHtmlTransformFactory,
  Transforms,
  transformsFactory,
} from './transform-factories';

type Options =
  | BrowserBuilderOptions
  | DevServerBuilderOptions
  | ExtractI18nBuilderOptions
  | KarmaBuilderOptions
  | KarmaBuilderOptions
  | ServerBuilderOptions;

export class CustomWebpack {
  constructor(
    protected options: Options,
    protected context: BuilderContext,
    protected transforms: Transforms
  ) {}

  executeBrowserBuilder(): ReturnType<typeof executeBrowserBuilder> {
    return executeBrowserBuilder(
      this.options as BrowserBuilderOptions,
      this.context,
      this.transforms
    );
  }

  executeDevServerBuilder(): ReturnType<typeof executeDevServerBuilder> {
    return executeDevServerBuilder(
      this.options as DevServerBuilderOptions,
      this.context,
      this.transforms
    );
  }

  executeExtractI18nBuilder(): ReturnType<typeof executeExtractI18nBuilder> {
    return executeExtractI18nBuilder(
      this.options as ExtractI18nBuilderOptions,
      this.context,
      this.transforms
    );
  }

  executeKarmaBuilder(): ReturnType<typeof executeKarmaBuilder> {
    const { webpackConfiguration } = this.transforms;
    return executeKarmaBuilder(this.options as KarmaBuilderOptions, this.context, {
      webpackConfiguration,
    });
  }

  executeServerBuilder(): ReturnType<typeof executeServerBuilder> {
    const { webpackConfiguration } = this.transforms;
    return executeServerBuilder(this.options as ServerBuilderOptions, this.context, {
      webpackConfiguration,
    });
  }
}

export const customWebpack = (options: Options, context: BuilderContext): CustomWebpack =>
  new CustomWebpack(
    options,
    context,
    transformsFactory(
      options,
      context,
      customWebpackConfigurationTransformFactory,
      indexHtmlTransformFactory
    )
  );
