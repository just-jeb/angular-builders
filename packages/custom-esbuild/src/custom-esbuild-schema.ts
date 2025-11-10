import {
  ApplicationBuilderOptions,
  DevServerBuilderOptions,
  UnitTestBuilderOptions,
} from '@angular/build';

export type PluginConfig = string | { path: string; options?: Record<string, unknown> };

export type CustomEsbuildApplicationSchema = ApplicationBuilderOptions & {
  plugins?: PluginConfig[];
  indexHtmlTransformer?: string;
};

export type CustomEsbuildDevServerSchema = DevServerBuilderOptions & {
  middlewares?: string[];
};

// Omitting `runner` here as we only support `vitest` runner (`karma` runner doesn't support ESBuild plugins)
export type CustomEsbuildUnitTestSchema = Omit<UnitTestBuilderOptions, 'runner'> & {
  plugins?: PluginConfig[];
};
