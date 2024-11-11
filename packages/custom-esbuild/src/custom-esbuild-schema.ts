import { ApplicationBuilderOptions, DevServerBuilderOptions } from '@angular-devkit/build-angular';

export type PluginConfig = string | { path: string; options?: Record<string, unknown> };

export type CustomEsbuildApplicationSchema = ApplicationBuilderOptions & {
  plugins?: string[];
  indexHtmlTransformer?: string;
};

export type CustomEsbuildDevServerSchema = DevServerBuilderOptions & {
  middlewares?: string[];
};
