import { BuilderContext } from '@angular-devkit/architect';
import {
  executeBrowserBuilder,
  executeDevServerBuilder,
  executeExtractI18nBuilder,
  executeKarmaBuilder,
  executeServerBuilder,
} from '@angular-devkit/build-angular';
import { Provider, InjectionToken, ReflectiveInjector } from 'injection-js';
import {
  BrowserBuilderOptions,
  DevServerBuilderOptions,
  ExtractI18nBuilderOptions,
  KarmaBuilderOptions,
  ServerBuilderOptions,
} from './custom-webpack-schema';
import { Transforms } from './transform-factories';
import {
  BUILD_CONTEXT_TOKEN,
  CUSTOM_WEBPACK_SCHEMA_TOKEN,
  TRANSFORMS_PROVIDERS,
  TRANSFORMS_TOKEN,
} from './transform-factories.di';

type Options =
  | BrowserBuilderOptions
  | DevServerBuilderOptions
  | ExtractI18nBuilderOptions
  | KarmaBuilderOptions
  | KarmaBuilderOptions
  | ServerBuilderOptions;

export class CustomWebpack {
  private transformsToken: InjectionToken<Transforms> = TRANSFORMS_TOKEN;

  constructor(protected providers: Provider[]) {}

  withProviders(providers: Provider[]): CustomWebpack {
    this.providers = [...this.providers, ...providers];
    return this;
  }

  withTransformsToken(token: InjectionToken<Transforms>): CustomWebpack {
    this.transformsToken = token;
    return this;
  }

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

  protected get context(): BuilderContext {
    const injector = ReflectiveInjector.resolveAndCreate(this.providers);
    return injector.get(BUILD_CONTEXT_TOKEN) as BuilderContext;
  }

  protected get options(): Options {
    const injector = ReflectiveInjector.resolveAndCreate(this.providers);
    return injector.get(CUSTOM_WEBPACK_SCHEMA_TOKEN);
  }

  protected get transforms(): Transforms {
    const injector = ReflectiveInjector.resolveAndCreate(this.providers);
    return injector.get(this.transformsToken) as Transforms;
  }
}

export const customWebpack = (): CustomWebpack => new CustomWebpack([...TRANSFORMS_PROVIDERS]);
